import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { isValidOrderId } from "@/lib/order-id-utils";
import { extractBankRef, safeWritePaymentAuditLog } from "@/lib/payment-audit-log";
import {
  PAYMENT_SESSION_COOKIE_NAME,
  getCookieValue,
  verifyPaymentSessionCookieValue,
} from "@/lib/payment-session-binding";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

function normalizeAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const amount =
    typeof value === "string"
      ? Number(value.trim())
      : typeof value === "number"
        ? value
        : Number(value);

  return Number.isFinite(amount) ? amount : null;
}

function safeRequestBody(body: Record<string, any> | null): Record<string, any> | null {
  if (!body) return null;

  return {
    ...body,
    gatewayResponse: undefined,
    rawResponse: undefined,
  };
}

function verifyPaymentOwnership(
  req: Request,
  orderId: string | null | undefined,
  paymentData: Record<string, any>
): { ok: boolean; reason?: string } {
  const cookieValue = getCookieValue(
    req.headers.get("cookie"),
    PAYMENT_SESSION_COOKIE_NAME
  );
  const sessionCheck = verifyPaymentSessionCookieValue(cookieValue);

  if (!sessionCheck.ok) {
    return { ok: false, reason: sessionCheck.reason };
  }

  if (sessionCheck.payload.orderId !== orderId) {
    return { ok: false, reason: "Payment session order mismatch" };
  }

  if (!paymentData.sessionBindingKey) {
    return { ok: false, reason: "Payment session binding missing" };
  }

  if (sessionCheck.payload.sessionBindingKey !== paymentData.sessionBindingKey) {
    return { ok: false, reason: "Payment session binding mismatch" };
  }

  return { ok: true };
}

