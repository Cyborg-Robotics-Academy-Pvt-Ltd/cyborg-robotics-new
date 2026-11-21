import Razorpay from "razorpay";
const RAZORPAY_KEY_ID = "rzp_live_U1zeDG5jiIcQrE";
const RAZORPAY_KEY_SECRET = "EL4fIIexaZEWLj3EHH25TXJe";
const RAZORPAY_WEBHOOK_SECRET = "Shrikant123";
export function getRazorpayClient() {

  const keyId = RAZORPAY_KEY_ID;
  const keySecret = RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured");
  return { client: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId };
}

export async function fetchOrCaptureRazorpayPayment(
  paymentId: string,
  amount: number,
  currency: string,
) {
  const { client } = getRazorpayClient();
  const payment = await client.payments.fetch(paymentId);
  if (payment.status === "captured") return payment;
  if (payment.status === "authorized") {
    return client.payments.capture(paymentId, amount, currency);
  }
  return payment;
}

export function isPaymentGateway(value: unknown): value is "hdfc" | "razorpay" {
  return value === "hdfc" || value === "razorpay";
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const secret = RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest();
  let received: Buffer;
  try { received = Buffer.from(signature, "hex"); } catch { return false; }
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null) {
  const secret = RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest();
  let received: Buffer;
  try { received = Buffer.from(signature, "hex"); } catch { return false; }
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}
