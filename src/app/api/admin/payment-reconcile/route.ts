import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { finalizeRegistrationForPayment } from "@/lib/payment-finalize";
import { isValidOrderId } from "@/lib/order-id-utils";
import { extractBankRef, safeWritePaymentAuditLog } from "@/lib/payment-audit-log";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
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

function normalizeGatewayStatus(status: unknown): string {
  const value = String(status || "PENDING").toUpperCase();

  if (value === "CHARGED" || value === "SUCCESS") return "SUCCESS";

  if (
    value === "AUTHORIZATION_FAILED" ||
    value === "AUTHENTICATION_FAILED" ||
    value === "JUSPAY_DECLINED" ||
    value === "DECLINED" ||
    value === "FAILED"
  ) {
    return "FAILED";
  }

  return value || "PENDING";
}

export async function POST(req: Request) {
  const requestPath = new URL(req.url).pathname;

  try {
    const body = await req.json();
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";

    if (!isValidOrderId(orderId)) {
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "admin_payment_reconcile",
        orderId,
        success: false,
        reason: "Invalid or missing order ID",
        requestMethod: req.method,
        requestPath,
        rawRequest: { orderId },
      });

      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    const JUSPAY_BASE_URL = process.env.JUSPAY_BASE_URL;
    const MERCHANT_ID = process.env.HDFC_MERCHANT_ID;
    const API_KEY = process.env.HDFC_API_KEY;

    if (!JUSPAY_BASE_URL || !MERCHANT_ID || !API_KEY) {
      return NextResponse.json(
        { success: false, message: "Server payment configuration is missing" },
        { status: 500 },
      );
    }

    const paymentsRef = collection(db, "payments");
    const paymentQuery = query(paymentsRef, where("orderId", "==", orderId));
    const paymentSnapshot = await getDocs(paymentQuery);

    if (paymentSnapshot.empty) {
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "admin_payment_reconcile",
        orderId,
        success: false,
        reason: "Payment record not found",
        requestMethod: req.method,
        requestPath,
        rawRequest: { orderId },
      });

      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 },
      );
    }

    const paymentDoc = paymentSnapshot.docs[0];
    const paymentData = paymentDoc.data();
    const expectedAmount = normalizeAmount(paymentData.amount);

    if (expectedAmount === null) {
      return NextResponse.json(
        { success: false, message: "Stored payment amount is invalid" },
        { status: 500 },
      );
    }

    const juspayResponse = await fetch(`${JUSPAY_BASE_URL}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "x-merchantid": MERCHANT_ID,
        Authorization: `Basic ${Buffer.from(`${API_KEY}:`).toString("base64")}`,
      },
    });

    if (!juspayResponse.ok) {
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "admin_payment_reconcile",
        orderId,
        status: paymentData.status || "PENDING",
        amount: expectedAmount,
        success: false,
        reason: "Could not verify payment with gateway",
        requestMethod: req.method,
        requestPath,
        rawRequest: { orderId },
      });

      return NextResponse.json(
        { success: false, message: "Could not verify payment with gateway" },
        { status: 502 },
      );
    }

    const juspayData = await juspayResponse.json();
    const confirmedAmount = normalizeAmount(juspayData.amount);

    if (confirmedAmount === null) {
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "admin_payment_reconcile",
        orderId,
        status: juspayData.status || "PENDING",
        amount: expectedAmount,
        txnId: juspayData.txn_id || null,
        bankRef: extractBankRef(juspayData),
        success: false,
        reason: "Gateway did not return amount",
        requestMethod: req.method,
        requestPath,
        rawRequest: { orderId },
        rawResponse: juspayData,
      });

      return NextResponse.json(
        { success: false, message: "Gateway did not return amount" },
        { status: 502 },
      );
    }

    if (confirmedAmount !== expectedAmount) {
      await safeWritePaymentAuditLog({
        eventType: "status_verify",
        source: "admin_payment_reconcile",
        orderId,
        status: juspayData.status || "PENDING",
        amount: confirmedAmount,
        txnId: juspayData.txn_id || null,
        bankRef: extractBankRef(juspayData),
        success: false,
        reason: "Payment amount mismatch",
        requestMethod: req.method,
        requestPath,
        rawRequest: { orderId },
        rawResponse: juspayData,
        metadata: {
          expectedAmount,
          confirmedAmount,
        },
      });

      return NextResponse.json(
        { success: false, message: "Payment amount mismatch" },
        { status: 409 },
      );
    }

    const confirmedStatus = normalizeGatewayStatus(juspayData.status);
    const transactionReference = juspayData.txn_id || paymentData.transactionReference || "";
    const bankRef = extractBankRef(juspayData);

    await updateDoc(doc(db, "payments", paymentDoc.id), {
      status: confirmedStatus,
      paymentStatus: confirmedStatus,
      transactionReference,
      bankRef,
      gatewayResponse: juspayData,
      reconciledWithGateway: true,
      reconciledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const finalizeResult =
      confirmedStatus === "SUCCESS"
        ? await finalizeRegistrationForPayment(orderId, transactionReference)
        : null;

    await safeWritePaymentAuditLog({
      eventType: "status_verify",
      source: "admin_payment_reconcile",
      orderId,
      status: confirmedStatus,
      amount: expectedAmount,
      txnId: transactionReference || null,
      bankRef,
      success: true,
      requestMethod: req.method,
      requestPath,
      rawRequest: { orderId },
      rawResponse: juspayData,
      metadata: {
        finalizedRegistration: finalizeResult?.ok || false,
        registrationId: finalizeResult?.registrationId || null,
      },
    });

    return NextResponse.json({
      success: true,
      payment: {
        orderId,
        amount: expectedAmount,
        status: confirmedStatus,
        transactionReference,
        bankRef,
        registrationId: finalizeResult?.registrationId || paymentData.registrationId || null,
      },
    });
  } catch (error) {
    console.error("Admin payment reconciliation failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reconcile payment" },
      { status: 500 },
    );
  }
}
