import { adminDb } from "@/lib/firebase-admin";

export type ActivePaymentGateway = "razorpay" | "hdfc";

const PAYMENT_SETTINGS_DOC = "settings/payment-gateway";

export async function getActivePaymentGateway(): Promise<ActivePaymentGateway> {
  const snapshot = await adminDb.doc(PAYMENT_SETTINGS_DOC).get();
  const gateway = snapshot.data()?.activeGateway;
  return gateway === "hdfc" ? "hdfc" : "razorpay";
}
