import { NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getRazorpayClient } from "@/lib/razorpay";
import { getPaymentSessionCookieName, verifyPaymentSessionCookieValue } from "@/lib/payment-session-binding";

export async function GET(req: Request) {
  const orderId = new URL(req.url).searchParams.get("orderId") || "";
  if (!orderId) return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
  const cookie = req.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${getPaymentSessionCookieName(orderId)}=`))?.split("=").slice(1).join("=");
  const binding = verifyPaymentSessionCookieValue(cookie || "");
  if (!binding.ok || binding.payload.orderId !== orderId) return NextResponse.json({ message: "Payment session is invalid" }, { status: 403 });
  const snapshot = await getDocs(query(collection(db, "payments"), where("orderId", "==", orderId)));
  if (snapshot.empty) return NextResponse.json({ message: "Payment not found" }, { status: 404 });
  const payment = snapshot.docs[0].data();
  if (payment.gateway !== "razorpay") return NextResponse.json({ message: "Payment is not available" }, { status: 409 });
  if (payment.status === "SUCCESS") return NextResponse.json({ alreadyPaid: true, orderId });
  if (payment.status !== "PENDING") return NextResponse.json({ message: "Payment is not available" }, { status: 409 });
  try {
    const { keyId } = getRazorpayClient();
    return NextResponse.json({ keyId, orderId: payment.orderId, razorpayOrderId: payment.razorpayOrderId, amount: Math.round(Number(payment.amount) * 100), currency: payment.currency || "INR", name: payment.studentName || payment.workshopName || payment.courseName || "Cyborg Robotics", email: payment.parentEmail || payment.studentEmail || "", phone: payment.parentPhone || "" });
  } catch {
    return NextResponse.json({ message: "Payment gateway is not configured" }, { status: 503 });
  }
}
