import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
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
import { finalizeRegistrationForPayment } from "@/lib/payment-finalize";

// Update Firestore payment record status
async function updatePaymentStatus(
  orderId: string,
  status: string,
  txnId: string
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

    // Idempotency - don't overwrite a SUCCESS record
    if (existing.status === "SUCCESS") {
      console.warn(`Payment ${orderId} already marked SUCCESS - skipping update`);
      return true;
    }

    await updateDoc(doc(db, "payments", paymentDoc.id), {
      status,
      transactionReference: txnId,
      updatedAt: serverTimestamp(),
    });

    console.log(`Firestore updated: ${orderId} -> ${status}`);
    return true;
  } catch (error) {
    console.error("Firestore update error:", error);
    return false;
  }
}

// Extract order data from Juspay payload
// Handles both JSON (nested) and form-urlencoded (flat) formats
function extractOrderData(
  body: Record<string, any> | null,
  params: URLSearchParams | null
): { orderId: string; status: string; txnId: string; amount: string } | null {
  // --- Format 1: JSON with nested content.order ---
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

    // --- Format 2: JSON flat (order_id at top level) ---
    if (body?.order_id) {
      return {
        orderId: body.order_id,
        status: body.status || "PENDING",
        txnId: body.txn_id || "",
        amount: String(body.amount || ""),
      };
    }
  }

  // --- Format 3: form-urlencoded flat ---
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
): Promise<{ status: string; txnId: string } | null> {
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

    return { status, txnId: verifyData.txn_id || "" };
  } catch (error) {
    console.error("Server-to-server verification error:", error);
    return null;
  }
}

// GET - browser redirect after payment
export async function GET(req: Request) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const { searchParams } = new URL(req.url);

  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  console.log("=== PAYMENT RETURN GET ===");
  console.log("orderId:", orderId);

  // No orderId - return_url not configured in gateway
  if (!isValidOrderId(orderId)) {
    console.warn("No valid orderId in return - redirecting to status page");
    return NextResponse.redirect(`${BASE_URL}/payment/status`, { status: 302 });
  }

  const orderIdParam = orderId as string;
  const verified = await verifyWithGateway(orderIdParam);
  const finalStatus = verified?.status || "PENDING";

  if (verified?.status === "SUCCESS") {
    await updatePaymentStatus(orderIdParam, "SUCCESS", verified.txnId);
    await finalizeRegistrationForPayment(orderIdParam, verified.txnId);

    return NextResponse.redirect(
      `${BASE_URL}/registration-success?orderId=${encodeURIComponent(orderIdParam)}`,
      { status: 302 }
    );
  }

  return NextResponse.redirect(
    `${BASE_URL}/payment/status?orderId=${encodeURIComponent(orderIdParam)}&status=${encodeURIComponent(finalStatus)}`,
    { status: 302 }
  );
}

// POST - Juspay webhook callback
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const rawText = await req.text();

    let body: Record<string, any> | null = null;
    let params: URLSearchParams | null = null;

    // Parse based on content type
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
      // Try JSON first, fall back to form-urlencoded
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

    // Extract order data from whichever format was received
    const orderData = extractOrderData(body, params);

    if (!orderData) {
      console.error("Could not extract order data from webhook payload");
      console.log("Raw body:", rawText);
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
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    // Map gateway status to internal status
    const confirmedStatus =
      status === "CHARGED" || status === "SUCCESS"
        ? "SUCCESS"
        : status === "AUTHORIZATION_FAILED" ||
          status === "AUTHENTICATION_FAILED" ||
          status === "JUSPAY_DECLINED"
        ? "FAILED"
        : status;

    // --- Server-to-server order confirmation with gateway ---
    let finalStatus = confirmedStatus;
    let finalTxnId = txnId;

    const verified = await verifyWithGateway(orderId);
    if (verified) {
      finalStatus = verified.status;
      finalTxnId = verified.txnId || finalTxnId;
      console.log(`Gateway confirmed status for ${orderId}:`, finalStatus);
    }

    // --- Update Firestore ---
    await updatePaymentStatus(orderId, finalStatus, finalTxnId);

    if (finalStatus === "SUCCESS") {
      await finalizeRegistrationForPayment(orderId, finalTxnId);
    }

    // Check if this is a browser redirect (has Accept: text/html header)
    const acceptHeader = req.headers.get("accept") || "";
    if (acceptHeader.includes("text/html")) {
      const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      if (finalStatus === "SUCCESS") {
        return NextResponse.redirect(
          `${BASE_URL}/registration-success?orderId=${encodeURIComponent(orderId)}`,
          { status: 302 }
        );
      }

      return NextResponse.redirect(
        `${BASE_URL}/payment/status?orderId=${encodeURIComponent(orderId)}&status=${encodeURIComponent(finalStatus)}`,
        { status: 302 }
      );
    }

    // This is a server-to-server webhook - return JSON
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}





