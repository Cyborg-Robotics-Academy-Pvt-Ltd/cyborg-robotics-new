import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { isValidOrderId } from "@/lib/order-id-utils";
import { extractBankRef, safeWritePaymentAuditLog } from "@/lib/payment-audit-log";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { finalizeRegistrationForPayment } from "@/lib/payment-finalize";

// Update Firestore payment record status
async function updatePaymentStatus(
  orderId: string,
  status: string,
  txnId: string
): Promise<boolean> {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("orderId", "==", orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error(`No payment record found for orderId: ${orderId}`);
      return false;
    }

    const paymentDoc = snapshot.docs[0];
    const existing = paymentDoc.data();

    // Idempotency - don't overwrite a SUCCESS record
    if (existing.status === "SUCCESS") {
      console.warn(`Payment ${orderId} already marked SUCCESS - skipping update`);
      return true;
    }

    await updateDoc(doc(db, "payments", paymentDoc.id), {
      status,
      transactionReference: txnId,
      updatedAt: serverTimestamp(),
    });

    console.log(`Firestore updated: ${orderId} -> ${status}`);
    return true;
  } catch (error) {
    console.error("Firestore update error:", error);
    return false;
  }
}

// POST - Juspay webhook callback (server-to-server)
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const rawText = await req.text();

    let body: Record<string, any> | null = null;

    // Parse JSON
    const requestPath = new URL(req.url).pathname;

    if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(rawText);
        console.log("=== WEBHOOK RECEIVED (JSON) ===");
        console.log("event_name:", body?.event_name);
        console.log("id:", body?.id);
      } catch (e) {
        console.error("Failed to parse JSON webhook body:", e);
        await safeWritePaymentAuditLog({
          eventType: "webhook_received",
          source: "payment_webhook_post",
          success: false,
          reason: "Invalid JSON payload",
          requestMethod: req.method,
          requestPath,
          rawRequest: rawText,
        });
        return NextResponse.json(
          { success: false, message: "Invalid JSON payload" },
          { status: 400 }
        );
      }
    } else {
      console.error("Unsupported content type:", contentType);
      await safeWritePaymentAuditLog({
        eventType: "webhook_received",
        source: "payment_webhook_post",
        success: false,
        reason: "Unsupported content type",
        requestMethod: req.method,
        requestPath,
        rawRequest: rawText,
      });
      return NextResponse.json(
        { success: false, message: "Unsupported content type" },
        { status: 400 }
      );
    }

    // Extract order data from webhook payload
    const orderData = body?.content?.order || body;

    if (!orderData?.order_id) {
      console.error("Could not extract order_id from webhook payload");
      await safeWritePaymentAuditLog({
        eventType: "webhook_received",
        source: "payment_webhook_post",
        success: false,
        reason: "Missing order_id",
        requestMethod: req.method,
        requestPath,
        rawRequest: rawText,
      });
      return NextResponse.json(
        { success: false, message: "Missing order_id" },
        { status: 400 }
      );
    }

    const orderId = orderData.order_id;
    const status = orderData.status || "PENDING";
    const txnId = orderData.txn_id || "";

    console.log("=== WEBHOOK DATA ===");
    console.log("order_id:", orderId);
    console.log("status:", status);
    console.log("txn_id:", txnId);

    if (!isValidOrderId(orderId)) {
      console.error("Invalid or missing order_id:", orderId);
      await safeWritePaymentAuditLog({
        eventType: "webhook_received",
        source: "payment_webhook_post",
        orderId,
        success: false,
        reason: "Invalid order ID",
        requestMethod: req.method,
        requestPath,
        rawRequest: rawText,
      });
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    // Map Juspay status to internal status
    const confirmedStatus =
      status === "CHARGED" || status === "SUCCESS"
        ? "SUCCESS"
        : status === "AUTHORIZATION_FAILED" ||
          status === "AUTHENTICATION_FAILED" ||
          status === "JUSPAY_DECLINED"
        ? "FAILED"
        : status;

    // --- Update Firestore ---
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("orderId", "==", orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error(`No payment record found for orderId: ${orderId}`);
      await safeWritePaymentAuditLog({
        eventType: "webhook_status_update",
        source: "payment_webhook_post",
        orderId,
        status: confirmedStatus,
        txnId,
        bankRef: extractBankRef(orderData),
        success: false,
        reason: "Payment record not found",
        requestMethod: req.method,
        requestPath,
        rawRequest: rawText,
      });
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    const paymentDoc = snapshot.docs[0];
    const existing = paymentDoc.data();
    if (existing.status === "SUCCESS") {
      await safeWritePaymentAuditLog({
        eventType: "webhook_finalized",
        source: "payment_webhook_post",
        orderId,
        status: existing.status,
        txnId: existing.transactionReference || txnId || null,
        bankRef: extractBankRef(existing),
        success: true,
        requestMethod: req.method,
        requestPath,
        rawRequest: rawText,
        metadata: { idempotent: true },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const isFailureStatus =
      confirmedStatus === "FAILED" ||
      confirmedStatus === "AUTHORIZATION_FAILED" ||
      confirmedStatus === "AUTHENTICATION_FAILED" ||
      confirmedStatus === "JUSPAY_DECLINED";

    await updatePaymentStatus(orderId, confirmedStatus, txnId);

    await safeWritePaymentAuditLog({
      eventType: isFailureStatus ? "webhook_status_update" : "webhook_finalized",
      source: "payment_webhook_post",
      orderId,
      status: confirmedStatus,
      txnId,
      bankRef: extractBankRef(orderData),
      success: !isFailureStatus,
      reason: isFailureStatus ? "Gateway returned failed status" : null,
      requestMethod: req.method,
      requestPath,
      rawRequest: rawText,
      rawResponse: orderData,
      metadata: {
        failed: isFailureStatus,
      },
    });

    if (confirmedStatus === "SUCCESS") {
      await finalizeRegistrationForPayment(orderId, txnId);
    }

    // Return success to Juspay (no redirect, this is server-to-server)
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}





