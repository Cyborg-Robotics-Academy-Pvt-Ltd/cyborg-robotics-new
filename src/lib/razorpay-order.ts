import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getRazorpayClient } from "@/lib/razorpay";

type CreateRazorpayOrderInput = {
  orderId: string;
  amount: number;
  customerId: string;
  customerEmail?: string;
  customerPhone?: string;
  paymentData: Record<string, unknown>;
};

export async function createRazorpayOrder(input: CreateRazorpayOrderInput) {
  const { client, keyId } = getRazorpayClient();
  const order = await client.orders.create({
    amount: Math.round(input.amount * 100),
    currency: "INR",
    receipt: input.orderId.slice(0, 40),
    notes: { internalOrderId: input.orderId },
  });
  await addDoc(collection(db, "payments"), {
    ...input.paymentData,
    orderId: input.orderId,
    razorpayOrderId: order.id,
    customerId: input.customerId,
    gateway: "razorpay",
    paymentGateway: "razorpay",
    gatewayTransactionId: null,
    gatewayVerification: null,
    amount: input.amount,
    currency: "INR",
    status: "PENDING",
    createdAt: serverTimestamp(),
  });
  return {
    paymentUrl: `/payment/razorpay?orderId=${encodeURIComponent(input.orderId)}`,
    orderId: input.orderId,
    razorpayOrderId: order.id,
    keyId,
    amount: order.amount,
    currency: order.currency,
    customerEmail: input.customerEmail || "",
    customerPhone: input.customerPhone || "",
  };
}
