import { NextResponse } from "next/server";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateOrderId } from "@/lib/order-id-utils";
import { generateCustomerId } from "@/lib/customer-id-utils";
import { buildPaymentUrlFromRequest } from "@/lib/payment-url-validation";
import {
  createPaymentSessionBinding,
  createPaymentSessionCookieValue,
  derivePaymentOwnerSeed,
  PAYMENT_SESSION_COOKIE_NAME,
} from "@/lib/payment-session-binding";

const WORKSHOPS = {
  "lego-robotics-workshop": {
    title: "LEGO Robotics Workshop",
    amount: 499,
  },
} as const;

function requireString(value: unknown, fieldName: string): string | null {
  if (!value || typeof value !== "string" || !value.trim()) {
    return fieldName;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      workshopKey,
      email,
      userId,
      contactNumber,
      childName,
      age,
      city,
      area,
    } = body;

    const missingFields = [
      requireString(workshopKey, "workshopKey"),
      requireString(email, "email"),
      requireString(contactNumber, "contactNumber"),
      requireString(childName, "childName"),
      requireString(age, "age"),
      requireString(city, "city"),
      requireString(area, "area"),
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

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 },
      );
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      return NextResponse.json(
        { success: false, message: "Invalid phone number - must be 10 digits" },
        { status: 400 },
      );
    }

    const parsedAge = Number(age);
    if (Number.isNaN(parsedAge) || parsedAge < 4 || parsedAge > 16) {
      return NextResponse.json(
        { success: false, message: "Age must be between 4 and 16" },
        { status: 400 },
      );
    }

    const workshop = WORKSHOPS[workshopKey as keyof typeof WORKSHOPS];

    if (!workshop) {
      return NextResponse.json(
        { success: false, message: "Invalid workshop selection" },
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
    const customerSeed = userId || email;
    const customerId = generateCustomerId(customerSeed);
    const paymentOwnerSeed = derivePaymentOwnerSeed(userId, email);
    const paymentSessionBinding = createPaymentSessionBinding(orderId, customerId, paymentOwnerSeed);
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
        amount: workshop.amount,
        currency: "INR",
        customer_id: customerId,
        customer_email: email,
        customer_phone: contactNumber,
        return_url: returnUrl.toString(),
        metadata: {
          flow: "workshop",
          workshopKey,
          workshopName: workshop.title,
          childName,
          internalCustomerId: customerId,
        },
      }),
    });

    const juspayData = await juspayResponse.json();

    if (!juspayResponse.ok) {
      console.error("Workshop payment order creation failed:", juspayData);
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
        "Juspay did not return a payment URL for workshop:",
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
      sessionBindingSource: userId ? "userId" : "email",
      amount: workshop.amount,
      currency: "INR",
      status: "PENDING",
      paymentType: "full",
      paymentFlow: "workshop",
      workshop: {
        key: workshopKey,
        name: workshop.title,
        fee: workshop.amount,
      },
      workshopRegistrationDraft: {
        email: email.trim(),
        contactNumber: contactNumber.trim(),
        childName: childName.trim(),
        age: parsedAge,
        city: city.trim(),
        area: area.trim(),
      },
      studentName: childName.trim(),
      studentEmail: email.trim(),
      studentPhone: contactNumber.trim(),
      courseName: workshop.title,
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
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
    }

    return response;
  } catch (error) {
    console.error("Workshop payment initiation error:", error);
    return NextResponse.json(
      { success: false, message: "Payment initiation failed. Please try again." },
      { status: 500 },
    );
  }
}





