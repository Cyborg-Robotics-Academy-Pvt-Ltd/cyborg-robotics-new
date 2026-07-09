import { NextResponse } from "next/server";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import {
  createPaymentSessionBinding,
  createPaymentSessionCookieValue,
  derivePaymentOwnerSeed,
  PAYMENT_SESSION_COOKIE_NAME,
} from "@/lib/payment-session-binding";
import { buildPaymentUrlFromRequest } from "@/lib/payment-url-validation";
import {
  CODEFEST_COMPETITION,
  normalizeCodefestRegistrationForm,
  validateCodefestRegistrationForm,
  type CodefestRegistrationFormData,
} from "@/lib/codefest-registration-validation";
import { db } from "@/lib/firebase";
import { generateCustomerId } from "@/lib/customer-id-utils";
import { generateOrderId } from "@/lib/order-id-utils";

function requireString(value: unknown, fieldName: string): string | null {
  if (!value || typeof value !== "string" || !value.trim()) {
    return fieldName;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CodefestRegistrationFormData> & {
      userId?: string;
    };

    const missingFields = [
      requireString(body.fullName, "fullName"),
      requireString(body.gradeClass, "gradeClass"),
      requireString(body.cityState, "cityState"),
      requireString(body.fullResidentialAddress, "fullResidentialAddress"),
      requireString(body.parentGuardianName, "parentGuardianName"),
      requireString(body.emailAddress, "emailAddress"),
      requireString(
        body.parentGuardianContactNumber,
        "parentGuardianContactNumber",
      ),
      requireString(body.preferredCodingPlatform, "preferredCodingPlatform"),
    ].filter(Boolean);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const normalizedFormData = normalizeCodefestRegistrationForm({
      fullName: body.fullName || "",
      gradeClass: body.gradeClass || "",
      cityState: body.cityState || "",
      fullResidentialAddress: body.fullResidentialAddress || "",
      parentGuardianName: body.parentGuardianName || "",
      emailAddress: body.emailAddress || "",
      parentGuardianContactNumber: body.parentGuardianContactNumber || "",
      emergencyContactNumber: body.emergencyContactNumber || "",
      preferredCodingPlatform: body.preferredCodingPlatform || "",
      agreedToTerms: Boolean(body.agreedToTerms),
    });

    const formErrors = validateCodefestRegistrationForm(normalizedFormData);
    if (Object.keys(formErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fix the highlighted fields and try again.",
          errors: formErrors,
        },
        { status: 400 },
      );
    }

    const JUSPAY_BASE_URL = process.env.JUSPAY_BASE_URL;
    const MERCHANT_ID = process.env.HDFC_MERCHANT_ID;
    const API_KEY = process.env.HDFC_API_KEY;

    if (!JUSPAY_BASE_URL || !MERCHANT_ID || !API_KEY) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 },
      );
    }

    const orderId = generateOrderId();
    const customerSeed = body.userId || normalizedFormData.emailAddress;
    const customerId = generateCustomerId(customerSeed);
    const paymentOwnerSeed = derivePaymentOwnerSeed(
      body.userId,
      normalizedFormData.emailAddress,
    );
    const paymentSessionBinding = createPaymentSessionBinding(
      orderId,
      customerId,
      paymentOwnerSeed,
    );
    const returnUrl = buildPaymentUrlFromRequest(req, "/api/payment/return");

    const juspayResponse = await fetch(`${JUSPAY_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-merchantid": MERCHANT_ID,
        Authorization: `Basic ${Buffer.from(`${API_KEY}:`).toString("base64")}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        amount: CODEFEST_COMPETITION.amount,
        currency: "INR",
        customer_id: customerId,
        customer_email: normalizedFormData.emailAddress,
        customer_phone: normalizedFormData.parentGuardianContactNumber,
        return_url: returnUrl.toString(),
        metadata: {
          flow: "competition",
          competitionKey: CODEFEST_COMPETITION.key,
          competitionName: CODEFEST_COMPETITION.name,
          participantName: normalizedFormData.fullName,
          internalCustomerId: customerId,
        },
      }),
    });

    const juspayData = await juspayResponse.json();
    if (!juspayResponse.ok) {
      console.error("Competition payment order creation failed:", juspayData);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create payment order. Please try again.",
        },
        { status: 502 },
      );
    }

    const paymentUrl = juspayData?.payment_links?.web;
    if (!paymentUrl) {
      console.error(
        "Juspay did not return a payment URL for competition:",
        juspayData,
      );
      return NextResponse.json(
        { success: false, message: "Payment URL not received. Please try again." },
        { status: 502 },
      );
    }

    await addDoc(collection(db, "payments"), {
      orderId,
      customerId,
      ownerSeedHash: paymentSessionBinding.ownerSeedHash,
      sessionBindingKey: paymentSessionBinding.sessionBindingKey,
      sessionBindingExpiresAt: paymentSessionBinding.expiresAt,
      sessionBindingSource: body.userId ? "userId" : "email",
      amount: CODEFEST_COMPETITION.amount,
      currency: "INR",
      status: "PENDING",
      paymentType: "entry-fee",
      paymentFlow: "competition",
      competition: {
        key: CODEFEST_COMPETITION.key,
        name: CODEFEST_COMPETITION.name,
        fee: CODEFEST_COMPETITION.amount,
      },
      competitionRegistrationDraft: normalizedFormData,
      studentName: normalizedFormData.fullName,
      studentEmail: normalizedFormData.emailAddress,
      studentPhone: normalizedFormData.parentGuardianContactNumber,
      courseName: CODEFEST_COMPETITION.name,
      createdAt: serverTimestamp(),
    });

    const response = NextResponse.json({
      success: true,
      paymentUrl,
      orderId,
    });

    const cookieValue = createPaymentSessionCookieValue(paymentSessionBinding);
    if (cookieValue) {
      response.cookies.set(PAYMENT_SESSION_COOKIE_NAME, cookieValue, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 8,
      });
    }

    return response;
  } catch (error) {
    console.error("Competition payment initiation error:", error);
    return NextResponse.json(
      { success: false, message: "Payment initiation failed. Please try again." },
      { status: 500 },
    );
  }
}
