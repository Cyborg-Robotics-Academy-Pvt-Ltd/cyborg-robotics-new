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

function normalizeAmount(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function getGatewayTransactionId(payload: Record<string, any>): string {
  const txnDetail = payload.txn_detail || {};
  const gatewayResponse = payload.payment_gateway_response || {};
  return String(
    payload.txn_id ||
      payload.transaction_id ||
      payload.transactionReference ||
      txnDetail.txn_id ||
      gatewayResponse.epg_txn_id ||
      gatewayResponse.txn_id ||
      payload.txn_uuid ||
      payload.payment?.transaction_id ||
      payload.payment?.id ||
      "",
  ).trim();
}

function getGatewayBankReference(payload: Record<string, any>): string | null {
  return (
    extractBankRef(payload) ||
    payload.payment_gateway_response?.rrn ||
    payload.txn_detail?.payment_gateway_response?.rrn ||
    null
  );
}

async function verifyCodefestHdfcOrder(orderId: string) {
  const baseUrl = process.env.JUSPAY_BASE_URL;
  const merchantId = process.env.HDFC_MERCHANT_ID;
  const apiKey = process.env.HDFC_API_KEY;
  if (!baseUrl || !merchantId || !apiKey) {
    throw new Error("HDFC/Juspay verification is not configured");
  }

  const response = await fetch(`${baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      "x-merchantid": merchantId,
      Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Juspay order verification failed (${response.status})`);
  const verifiedOrder = (await response.json()) as Record<string, any>;
  if (verifiedOrder.order_id !== orderId) {
    throw new Error("Juspay returned a different order ID");
  }
  return verifiedOrder;
}

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

    // CodeFest is production-critical: never finalize it from the webhook's
    // status field alone. Confirm the order directly with HDFC/Juspay and
    // compare the charged amount with our stored amount first.
    if (existing.paymentFlow === "competition" && existing.gateway !== "razorpay") {
      let verifiedOrder: Record<string, any>;
      try {
        verifiedOrder = await verifyCodefestHdfcOrder(orderId);
      } catch (verificationError) {
        console.error("CodeFest HDFC webhook verification failed:", verificationError);
        await safeWritePaymentAuditLog({
          eventType: "status_verify",
          source: "payment_webhook_post",
          orderId,
          status: existing.status,
          success: false,
          reason: "Unable to verify CodeFest order with HDFC/Juspay",
          requestMethod: req.method,
          requestPath,
          rawRequest: rawText,
        });
        return NextResponse.json(
          { success: false, message: "Unable to verify payment with HDFC/Juspay" },
          { status: 502 },
        );
      }

      const gatewayStatus = String(verifiedOrder.status || "PENDING").toUpperCase();
      const expectedAmount = normalizeAmount(existing.amount);
      const confirmedAmount = normalizeAmount(verifiedOrder.amount);
      const expectedCurrency = String(existing.currency || "INR").toUpperCase();
      const confirmedCurrency = String(verifiedOrder.currency || "").toUpperCase();
      const currencyMatches = confirmedCurrency === expectedCurrency;
      const amountMatches =
        expectedAmount !== null &&
        confirmedAmount !== null &&
        expectedAmount === confirmedAmount &&
        currencyMatches;
      const isCharged = gatewayStatus === "CHARGED" && amountMatches;
      const isGatewayFailure = [
        "AUTHORIZATION_FAILED",
        "AUTHENTICATION_FAILED",
        "JUSPAY_DECLINED",
      ].includes(gatewayStatus);
      const nextStatus = isCharged
        ? "SUCCESS"
        : isGatewayFailure
          ? "FAILED"
          : gatewayStatus;
      const verifiedTxnId = getGatewayTransactionId(verifiedOrder) || txnId;
      const verifiedBankRef = getGatewayBankReference(verifiedOrder);

      if (gatewayStatus === "CHARGED" && !amountMatches) {
        await safeWritePaymentAuditLog({
          eventType: "return_amount_check",
          source: "payment_webhook_post",
          orderId,
          status: gatewayStatus,
          amount: confirmedAmount,
          txnId: verifiedTxnId || null,
          bankRef: verifiedBankRef,
          success: false,
          reason: "CodeFest HDFC amount or currency did not match the stored order",
          requestMethod: req.method,
          requestPath,
          rawResponse: verifiedOrder,
        });
        return NextResponse.json({ success: true }, { status: 200 });
      }

      const statusCanBeUpdated = true;
      const patch: Record<string, unknown> = {
        gatewayResponse: verifiedOrder,
        gatewayVerification: {
          verifiedWithHdfc: true,
          amountMatches,
          verifiedAt: new Date().toISOString(),
        },
        updatedAt: serverTimestamp(),
      };
      if (statusCanBeUpdated) patch.status = nextStatus;
      if (verifiedTxnId && (!existing.transactionReference || isCharged)) {
        patch.transactionReference = verifiedTxnId;
        patch.gatewayTransactionId = verifiedTxnId;
      }
      if (verifiedBankRef) patch.bankRef = verifiedBankRef;

      await updateDoc(doc(db, "payments", paymentDoc.id), patch);
      const competitionRegistrations = await getDocs(
        query(
          collection(db, "competitionRegistrations"),
          where("orderId", "==", orderId),
        ),
      );
      if (!competitionRegistrations.empty) {
        await updateDoc(
          doc(db, "competitionRegistrations", competitionRegistrations.docs[0].id),
          {
            paymentStatus: nextStatus,
            ...(verifiedTxnId ? { paymentId: verifiedTxnId } : {}),
            updatedAt: serverTimestamp(),
          },
        );
      }
      await safeWritePaymentAuditLog({
        eventType: isCharged ? "webhook_finalized" : "webhook_status_update",
        source: "payment_webhook_post",
        orderId,
        status: statusCanBeUpdated ? nextStatus : existing.status,
        amount: confirmedAmount,
        txnId: verifiedTxnId || null,
        bankRef: verifiedBankRef,
        success: isCharged,
        reason: isCharged ? null : `HDFC/Juspay order status: ${gatewayStatus}`,
        requestMethod: req.method,
        requestPath,
        rawRequest: rawText,
        rawResponse: verifiedOrder,
        metadata: { gateway: "hdfc", paymentFlow: "competition", amountMatches, currencyMatches },
      });

      if (isCharged) await finalizeRegistrationForPayment(orderId, verifiedTxnId);
      return NextResponse.json({ success: true }, { status: 200 });
    }

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





