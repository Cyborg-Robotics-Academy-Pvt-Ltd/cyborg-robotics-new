import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { isValidOrderId } from "@/lib/order-id-utils";
import { verifyReturnUrlSignature } from "@/lib/payment-signature";
import {
  extractBankRef,
  safeWritePaymentAuditLog,
} from "@/lib/payment-audit-log";
import {
  PAYMENT_SESSION_COOKIE_NAME,
  getCookieValue,
  verifyPaymentSessionCookieValue,
} from "@/lib/payment-session-binding";
import {
  buildTrustedPaymentUrl,
  requireTrustedBaseUrl,
} from "@/lib/payment-url-validation";
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

function getResponseKey(): string | null {
  return process.env.HDFC_RESPONSE_KEY || process.env.JUSPAY_RESPONSE_KEY || null;
}

function toSearchParamsFromBody(body: Record<string, any> | null): URLSearchParams {
  const params = new URLSearchParams();

  if (!body) return params;

  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object") continue;
    params.set(key, String(value));
  }

  return params;
}

function buildRedirectUrl(baseUrl: URL, path: string, params: Record<string, string>) {
  const url = buildTrustedPaymentUrl(baseUrl, path);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

function redirectToFailedStatus(
  baseUrl: URL,
  orderId: string | null | undefined,
  reason: string
) {
  const url = buildRedirectUrl(baseUrl, "/payment/status", {
    verify: "true",
  });
  if (orderId) url.searchParams.set("orderId", orderId);
  return NextResponse.redirect(url.toString(), { status: 302 });
}

async function updatePaymentStatus(
  orderId: string,
  status: string,
  txnId: string,
  bankRef?: string | null,
  gatewayResponse?: unknown
): Promise<boolean> {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("orderId", "==", orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error(`No payment record found for orderId: ${orderId}`);
      return false;
    }

    const paymentDoc = snapshot.docs[0];
    const existing = paymentDoc.data();

    if (existing.status === "SUCCESS") {
      console.warn(`Payment ${orderId} already marked SUCCESS - skipping update`);
      return true;
    }

    await updateDoc(doc(db, "payments", paymentDoc.id), {
      status,
      transactionReference: txnId,
      bankRef: bankRef || null,
      gatewayResponse: gatewayResponse || undefined,
      updatedAt: serverTimestamp(),
    });

    console.log(`Firestore updated: ${orderId} -> ${status}`);
    return true;
  } catch (error) {
    console.error("Firestore update error:", error);
    return false;
  }
}

function extractOrderData(
  body: Record<string, any> | null,
  params: URLSearchParams | null
): { orderId: string; status: string; txnId: string; amount: string } | null {
  if (body) {
    const order = body?.content?.order;
    if (order?.order_id) {
      return {
        orderId: order.order_id,
        status: order.status || "PENDING",
        txnId: order.txn_id || "",
        amount: String(order.amount || ""),
      };
    }

    if (body?.order_id) {
      return {
        orderId: body.order_id,
        status: body.status || "PENDING",
        txnId: body.txn_id || "",
        amount: String(body.amount || ""),
      };
    }
  }

  if (params) {
    const orderId = params.get("order_id") || params.get("orderId");
    if (orderId) {
      return {
        orderId,
        status: params.get("status") || "PENDING",
        txnId: params.get("txn_id") || "",
        amount: params.get("amount") || "",
      };
    }
  }

  return null;
}

