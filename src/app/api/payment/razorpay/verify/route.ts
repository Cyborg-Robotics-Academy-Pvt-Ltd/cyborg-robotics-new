import { NextResponse } from "next/server";
import { collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchOrCaptureRazorpayPayment, getRazorpayClient, verifyRazorpaySignature } from "@/lib/razorpay";
import { finalizeRegistrationForPayment } from "@/lib/payment-finalize";
import { safeWritePaymentAuditLog } from "@/lib/payment-audit-log";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: signature } = body || {};
    if (typeof orderId !== "string" || typeof razorpayOrderId !== "string" || typeof razorpayPaymentId !== "string" || typeof signature !== "string") return NextResponse.json({ success: false, message: "Invalid payment response" }, { status: 400 });
    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, signature)) return NextResponse.json({ success: false, message: "Payment signature verification failed" }, { status: 400 });
    const snapshot = await getDocs(query(collection(db, "payments"), where("orderId", "==", orderId)));
    if (snapshot.empty) return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    const record = snapshot.docs[0];
    const payment = record.data();
    if (payment.gateway !== "razorpay" || payment.razorpayOrderId !== razorpayOrderId) return NextResponse.json({ success: false, message: "Order does not match payment" }, { status: 400 });
    if (payment.status === "SUCCESS") return NextResponse.json({ success: true, status: "SUCCESS", orderId });
    const { client } = getRazorpayClient();
    const [gatewayOrder, initialPayment] = await Promise.all([client.orders.fetch(razorpayOrderId), client.payments.fetch(razorpayPaymentId)]);
    const gatewayPayment = await fetchOrCaptureRazorpayPayment(razorpayPaymentId, Math.round(Number(payment.amount) * 100), payment.currency || "INR");
    if (initialPayment.order_id !== razorpayOrderId || gatewayPayment.order_id !== razorpayOrderId || gatewayPayment.amount !== Math.round(Number(payment.amount) * 100) || gatewayPayment.currency !== (payment.currency || "INR") || gatewayOrder.amount !== gatewayPayment.amount) return NextResponse.json({ success: false, message: "Payment details do not match the order" }, { status: 400 });
    if (gatewayPayment.status !== "captured") return NextResponse.json({ success: false, status: "PENDING", message: "Payment has not been captured yet" }, { status: 202 });
    await updateDoc(doc(db, "payments", record.id), { status: "SUCCESS", transactionReference: razorpayPaymentId, gatewayTransactionId: razorpayPaymentId, gatewayVerification: { signatureVerified: true, amountVerified: true, verifiedAt: new Date().toISOString() }, gatewayResponse: { paymentId: gatewayPayment.id, orderId: gatewayPayment.order_id, status: gatewayPayment.status }, updatedAt: serverTimestamp() });
    await safeWritePaymentAuditLog({ eventType: "status_verify", source: "payment_status_put", orderId, status: "SUCCESS", txnId: razorpayPaymentId, success: true, metadata: { gateway: "razorpay", verification: "checkout_signature_and_api" } });
    await finalizeRegistrationForPayment(orderId, razorpayPaymentId);
    return NextResponse.json({ success: true, status: "SUCCESS", orderId });
  } catch (error) {
    console.error("Razorpay verification failed:", error);
    return NextResponse.json({ success: false, message: "Unable to verify payment" }, { status: 500 });
  }
}
