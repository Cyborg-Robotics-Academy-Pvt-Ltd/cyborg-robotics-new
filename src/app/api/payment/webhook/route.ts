import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
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

// Validate orderId format
function isValidOrderId(orderId: string | null | undefined): boolean {
  if (!orderId) return false;
  return /^ORDER_[a-f0-9\-]{36}$/.test(orderId);
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

    // Idempotency — don't overwrite a SUCCESS record
    if (existing.status === "SUCCESS") {
      console.warn(`Payment ${orderId} already marked SUCCESS — skipping update`);
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

// POST — Juspay webhook callback (server-to-server)
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const rawText = await req.text();

    let body: Record<string, any> | null = null;

    // Parse JSON
    if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(rawText);
        console.log("=== WEBHOOK RECEIVED (JSON) ===");
        console.log("event_name:", body?.event_name);
        console.log("id:", body?.id);
      } catch (e) {
        console.error("Failed to parse JSON webhook body:", e);
        return NextResponse.json(
          { success: false, message: "Invalid JSON payload" },
          { status: 400 }
        );
      }
    } else {
      console.error("Unsupported content type:", contentType);
      return NextResponse.json(
        { success: false, message: "Unsupported content type" },
        { status: 400 }
      );
    }

    // Extract order data from webhook payload
    const orderData = body?.content?.order || body;

    if (!orderData?.order_id) {
      console.error("Could not extract order_id from webhook payload");
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
    await updatePaymentStatus(orderId, confirmedStatus, txnId);

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