async function verifyWithGateway(
  orderId: string
): Promise<{
  status: string;
  txnId: string;
  amount: number | null;
  bankRef: string | null;
  rawResponse: unknown;
} | null> {
  const JUSPAY_BASE_URL = process.env.JUSPAY_BASE_URL;
  const MERCHANT_ID = process.env.HDFC_MERCHANT_ID;
  const API_KEY = process.env.HDFC_API_KEY;

  if (!JUSPAY_BASE_URL || !MERCHANT_ID || !API_KEY) {
    return null;
  }

  try {
    const verifyResponse = await fetch(`${JUSPAY_BASE_URL}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "x-merchantid": MERCHANT_ID,
        Authorization: `Basic ${Buffer.from(API_KEY + ":").toString("base64")}`,
      },
    });

    if (!verifyResponse.ok) {
      console.error("Juspay server verification failed - using webhook status");
      return null;
    }

    const verifyData = await verifyResponse.json();
    const status =
      verifyData.status === "CHARGED" || verifyData.status === "SUCCESS"
        ? "SUCCESS"
        : verifyData.status || "PENDING";

    return {
      status,
      txnId: verifyData.txn_id || "",
      amount: normalizeAmount(verifyData.amount),
      bankRef: extractBankRef(verifyData),
      rawResponse: verifyData,
    };
  } catch (error) {
    console.error("Server-to-server verification error:", error);
    return null;
  }
}

function getTrustedBaseUrl(): URL | null {
  return requireTrustedBaseUrl(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
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

// GET - browser redirect after payment
export async function GET(req: Request) {
  const trustedBaseUrl = getTrustedBaseUrl();
  if (!trustedBaseUrl) {
    return NextResponse.json(
      { success: false, message: "Server redirect URL is not trusted" },
      { status: 500 }
    );
  }

  const requestUrl = new URL(req.url);
  const searchParams = requestUrl.searchParams;
  const requestPath = requestUrl.pathname + requestUrl.search;
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  console.log("=== PAYMENT RETURN GET ===");
  console.log("orderId:", orderId);

  const signatureCheck = verifyReturnUrlSignature(searchParams, getResponseKey());
  if (!signatureCheck.ok) {
    console.error("Return URL signature verification failed:", signatureCheck.reason);
    await safeWritePaymentAuditLog({
      eventType: "return_signature",
      source: "payment_return_get",
      orderId,
      success: false,
      reason: signatureCheck.reason || "signature_verification_failed",
      requestMethod: req.method,
      requestPath,
      rawRequest: Object.fromEntries(searchParams.entries()),
      metadata: {
        expectedSignature: signatureCheck.expectedSignature,
        receivedSignature: signatureCheck.receivedSignature,
        algorithm: signatureCheck.algorithm,
      },
    });
    // Do not fail the customer journey here.
    // A bad/missing browser return signature can still happen even when the
    // gateway later confirms the payment through the server-to-server status API.
    // We keep the audit trail, then continue with the trusted gateway check.
  }

  if (!isValidOrderId(orderId)) {
    console.warn("No valid orderId in return - redirecting to status page");
    await safeWritePaymentAuditLog({
      eventType: "return_signature",
      source: "payment_return_get",
      orderId,
      success: false,
      reason: "Invalid or missing order ID",
      requestMethod: req.method,
      requestPath,
      rawRequest: Object.fromEntries(searchParams.entries()),
    });
    const statusUrl = buildRedirectUrl(trustedBaseUrl, "/payment/status", {});
    return NextResponse.redirect(statusUrl.toString(), { status: 302 });
  }

  const orderIdParam = orderId as string;
  const paymentsRef = collection(db, "payments");
  const q = query(paymentsRef, where("orderId", "==", orderIdParam));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    console.error("Payment record not found for return verification:", orderIdParam);
    await safeWritePaymentAuditLog({
      eventType: "return_signature",
      source: "payment_return_get",
      orderId: orderIdParam,
      success: false,
      reason: "Payment record not found",
      requestMethod: req.method,
      requestPath,
      rawRequest: Object.fromEntries(searchParams.entries()),
    });
    const statusUrl = buildRedirectUrl(trustedBaseUrl, "/payment/status", {
      orderId: orderIdParam,
    });
    return NextResponse.redirect(statusUrl.toString(), { status: 302 });
  }

  const paymentDoc = snapshot.docs[0];
  const existingData = paymentDoc.data();
  const ownershipCheck = verifyPaymentOwnership(req, orderIdParam, existingData);
  if (!ownershipCheck.ok) {
    await safeWritePaymentAuditLog({
      eventType: "return_signature",
      source: "payment_return_get",
      orderId: orderIdParam,
      status: existingData.status,
      amount: existingData.amount,
      txnId: existingData.transactionReference || null,
      bankRef: extractBankRef(existingData),
      success: false,
      reason: ownershipCheck.reason || "Payment session validation failed",
      requestMethod: req.method,
      requestPath,
      rawRequest: Object.fromEntries(searchParams.entries()),
      metadata: {
        sessionBindingKeyPresent: Boolean(existingData.sessionBindingKey),
      },
    });
    return redirectToFailedStatus(
      trustedBaseUrl,
      orderIdParam,
      "session_binding_mismatch"
    );
  }
  const expectedAmount = normalizeAmount(existingData.amount);
  if (expectedAmount === null) {
    console.error("Stored amount missing or invalid for order:", orderIdParam);
    await safeWritePaymentAuditLog({
      eventType: "return_amount_check",
      source: "payment_return_get",
      orderId: orderIdParam,
      status: existingData.status,
      amount: null,
      txnId: existingData.transactionReference || null,
      bankRef: extractBankRef(existingData),
      success: false,
      reason: "stored_amount_invalid",
      requestMethod: req.method,
      requestPath,
      rawRequest: Object.fromEntries(searchParams.entries()),
    });
    return redirectToFailedStatus(trustedBaseUrl, orderIdParam, "stored_amount_invalid");
  }

  const verified = await verifyWithGateway(orderIdParam);
  const finalStatus = verified?.status || "PENDING";
  const confirmedAmount = verified?.amount;

  if (confirmedAmount === null || confirmedAmount === undefined) {
    console.error("Gateway did not return amount for order:", orderIdParam);
    await safeWritePaymentAuditLog({
      eventType: "return_amount_check",
      source: "payment_return_get",
      orderId: orderIdParam,
      status: finalStatus,
      amount: expectedAmount,
      txnId: verified?.txnId || null,
      bankRef: verified?.bankRef || null,
      success: false,
      reason: "gateway_amount_missing",
      requestMethod: req.method,
      requestPath,
      rawRequest: Object.fromEntries(searchParams.entries()),
      rawResponse: verified?.rawResponse,
    });
    return redirectToFailedStatus(trustedBaseUrl, orderIdParam, "gateway_amount_missing");
  }

  if (confirmedAmount !== expectedAmount) {
    console.error(
      `Amount mismatch for ${orderIdParam}: expected ${expectedAmount}, got ${confirmedAmount}`
    );
    await safeWritePaymentAuditLog({
      eventType: "return_amount_check",
      source: "payment_return_get",
      orderId: orderIdParam,
      status: finalStatus,
      amount: confirmedAmount,
      txnId: verified?.txnId || null,
      bankRef: verified?.bankRef || null,
      success: false,
      reason: "amount_mismatch",
      requestMethod: req.method,
      requestPath,
      rawRequest: Object.fromEntries(searchParams.entries()),
      rawResponse: verified?.rawResponse,
      metadata: {
        expectedAmount,
        confirmedAmount,
      },
    });
    return redirectToFailedStatus(trustedBaseUrl, orderIdParam, "amount_mismatch");
  }

  if (verified?.status === "SUCCESS") {
    await updatePaymentStatus(orderIdParam, "SUCCESS", verified.txnId, verified.bankRef, verified.rawResponse);
    await finalizeRegistrationForPayment(orderIdParam, verified.txnId);

    await safeWritePaymentAuditLog({
      eventType: "return_amount_check",
      source: "payment_return_get",
      orderId: orderIdParam,
      status: "SUCCESS",
      amount: confirmedAmount,
      txnId: verified.txnId || null,
      bankRef: verified.bankRef || null,
      success: true,
      requestMethod: req.method,
      requestPath,
      rawRequest: Object.fromEntries(searchParams.entries()),
      rawResponse: verified.rawResponse,
    });

    const successUrl = buildRedirectUrl(trustedBaseUrl, "/payment/status", {
      verify: "true",
      orderId: orderIdParam,
    });
    return NextResponse.redirect(successUrl.toString(), { status: 302 });
  }

  await safeWritePaymentAuditLog({
    eventType: "return_amount_check",
    source: "payment_return_get",
    orderId: orderIdParam,
    status: finalStatus,
    amount: confirmedAmount,
    txnId: verified?.txnId || null,
    bankRef: verified?.bankRef || null,
    success: true,
    requestMethod: req.method,
    requestPath,
    rawRequest: Object.fromEntries(searchParams.entries()),
    rawResponse: verified?.rawResponse,
  });

  const statusUrl = buildRedirectUrl(trustedBaseUrl, "/payment/status", {
    orderId: orderIdParam,
    status: finalStatus,
  });
  return NextResponse.redirect(statusUrl.toString(), { status: 302 });
}

// POST - Juspay webhook callback
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const rawText = await req.text();
    const requestUrl = new URL(req.url);
    const requestPath = requestUrl.pathname;

    let body: Record<string, any> | null = null;
    let params: URLSearchParams | null = null;

    if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(rawText);
        console.log("=== WEBHOOK RECEIVED (JSON) ===");
        console.log("event_name:", body?.event_name);
        console.log("id:", body?.id);
      } catch (e) {
        console.error("Failed to parse JSON webhook body:", e);
        return NextResponse.json(
          { success: false, message: "Invalid JSON payload" },
          { status: 400 }
        );
      }
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      params = new URLSearchParams(rawText);
      console.log("=== WEBHOOK RECEIVED (FORM) ===");
      params.forEach((value, key) => console.log(`${key}: ${value}`));
    } else {
      try {
        body = JSON.parse(rawText);
        console.log("=== WEBHOOK RECEIVED (JSON fallback) ===");
      } catch {
        try {
          params = new URLSearchParams(rawText);
          console.log("=== WEBHOOK RECEIVED (FORM fallback) ===");
        } catch {
          console.error("Could not parse webhook body");
          return NextResponse.json(
            { success: false, message: "Unrecognized payload format" },
            { status: 400 }
          );
        }
      }
    }

    const orderData = extractOrderData(body, params);

    if (!orderData) {
      console.error("Could not extract order data from webhook payload");
      console.log("Raw body:", rawText);
      await safeWritePaymentAuditLog({
        eventType: "webhook_received",
        source: "payment_webhook_post",
        success: false,
        reason: "Could not extract order data",
        requestMethod: req.method,
        requestPath,
        rawRequest: body || rawText,
      });
      return NextResponse.json(
        { success: false, message: "Could not extract order data" },
        { status: 400 }
      );
    }

    const { orderId, status, txnId } = orderData;

    console.log("=== ORDER DATA ===");
    console.log("order_id:", orderId);
    console.log("status:", status);
    console.log("txn_id:", txnId);

    if (!isValidOrderId(orderId)) {
      console.error("Invalid or missing order_id:", orderId);
      await safeWritePaymentAuditLog({
        eventType: "webhook_received",
        source: "payment_webhook_post",
        orderId,
        success: false,
        reason: "Invalid order ID",
        requestMethod: req.method,
        requestPath,
        rawRequest: body || params?.toString() || rawText,
      });
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    const acceptHeader = req.headers.get("accept") || "";
    const signedParams = params ?? toSearchParamsFromBody(body);
    const trustedBaseUrl = getTrustedBaseUrl();
    if (!trustedBaseUrl) {
      return NextResponse.json(
        { success: false, message: "Server redirect URL is not trusted" },
        { status: 500 }
      );
    }

    if (acceptHeader.includes("text/html")) {
      const signatureCheck = verifyReturnUrlSignature(signedParams, getResponseKey());
      if (!signatureCheck.ok) {
        console.error("Return URL signature verification failed:", signatureCheck.reason);
        await safeWritePaymentAuditLog({
          eventType: "return_signature",
          source: "payment_return_post",
          orderId,
          success: false,
          reason: signatureCheck.reason || "signature_verification_failed",
          requestMethod: req.method,
          requestPath,
          rawRequest: body || Object.fromEntries(signedParams.entries()),
          metadata: {
            expectedSignature: signatureCheck.expectedSignature,
            receivedSignature: signatureCheck.receivedSignature,
            algorithm: signatureCheck.algorithm,
          },
        });
        // Keep going so the server-to-server status API can still confirm
        // a successful payment and route the user to the correct final page.
      }
    }

    const confirmedStatus =
      status === "CHARGED" || status === "SUCCESS"
        ? "SUCCESS"
        : status === "AUTHORIZATION_FAILED" ||
          status === "AUTHENTICATION_FAILED" ||
          status === "JUSPAY_DECLINED"
        ? "FAILED"
        : status;

    let finalStatus = confirmedStatus;
    let finalTxnId = txnId;

    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("orderId", "==", orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error("Payment record not found for webhook/order verification:", orderId);
      await safeWritePaymentAuditLog({
        eventType: "webhook_status_update",
        source: "payment_webhook_post",
        orderId,
        success: false,
        reason: "Payment record not found",
        requestMethod: req.method,
        requestPath,
        rawRequest: body || params?.toString() || rawText,
      });
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
        eventType: "return_signature",
        source: "payment_return_post",
        orderId,
        status: existingData.status,
        amount: existingData.amount,
        txnId: existingData.transactionReference || null,
        bankRef: extractBankRef(existingData),
        success: false,
        reason: ownershipCheck.reason || "Payment session validation failed",
        requestMethod: req.method,
        requestPath,
        rawRequest: body || Object.fromEntries(signedParams.entries()),
        metadata: {
          sessionBindingKeyPresent: Boolean(existingData.sessionBindingKey),
        },
      });
      return redirectToFailedStatus(
        trustedBaseUrl,
        orderId,
        "session_binding_mismatch"
      );
    }
    const expectedAmount = normalizeAmount(existingData.amount);

    if (expectedAmount === null) {
      console.error("Stored amount missing or invalid for order:", orderId);
      await safeWritePaymentAuditLog({
        eventType: "webhook_status_update",
        source: "payment_webhook_post",
        orderId,
        status: existingData.status,
        amount: null,
        txnId: existingData.transactionReference || null,
        bankRef: extractBankRef(existingData),
        success: false,
        reason: "Stored payment amount is invalid",
        requestMethod: req.method,
        requestPath,
        rawRequest: body || params?.toString() || rawText,
      });
      return NextResponse.json(
        { success: false, message: "Stored payment amount is invalid" },
        { status: 500 }
      );
    }

    const verified = await verifyWithGateway(orderId);
    if (verified) {
      finalStatus = verified.status;
      finalTxnId = verified.txnId || finalTxnId;
      console.log(`Gateway confirmed status for ${orderId}:`, finalStatus);

      if (verified.amount === null || verified.amount === undefined) {
        console.error("Gateway did not return amount for order:", orderId);
        await safeWritePaymentAuditLog({
          eventType: "webhook_status_update",
          source: "payment_webhook_post",
          orderId,
          status: finalStatus,
          amount: expectedAmount,
          txnId: finalTxnId || null,
          bankRef: verified.bankRef || null,
          success: false,
          reason: "Could not confirm payment amount",
          requestMethod: req.method,
          requestPath,
          rawRequest: body || params?.toString() || rawText,
          rawResponse: verified.rawResponse,
        });
        return NextResponse.json(
          { success: false, message: "Could not confirm payment amount" },
          { status: 502 }
        );
      }

      if (verified.amount !== expectedAmount) {
        console.error(
          `Amount mismatch for ${orderId}: expected ${expectedAmount}, got ${verified.amount}`
        );
        await safeWritePaymentAuditLog({
          eventType: "webhook_status_update",
          source: "payment_webhook_post",
          orderId,
          status: finalStatus,
          amount: verified.amount,
          txnId: finalTxnId || null,
          bankRef: verified.bankRef || null,
          success: false,
          reason: "Payment amount mismatch",
          requestMethod: req.method,
          requestPath,
          rawRequest: body || params?.toString() || rawText,
          rawResponse: verified.rawResponse,
          metadata: {
            expectedAmount,
            confirmedAmount: verified.amount,
          },
        });
        return NextResponse.json(
          { success: false, message: "Payment amount mismatch" },
          { status: 400 }
        );
      }
    }

    await updatePaymentStatus(orderId, finalStatus, finalTxnId, verified?.bankRef, verified?.rawResponse);

    if (finalStatus === "SUCCESS") {
      await finalizeRegistrationForPayment(orderId, finalTxnId);
    }

    await safeWritePaymentAuditLog({
      eventType: "webhook_finalized",
      source: "payment_webhook_post",
      orderId,
      status: finalStatus,
      amount: expectedAmount,
      txnId: finalTxnId || null,
      bankRef: verified?.bankRef || extractBankRef(existingData),
      success: true,
      requestMethod: req.method,
      requestPath,
      rawRequest: body || params?.toString() || rawText,
      rawResponse: verified?.rawResponse || body || params?.toString() || rawText,
    });

    if (acceptHeader.includes("text/html")) {
      if (finalStatus === "SUCCESS") {
        const successUrl = buildRedirectUrl(trustedBaseUrl, "/payment/status", {
          verify: "true",
          orderId: orderId,
        });
        return NextResponse.redirect(successUrl.toString(), { status: 302 });
      }

      const statusUrl = buildRedirectUrl(trustedBaseUrl, "/payment/status", {
        orderId: orderId,
        status: finalStatus,
      });
      return NextResponse.redirect(statusUrl.toString(), { status: 302 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