// GET - fetch payment status from Firestore only
export async function GET(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const searchParams = requestUrl.searchParams;
    const requestPath = requestUrl.pathname + requestUrl.search;
    const orderId = searchParams.get("order_id") || searchParams.get("orderId");

    if (!isValidOrderId(orderId)) {
      await safeWritePaymentAuditLog({
        eventType: "status_lookup",
        source: "payment_status_get",
        orderId,
        success: false,
        reason: "Invalid or missing order ID",
        requestMethod: req.method,
        requestPath,
        rawRequest: Object.fromEntries(searchParams.entries()),
      });
      return NextResponse.json(
        { success: false, message: "Invalid or missing order ID" },
        { status: 400 }
      );
    }

    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("orderId", "==", orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      await safeWritePaymentAuditLog({
        eventType: "status_lookup",
        source: "payment_status_get",
        orderId,
        success: false,
        reason: "Payment not found",
        requestMethod: req.method,
        requestPath,
        rawRequest: Object.fromEntries(searchParams.entries()),
      });
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    const paymentData = snapshot.docs[0].data();
    const ownershipCheck = verifyPaymentOwnership(req, orderId, paymentData);
    if (!ownershipCheck.ok) {
      await safeWritePaymentAuditLog({
        eventType: "status_lookup",
        source: "payment_status_get",
        orderId,
        status: paymentData.status,
        amount: paymentData.amount,
        txnId:
          paymentData.transactionReference ||
          paymentData.txnId ||
          paymentData.txn_id ||
          null,
        bankRef: extractBankRef(paymentData),
        success: false,
        reason: ownershipCheck.reason || "Payment session validation failed",
        requestMethod: req.method,
        requestPath,
        rawRequest: Object.fromEntries(searchParams.entries()),
        metadata: {
          sessionBindingKeyPresent: Boolean(paymentData.sessionBindingKey),
        },
      });
      return NextResponse.json(
        { success: false, message: "Payment session validation failed" },
        { status: 403 }
      );
    }

    const txnId =
      paymentData.transactionReference ||
      paymentData.txnId ||
      paymentData.txn_id ||
      null;
    const bankRef = extractBankRef(paymentData);

    await safeWritePaymentAuditLog({
      eventType: "status_lookup",
      source: "payment_status_get",
      orderId,
      status: paymentData.status,
      amount: paymentData.amount,
      txnId,
      bankRef,
      success: true,
      requestMethod: req.method,
      requestPath,
      rawRequest: Object.fromEntries(searchParams.entries()),
      rawResponse: {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        status: paymentData.status,
        transactionReference: txnId,
        invoiceNumber: paymentData.invoiceNumber,
      },
    });

    // Return only what the UI needs - no extra PII
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

// PUT - verify payment status against Juspay server-to-server
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;
    const requestPath = new URL(req.url).pathname;
    const requestBody = safeRequestBody(body);

    // Only accept orderId from body - never accept amount or referenceId from client
    if (!isValidOrderId(orderId)) {
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "payment_status_put",
        orderId,
        success: false,
        reason: "Invalid or missing order ID",
        requestMethod: req.method,
        requestPath,
        rawRequest: requestBody,
      });
      return NextResponse.json(
        { success: false, message: "Invalid or missing order ID" },
        { status: 400 }
      );
    }

    const JUSPAY_BASE_URL = process.env.JUSPAY_BASE_URL;
    const MERCHANT_ID = process.env.HDFC_MERCHANT_ID;
    const API_KEY = process.env.HDFC_API_KEY;

    if (!JUSPAY_BASE_URL || !MERCHANT_ID || !API_KEY) {
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "payment_status_put",
        orderId,
        success: false,
        reason: "Server configuration error",
        requestMethod: req.method,
        requestPath,
        rawRequest: requestBody,
      });
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
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "payment_status_put",
        orderId,
        success: false,
        reason: "Payment record not found",
        requestMethod: req.method,
        requestPath,
        rawRequest: requestBody,
      });
      // Never synthesize a payment record - if it doesn't exist, reject
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    const paymentDoc = snapshot.docs[0];
    const existingData = paymentDoc.data();
    const ownershipCheck = verifyPaymentOwnership(req, orderId, existingData);
    if (!ownershipCheck.ok) {
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "payment_status_put",
        orderId,
        status: existingData.status,
        amount: existingData.amount,
        txnId: existingData.transactionReference || null,
        bankRef: extractBankRef(existingData),
        success: false,
        reason: ownershipCheck.reason || "Payment session validation failed",
        requestMethod: req.method,
        requestPath,
        rawRequest: requestBody,
        metadata: {
          sessionBindingKeyPresent: Boolean(existingData.sessionBindingKey),
        },
      });
      return NextResponse.json(
        { success: false, message: "Payment session validation failed" },
        { status: 403 }
      );
    }

    // Idempotency - if already SUCCESS, return as-is without hitting Juspay again
    if (existingData.status === "SUCCESS") {
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "payment_status_put",
        orderId,
        status: existingData.status,
        amount: existingData.amount,
        txnId: existingData.transactionReference || null,
        bankRef: extractBankRef(existingData),
        success: true,
        requestMethod: req.method,
        requestPath,
        rawRequest: requestBody,
        rawResponse: {
          orderId: existingData.orderId,
          amount: existingData.amount,
          status: existingData.status,
          transactionReference: existingData.transactionReference,
          invoiceNumber: existingData.invoiceNumber,
        },
        metadata: {
          idempotent: true,
        },
      });

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
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "payment_status_put",
        orderId,
        status: "PENDING",
        amount: existingData.amount,
        success: false,
        reason: "Could not verify payment with gateway",
        requestMethod: req.method,
        requestPath,
        rawRequest: requestBody,
      });
      return NextResponse.json(
        { success: false, message: "Could not verify payment with gateway" },
        { status: 502 }
      );
    }

    const juspayData = await juspayResponse.json();

    // --- Amount verification - confirmed amount must match what we stored ---
    const confirmedAmount = normalizeAmount(juspayData.amount);
    const expectedAmount = normalizeAmount(existingData.amount);

    if (confirmedAmount === undefined || confirmedAmount === null) {
      console.error("Juspay did not return amount for order:", orderId);
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "payment_status_put",
        orderId,
        status: juspayData.status,
        amount: expectedAmount,
        txnId: juspayData.txn_id || null,
        bankRef: extractBankRef(juspayData),
        success: false,
        reason: "Could not confirm payment amount",
        requestMethod: req.method,
        requestPath,
        rawRequest: requestBody,
        rawResponse: juspayData,
      });
      return NextResponse.json(
        { success: false, message: "Could not confirm payment amount" },
        { status: 502 }
      );
    }

    if (expectedAmount === null) {
      console.error("Stored amount missing or invalid for order:", orderId);
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "payment_status_put",
        orderId,
        status: juspayData.status,
        amount: null,
        txnId: juspayData.txn_id || null,
        bankRef: extractBankRef(juspayData),
        success: false,
        reason: "Stored payment amount is invalid",
        requestMethod: req.method,
        requestPath,
        rawRequest: requestBody,
        rawResponse: juspayData,
      });
      return NextResponse.json(
        { success: false, message: "Stored payment amount is invalid" },
        { status: 500 }
      );
    }

    if (confirmedAmount !== expectedAmount) {
      console.error(
        `Amount mismatch for ${orderId}: expected ${expectedAmount}, got ${confirmedAmount}`
      );
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "payment_status_put",
        orderId,
        status: juspayData.status,
        amount: confirmedAmount,
        txnId: juspayData.txn_id || null,
        bankRef: extractBankRef(juspayData),
        success: false,
        reason: "Payment amount mismatch",
        requestMethod: req.method,
        requestPath,
        rawRequest: requestBody,
        rawResponse: juspayData,
        metadata: {
          expectedAmount,
          confirmedAmount,
        },
      });
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

    const transactionReference = juspayData.txn_id || "";
    const bankRef = extractBankRef(juspayData);

    // --- Update Firestore with server-confirmed values only ---
    const docRef = doc(db, "payments", paymentDoc.id);
    await updateDoc(docRef, {
      status: confirmedStatus,
      transactionReference,
      bankRef,
      gatewayResponse: juspayData,
      updatedAt: new Date().toISOString(),
    });

    await safeWritePaymentAuditLog({
      eventType: "status_verify",
      source: "payment_status_put",
      orderId,
      status: confirmedStatus,
      amount: existingData.amount,
      txnId: transactionReference || null,
      bankRef,
      success: true,
      requestMethod: req.method,
      requestPath,
      rawRequest: requestBody,
      rawResponse: juspayData,
    });

    return NextResponse.json({
      success: true,
      payment: {
        orderId: existingData.orderId,
        amount: existingData.amount, // always return our stored amount
        status: confirmedStatus,
        transactionReference,
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
