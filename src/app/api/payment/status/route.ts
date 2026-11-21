import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { isValidOrderId } from "@/lib/order-id-utils";
import { extractBankRef, safeWritePaymentAuditLog } from "@/lib/payment-audit-log";
import {
  getPaymentSessionCookieValue,
  verifyPaymentSessionCookieValue,
} from "@/lib/payment-session-binding";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { finalizeRegistrationForPayment } from "@/lib/payment-finalize";
import { fetchOrCaptureRazorpayPayment, getRazorpayClient } from "@/lib/razorpay";

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

function isChargedJuspayResponse(response: unknown): boolean {
  return (
    typeof response === "object" &&
    response !== null &&
    "status" in response &&
    (response as { status?: unknown }).status === "CHARGED"
  );
}

function getJuspayTransactionReference(response: Record<string, any>): string {
  return String(
    response.txn_id ||
      response.txn_detail?.txn_id ||
      response.payment_gateway_response?.epg_txn_id ||
      response.payment_gateway_response?.txn_id ||
      response.txn_uuid ||
      "",
  ).trim();
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
  const cookieValue = getPaymentSessionCookieValue(
    req.headers.get("cookie"),
    orderId
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
    const isCodefestHdfcPayment =
      paymentData.paymentFlow === "competition" && paymentData.gateway !== "razorpay";
    const reportedStatus =
      isCodefestHdfcPayment &&
      paymentData.status === "SUCCESS" &&
      paymentData.gatewayVerification?.verifiedWithHdfc !== true
        ? "PENDING"
        : paymentData.status;
    const ownershipCheck = verifyPaymentOwnership(req, orderId, paymentData);
    if (!ownershipCheck.ok) {
      if (
        paymentData.status === "SUCCESS" &&
        (!isCodefestHdfcPayment || paymentData.gatewayVerification?.verifiedWithHdfc === true)
      ) {
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
      }

      await safeWritePaymentAuditLog({
        eventType: "status_lookup",
        source: "payment_status_get",
        orderId,
        status: reportedStatus,
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
      status: reportedStatus,
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
        status: reportedStatus,
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
        status: reportedStatus,
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
    const isCodefestHdfcPayment =
      existingData.paymentFlow === "competition" && existingData.gateway !== "razorpay";
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
    if (existingData.status === "SUCCESS" && !isCodefestHdfcPayment) {
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

    if (existingData.gateway === "razorpay") {
      const { client } = getRazorpayClient();
      const gatewayPayments = await client.orders.fetchPayments(existingData.razorpayOrderId);
      const candidate = gatewayPayments.items?.find((payment) =>
        (payment.status === "captured" || payment.status === "authorized") &&
        payment.amount === Math.round(Number(existingData.amount) * 100) &&
        payment.currency === (existingData.currency || "INR"),
      );
      if (!candidate) {
        return NextResponse.json({ success: true, payment: { orderId, amount: existingData.amount, status: "PENDING", invoiceNumber: existingData.invoiceNumber } });
      }
      const captured = await fetchOrCaptureRazorpayPayment(
        candidate.id,
        Number(candidate.amount),
        candidate.currency,
      );
      if (captured.status !== "captured") return NextResponse.json({ success: true, payment: { orderId, amount: existingData.amount, status: "PENDING", invoiceNumber: existingData.invoiceNumber } });
      await updateDoc(doc(db, "payments", paymentDoc.id), {
        status: "SUCCESS",
        transactionReference: captured.id,
        gatewayTransactionId: captured.id,
        gatewayVerification: { amountVerified: true, statusVerified: true, verifiedAt: new Date().toISOString() },
        updatedAt: serverTimestamp(),
      });
      await safeWritePaymentAuditLog({ eventType: "status_verify", source: "payment_status_put", orderId, status: "SUCCESS", txnId: captured.id, success: true, metadata: { gateway: "razorpay", verification: "server_api" } });
      await finalizeRegistrationForPayment(orderId, captured.id);
      return NextResponse.json({ success: true, payment: { orderId, amount: existingData.amount, status: "SUCCESS", transactionReference: captured.id, studentName: existingData.studentName, courseName: existingData.courseName, invoiceNumber: existingData.invoiceNumber } });
    }

    if (!JUSPAY_BASE_URL || !MERCHANT_ID || !API_KEY) {
      await safeWritePaymentAuditLog({ eventType: "status_verify", source: "payment_status_put", orderId, success: false, reason: "Server configuration error", requestMethod: req.method, requestPath, rawRequest: requestBody });
      return NextResponse.json({ success: false, message: "Server configuration error" }, { status: 500 });
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

    const confirmedCurrency = String(juspayData.currency || "").toUpperCase();
    const expectedCurrency = String(existingData.currency || "INR").toUpperCase();
    if (isCodefestHdfcPayment && confirmedCurrency !== expectedCurrency) {
      const transactionReference = getJuspayTransactionReference(juspayData);
      await updateDoc(doc(db, "payments", paymentDoc.id), {
        status: "PENDING",
        ...(transactionReference
          ? { transactionReference, gatewayTransactionId: transactionReference }
          : {}),
        gatewayResponse: juspayData,
        gatewayVerification: {
          verifiedWithHdfc: true,
          amountVerified: true,
          currencyVerified: false,
          verifiedAt: new Date().toISOString(),
        },
        updatedAt: serverTimestamp(),
      });
      const registrations = await getDocs(
        query(collection(db, "competitionRegistrations"), where("orderId", "==", orderId)),
      );
      if (!registrations.empty) {
        await updateDoc(doc(db, "competitionRegistrations", registrations.docs[0].id), {
          paymentStatus: "PENDING",
          updatedAt: serverTimestamp(),
        });
      }
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "payment_status_put",
        orderId,
        status: juspayData.status || "PENDING",
        amount: confirmedAmount,
        txnId: transactionReference || null,
        success: false,
        reason: "Gateway currency missing or does not match the stored order currency",
        requestMethod: req.method,
        requestPath,
        rawRequest: requestBody,
        rawResponse: juspayData,
        metadata: { expectedCurrency, confirmedCurrency },
      });
      return NextResponse.json(
        { success: false, message: "Could not confirm payment currency" },
        { status: 502 },
      );
    }

    // --- Determine confirmed status ---
    const confirmedStatus = isCodefestHdfcPayment
      ? isChargedJuspayResponse(juspayData)
        ? "SUCCESS"
        : juspayData.status === "SUCCESS"
          ? "PENDING"
          : juspayData.status || "PENDING"
      : juspayData.status === "CHARGED" || juspayData.status === "SUCCESS"
        ? "SUCCESS"
        : juspayData.status || "PENDING";

    const transactionReference = getJuspayTransactionReference(juspayData);
    const bankRef =
      extractBankRef(juspayData) || juspayData.payment_gateway_response?.rrn || null;

    // --- Update Firestore with server-confirmed values only ---
    const docRef = doc(db, "payments", paymentDoc.id);
    await updateDoc(docRef, {
      status: confirmedStatus,
      ...(transactionReference ? { transactionReference, gatewayTransactionId: transactionReference } : {}),
      bankRef,
      gatewayResponse: juspayData,
      ...(isCodefestHdfcPayment
        ? {
            gatewayVerification: {
              verifiedWithHdfc: true,
              amountVerified: confirmedAmount === expectedAmount,
              currencyVerified: confirmedCurrency === expectedCurrency,
              verifiedAt: new Date().toISOString(),
            },
          }
        : {}),
      updatedAt: new Date().toISOString(),
    });

    if (isCodefestHdfcPayment) {
      const registrations = await getDocs(
        query(collection(db, "competitionRegistrations"), where("orderId", "==", orderId)),
      );
      if (!registrations.empty) {
        await updateDoc(doc(db, "competitionRegistrations", registrations.docs[0].id), {
          paymentStatus: confirmedStatus,
          ...(transactionReference ? { paymentId: transactionReference } : {}),
          updatedAt: serverTimestamp(),
        });
      }
    }

    if (confirmedStatus === "SUCCESS") {
      await finalizeRegistrationForPayment(orderId, transactionReference);
    }

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
