import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { finalizeRegistrationForPayment } from "@/lib/payment-finalize";
import { isValidOrderId } from "@/lib/order-id-utils";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const ALLOWED_STATUSES = new Set(["PENDING", "SUCCESS", "FAILED"]);

function mapPaymentStatusToRecordStatus(paymentStatus: string) {
  if (paymentStatus === "SUCCESS") {
    return "confirmed";
  }

  if (paymentStatus === "FAILED") {
    return "failed";
  }

  return "pending-payment";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = typeof body?.orderId === "string" ? body.orderId : "";
    const nextStatus =
      typeof body?.status === "string" ? body.status.toUpperCase() : "";

    if (!isValidOrderId(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    if (!ALLOWED_STATUSES.has(nextStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment status" },
        { status: 400 },
      );
    }

    const paymentsRef = collection(db, "payments");
    const paymentQuery = query(
      paymentsRef,
      where("orderId", "==", orderId),
      where("paymentFlow", "==", "competition"),
    );
    const paymentSnapshot = await getDocs(paymentQuery);

    if (paymentSnapshot.empty) {
      return NextResponse.json(
        { success: false, message: "Competition payment not found" },
        { status: 404 },
      );
    }

    const paymentDoc = paymentSnapshot.docs[0];
    const paymentData = paymentDoc.data();
    const currentStatus = String(paymentData.status || "PENDING").toUpperCase();

    if (
      (currentStatus === "SUCCESS" || currentStatus === "CHARGED") &&
      nextStatus !== "SUCCESS"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Confirmed competition payments cannot be changed manually.",
        },
        { status: 409 },
      );
    }

    await updateDoc(doc(db, "payments", paymentDoc.id), {
      status: nextStatus,
      paymentStatus: nextStatus,
      manuallyUpdatedStatus: true,
      manualStatusUpdatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (nextStatus === "SUCCESS") {
      await finalizeRegistrationForPayment(
        orderId,
        paymentData.transactionReference || "MANUAL_VERIFIED",
      );
    }

    const competitionRegistrationsRef = collection(db, "competitionRegistrations");
    const registrationQuery = query(
      competitionRegistrationsRef,
      where("orderId", "==", orderId),
    );
    const registrationSnapshot = await getDocs(registrationQuery);

    for (const registrationDoc of registrationSnapshot.docs) {
      await updateDoc(doc(db, "competitionRegistrations", registrationDoc.id), {
        paymentStatus: nextStatus,
        status: mapPaymentStatusToRecordStatus(nextStatus),
        updatedAt: serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      paymentStatus: nextStatus,
      status: mapPaymentStatusToRecordStatus(nextStatus),
    });
  } catch (error) {
    console.error("Manual competition payment status update failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update competition payment status",
      },
      { status: 500 },
    );
  }
}
