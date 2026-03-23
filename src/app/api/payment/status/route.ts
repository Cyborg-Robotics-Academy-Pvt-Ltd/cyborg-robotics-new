import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

// Validate orderId format
function isValidOrderId(orderId: string | null): boolean {
  if (!orderId) return false;
  return /^ORDER_[a-f0-9\-]{36}$/.test(orderId);
}

// GET — fetch payment status from Firestore only
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id") || searchParams.get("orderId");

    if (!isValidOrderId(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing order ID" },
        { status: 400 }
      );
    }

    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("orderId", "==", orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    const paymentData = snapshot.docs[0].data();

    // Return only what the UI needs — no extra PII
    return NextResponse.json({
      success: true,
      payment: {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        status: paymentData.status,
        transactionReference: paymentData.transactionReference,
        studentName:
          paymentData?.registrationDraft?.studentName || paymentData.studentName,
        courseName: paymentData?.course?.name || paymentData.courseName,
        invoiceNumber: paymentData.invoiceNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}

// PUT — verify payment status against Juspay server-to-server
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    // Only accept orderId from body — never accept amount or referenceId from client
    if (!isValidOrderId(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing order ID" },
        { status: 400 }
      );
    }

    const JUSPAY_BASE_URL = process.env.JUSPAY_BASE_URL;
    const MERCHANT_ID = process.env.HDFC_MERCHANT_ID;
    const API_KEY = process.env.HDFC_API_KEY;

    if (!JUSPAY_BASE_URL || !MERCHANT_ID || !API_KEY) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // --- Fetch existing payment record first ---
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("orderId", "==", orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Never synthesize a payment record — if it doesn't exist, reject
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    const paymentDoc = snapshot.docs[0];
    const existingData = paymentDoc.data();

    // Idempotency — if already SUCCESS, return as-is without hitting Juspay again
    if (existingData.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        payment: {
          orderId: existingData.orderId,
          amount: existingData.amount,
          status: existingData.status,
          transactionReference: existingData.transactionReference,
          studentName:
            existingData?.registrationDraft?.studentName || existingData.studentName,
          courseName: existingData?.course?.name || existingData.courseName,
          invoiceNumber: existingData.invoiceNumber,
        },
      });
    }

    // --- Server-to-server verification with Juspay ---
    const juspayResponse = await fetch(`${JUSPAY_BASE_URL}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "x-merchantid": MERCHANT_ID,
        Authorization: `Basic ${Buffer.from(API_KEY + ":").toString("base64")}`,
      },
    });

    if (!juspayResponse.ok) {
      // Log internally, never expose Juspay error to client
      console.error("Juspay status check failed for order:", orderId);
      return NextResponse.json(
        { success: false, message: "Could not verify payment with gateway" },
        { status: 502 }
      );
    }

    const juspayData = await juspayResponse.json();

    // --- Amount verification — confirmed amount must match what we stored ---
    const confirmedAmount = juspayData.amount;
    const expectedAmount = existingData.amount;

    if (confirmedAmount === undefined || confirmedAmount === null) {
      console.error("Juspay did not return amount for order:", orderId);
      return NextResponse.json(
        { success: false, message: "Could not confirm payment amount" },
        { status: 502 }
      );
    }

    if (Number(confirmedAmount) < Number(expectedAmount)) {
      console.error(
        `Amount mismatch for ${orderId}: expected ${expectedAmount}, got ${confirmedAmount}`
      );
      return NextResponse.json(
        { success: false, message: "Payment amount mismatch" },
        { status: 400 }
      );
    }

    // --- Determine confirmed status ---
    const confirmedStatus =
      juspayData.status === "CHARGED" || juspayData.status === "SUCCESS"
        ? "SUCCESS"
        : juspayData.status || "PENDING";

    // --- Update Firestore with server-confirmed values only ---
    const docRef = doc(db, "payments", paymentDoc.id);
    await updateDoc(docRef, {
      status: confirmedStatus,
      transactionReference: juspayData.txn_id || "", // from Juspay only, never client
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      payment: {
        orderId: existingData.orderId,
        amount: existingData.amount, // always return our stored amount
        status: confirmedStatus,
        transactionReference: juspayData.txn_id || "",
        studentName:
          existingData?.registrationDraft?.studentName || existingData.studentName,
        courseName: existingData?.course?.name || existingData.courseName,
        invoiceNumber: existingData.invoiceNumber,
      },
    });
  } catch (error) {
    console.error("Error verifying payment status:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify payment status" },
      { status: 500 }
    );
  }
}
