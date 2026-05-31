import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { finalizeRegistrationForPayment } from "@/lib/payment-finalize";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const ALLOWED_STATUSES = new Set(["PENDING", "SUCCESS", "FAILED", "CASH_PAY"]);

const REGISTRATION_COLLECTIONS: Record<string, string> = {
  new: "registrations",
  renewal: "renewals",
  workshop: "workshopRegistrations",
  competition: "competitionRegistrations",
  other: "otherRegistrations",
};

function normalizeManualStatus(status: unknown) {
  const raw = String(status || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (raw === "CASH" || raw === "CASHPAY" || raw === "CASH_PAYMENT") {
    return "CASH_PAY";
  }

  return raw;
}

function mapPaymentStatusToRecordStatus(paymentStatus: string) {
  if (paymentStatus === "SUCCESS" || paymentStatus === "CASH_PAY") {
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
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
    const paymentDocId =
      typeof body?.paymentDocId === "string" ? body.paymentDocId.trim() : "";
    const firestoreId =
      typeof body?.firestoreId === "string" ? body.firestoreId.trim() : "";
    const registrationType =
      typeof body?.registrationType === "string" ? body.registrationType : "new";
    const collectionName =
      REGISTRATION_COLLECTIONS[registrationType] || REGISTRATION_COLLECTIONS.new;
    const nextStatus = normalizeManualStatus(body?.status);

    if (!ALLOWED_STATUSES.has(nextStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid payment status" },
        { status: 400 },
      );
    }

    if (!orderId && !paymentDocId && !firestoreId) {
      return NextResponse.json(
        { success: false, message: "Missing registration or payment reference" },
        { status: 400 },
      );
    }

    const updatePayload = {
      status: nextStatus,
      paymentStatus: nextStatus,
      manuallyUpdatedStatus: true,
      manualStatusUpdatedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const paymentRefs = [];

    if (paymentDocId) {
      paymentRefs.push(doc(db, "payments", paymentDocId));
    } else if (orderId) {
      const paymentSnapshot = await getDocs(
        query(collection(db, "payments"), where("orderId", "==", orderId)),
      );
      paymentSnapshot.forEach((paymentDoc) => paymentRefs.push(paymentDoc.ref));
    }

    for (const paymentRef of paymentRefs) {
      await updateDoc(paymentRef, updatePayload);
    }

    const recordStatus = mapPaymentStatusToRecordStatus(nextStatus);
    const registrationRefs = [];

    if (firestoreId) {
      registrationRefs.push(doc(db, collectionName, firestoreId));
    } else if (orderId) {
      const registrationSnapshot = await getDocs(
        query(collection(db, collectionName), where("orderId", "==", orderId)),
      );
      registrationSnapshot.forEach((registrationDoc) =>
        registrationRefs.push(registrationDoc.ref),
      );
    }

    for (const registrationRef of registrationRefs) {
      await updateDoc(registrationRef, {
        paymentStatus: nextStatus,
        status: recordStatus,
        updatedAt: serverTimestamp(),
      });
    }

    let finalizedRegistrationId: string | null = null;
    if (orderId && (nextStatus === "SUCCESS" || nextStatus === "CASH_PAY")) {
      const finalizeResult = await finalizeRegistrationForPayment(
        orderId,
        nextStatus === "CASH_PAY" ? "CASH_PAY" : "MANUAL_VERIFIED",
      );
      finalizedRegistrationId = finalizeResult.registrationId || null;
    }

    return NextResponse.json({
      success: true,
      paymentStatus: nextStatus,
      status: recordStatus,
      registrationId: finalizedRegistrationId,
    });
  } catch (error) {
    console.error("Manual registration payment status update failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update registration payment status",
      },
      { status: 500 },
    );
  }
}
