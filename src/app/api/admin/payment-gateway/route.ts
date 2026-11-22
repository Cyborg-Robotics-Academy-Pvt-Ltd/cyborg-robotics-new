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
    const email = String(decoded.email || "").trim().toLowerCase();
    if (email === PAYMENT_GATEWAY_ADMIN_EMAIL) {
      return { uid: decoded.uid, email };
    }

    const profile = await adminDb.collection("admins").doc(decoded.uid).get();
    return profile.exists ? { uid: decoded.uid, email } : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const admin = await getAdminIdentity(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unable to verify your account for payment settings. Please sign in again or contact support." },
        { status: 401 },
      );
    }
    if (admin.email !== PAYMENT_GATEWAY_ADMIN_EMAIL) {
      return NextResponse.json({ message: "Not allowed to manage the payment provider" }, { status: 403 });
    }

    const snapshot = await adminDb.doc("settings/payment-gateway").get();
    const activeGateway: ActivePaymentGateway =
      snapshot.data()?.activeGateway === "hdfc" ? "hdfc" : "razorpay";
    return NextResponse.json({ activeGateway });
  } catch (error) {
    console.error("Unable to load payment gateway settings:", error);
    return NextResponse.json(
      { message: "Could not load payment settings. Please try again." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminIdentity(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unable to verify your account for payment settings. Please sign in again or contact support." },
        { status: 401 },
      );
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
  } catch (error) {
    console.error("Unable to save payment gateway settings:", error);
    return NextResponse.json(
      { message: "Could not update payment settings. Please try again." },
      { status: 500 },
    );
  }
}
