import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { ActivePaymentGateway } from "@/lib/payment-gateway-settings";

const PAYMENT_GATEWAY_ADMIN_EMAIL = "shrikantg199@gmail.com";

async function getAdminIdentity(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const profile = await adminDb.collection("admins").doc(decoded.uid).get();
    return profile.exists
      ? { uid: decoded.uid, email: String(decoded.email || "").toLowerCase() }
      : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const admin = await getAdminIdentity(request);
  if (!admin) {
    return NextResponse.json({ message: "Admin access required" }, { status: 401 });
  }
  if (admin.email !== PAYMENT_GATEWAY_ADMIN_EMAIL) {
    return NextResponse.json({ message: "Not allowed to manage the payment provider" }, { status: 403 });
  }

  const snapshot = await adminDb.doc("settings/payment-gateway").get();
  const activeGateway: ActivePaymentGateway =
    snapshot.data()?.activeGateway === "hdfc" ? "hdfc" : "razorpay";
  return NextResponse.json({ activeGateway });
}

export async function PATCH(request: Request) {
  const admin = await getAdminIdentity(request);
  if (!admin) {
    return NextResponse.json({ message: "Admin access required" }, { status: 401 });
  }
  if (admin.email !== PAYMENT_GATEWAY_ADMIN_EMAIL) {
    return NextResponse.json({ message: "Not allowed to manage the payment provider" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const activeGateway = body?.activeGateway;
  if (activeGateway !== "razorpay" && activeGateway !== "hdfc") {
    return NextResponse.json({ message: "Select a valid payment provider" }, { status: 400 });
  }

  await adminDb.doc("settings/payment-gateway").set({
    activeGateway,
    updatedAt: new Date().toISOString(),
    updatedBy: admin.uid,
  }, { merge: true });

  return NextResponse.json({ success: true, activeGateway });
}
