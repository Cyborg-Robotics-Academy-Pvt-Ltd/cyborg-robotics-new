import { NextResponse } from "next/server";
import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { fetchOrCaptureRazorpayPayment } from "@/lib/razorpay";
import { finalizeRegistrationForPayment } from "@/lib/payment-finalize";
import { safeWritePaymentAuditLog } from "@/lib/payment-audit-log";

export async function POST(req: Request) {
  const rawBody = await req.text();
  if (!verifyRazorpayWebhookSignature(rawBody, req.headers.get("x-razorpay-signature"))) return NextResponse.json({ success: false, message: "Invalid webhook signature" }, { status: 400 });
  try {
    const event = JSON.parse(rawBody);
    if (!["payment.authorized", "payment.captured", "payment.failed"].includes(event.event)) return NextResponse.json({ success: true, ignored: true });
    const entity = event.payload?.payment?.entity;
    if (!entity?.order_id || !entity?.id) return NextResponse.json({ success: false, message: "Missing payment details" }, { status: 400 });
    if (event.event === "payment.captured" && entity.status !== "captured") return NextResponse.json({ success: false, message: "Payment is not captured" }, { status: 400 });
    const snapshot = await getDocs(query(collection(db, "payments"), where("razorpayOrderId", "==", entity.order_id)));
    if (snapshot.empty) return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    const record = snapshot.docs[0];
    const payment = record.data();
    if (payment.gateway !== "razorpay" || entity.amount !== Math.round(Number(payment.amount) * 100) || entity.currency !== (payment.currency || "INR")) return NextResponse.json({ success: false, message: "Payment details do not match the order" }, { status: 400 });
    const gatewayPayment = event.event === "payment.failed"
      ? entity
      : await fetchOrCaptureRazorpayPayment(entity.id, entity.amount, entity.currency || "INR");
    const succeeded = gatewayPayment.status === "captured";
    if (payment.status !== "SUCCESS") {
      await updateDoc(doc(db, "payments", record.id), { status: succeeded ? "SUCCESS" : "FAILED", transactionReference: entity.id, gatewayTransactionId: entity.id, gatewayVerification: { webhookSignatureVerified: true, amountVerified: true, eventId: event.id || null, event: event.event }, gatewayResponse: entity, updatedAt: serverTimestamp() });
    }
    await safeWritePaymentAuditLog({ eventType: succeeded ? "webhook_finalized" : "webhook_status_update", source: "payment_webhook_post", orderId: payment.orderId, status: succeeded ? "SUCCESS" : "FAILED", txnId: entity.id, success: succeeded, metadata: { gateway: "razorpay", eventId: event.id || null, idempotent: payment.status === "SUCCESS" } });
    if (succeeded) await finalizeRegistrationForPayment(payment.orderId, entity.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed:", error);
    return NextResponse.json({ success: false, message: "Webhook processing failed" }, { status: 500 });
  }
}
