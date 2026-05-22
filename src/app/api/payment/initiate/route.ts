import { NextResponse } from "next/server";
import { generateCustomerId } from "@/lib/customer-id-utils";
import { generateOrderId } from "@/lib/order-id-utils";
import { buildPaymentUrlFromRequest } from "@/lib/payment-url-validation";
import {
  createPaymentSessionBinding,
  createPaymentSessionCookieValue,
  derivePaymentOwnerSeed,
  PAYMENT_SESSION_COOKIE_NAME,
} from "@/lib/payment-session-binding";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// ─── HARDCODED COURSES (SYNC WITH FRONTEND) ───
const COURSES = {
  regular: { key: "regular", title: "Regular Course", price: 5000 },
  camp: { key: "camp", title: "Summer Camp", price: 8000 },
  yearlong: { key: "yearlong", title: "Year-Long Program", price: 15000 },
} as const;

type CourseKey = keyof typeof COURSES;

function requireString(value: unknown, fieldName: string): string | null {
  if (!value || typeof value !== "string" || !value.trim()) return fieldName;
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Payment Initiation Request:", body);

    const {
      studentName,
      dateOfBirth,
      currentAge,
      schoolName,
      class: studentClass,
      board,
      primaryParentType,
      primaryParentName,
      primaryParentContact,
      primaryParentEmail,
      userId,
      currentAddress,
      permanentAddress,
      courseKey,
      paidAmount,
      paymentRemark,
    } = body;

    // --- Input validation ---
    const missingFields: string[] = [];

    const fields: [unknown, string][] = [
      [studentName, "studentName"],
      [dateOfBirth, "dateOfBirth"],
      [currentAge, "currentAge"],
      [schoolName, "schoolName"],
      [studentClass, "class"],
      [board, "board"],
      [primaryParentType, "primaryParentType"],
      [primaryParentName, "primaryParentName"],
      [primaryParentContact, "primaryParentContact"],
      [primaryParentEmail, "primaryParentEmail"],
      [currentAddress, "currentAddress"],
      [permanentAddress, "permanentAddress"],
      [courseKey, "courseKey"],
    ];

    for (const [value, name] of fields) {
      const error = requireString(value, name);
      if (error) {
        console.log(`Missing field: ${name}, value:`, value);
        missingFields.push(name);
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(primaryParentEmail)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(primaryParentContact)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number - must be 10 digits",
        },
        { status: 400 }
      );
    }

    // --- Course validation (HARDCODED) ---
    const course = COURSES[courseKey as CourseKey];
    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid course selection. Valid options: ${Object.keys(COURSES).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const coursePrice = course.price;
    if (!coursePrice || coursePrice <= 0) {
      return NextResponse.json(
        { success: false, message: "Course price is not configured" },
        { status: 500 }
      );
    }

    // --- Amount resolution ---
    const parsedAmount = Number(paidAmount);
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const amount = parsedAmount;
    const resolvedPaymentType = amount === coursePrice ? "full" : "partial";

    // --- Environment variables ---
    const JUSPAY_BASE_URL = process.env.JUSPAY_BASE_URL;
    const MERCHANT_ID = process.env.HDFC_MERCHANT_ID;
    const API_KEY = process.env.HDFC_API_KEY;
    if (!JUSPAY_BASE_URL || !MERCHANT_ID || !API_KEY) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 }
      );
    }

    // --- Generate IDs ---
    const orderId = generateOrderId();
    const customerSeed = userId || primaryParentEmail;
    const customerId = generateCustomerId(customerSeed);
    const paymentOwnerSeed = derivePaymentOwnerSeed(userId, primaryParentEmail);
    const paymentSessionBinding = createPaymentSessionBinding(
      orderId,
      customerId,
      paymentOwnerSeed
    );

    const returnUrl = buildPaymentUrlFromRequest(req, "/api/payment/return");

    // --- Create Juspay order ---
    const juspayResponse = await fetch(`${JUSPAY_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-merchantid": MERCHANT_ID,
        Authorization: `Basic ${Buffer.from(API_KEY + ":").toString("base64")}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        amount,
        currency: "INR",
        customer_id: customerId,
        customer_email: primaryParentEmail,
        customer_phone: primaryParentContact,
        return_url: returnUrl.toString(),
        metadata: {
          studentName,
          courseName: course.title,
          courseKey,
          internalCustomerId: customerId,
          paymentType: resolvedPaymentType,
        },
      }),
    });

    const juspayData = await juspayResponse.json();

    if (!juspayResponse.ok) {
      console.error("Juspay order creation failed:", juspayData);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create payment order. Please try again.",
        },
        { status: 502 }
      );
    }

    const paymentUrl = juspayData?.payment_links?.web;
    if (!paymentUrl) {
      console.error("Juspay did not return a payment URL:", juspayData);
      return NextResponse.json(
        { success: false, message: "Payment URL not received. Please try again." },
        { status: 502 }
      );
    }

    // --- Save to Firestore ---
    await addDoc(collection(db, "payments"), {
      orderId,
      customerId,
      ownerSeedHash: paymentSessionBinding.ownerSeedHash,
      sessionBindingKey: paymentSessionBinding.sessionBindingKey,
      sessionBindingExpiresAt: paymentSessionBinding.expiresAt,
      sessionBindingSource: userId ? "userId" : "email",
      studentName,
      courseName: course.title,
      courseKey,
      parentEmail: primaryParentEmail,
      parentPhone: primaryParentContact,
      studentData: {
        studentName,
        dateOfBirth,
        currentAge,
        schoolName,
        class: studentClass,
        board,
      },
      parentData: {
        primaryParentType,
        primaryParentName,
        primaryParentContact,
        primaryParentEmail,
      },
      addressData: {
        currentAddress,
        permanentAddress,
      },
      course: {
        key: courseKey,
        name: course.title,
        price: coursePrice,
      },
      registrationDraft: {
        studentName,
        dateOfBirth,
        currentAge,
        schoolName,
        class: studentClass,
        board,
        primaryParentType,
        primaryParentName,
        primaryParentContact,
        primaryParentEmail,
        currentAddress,
        permanentAddress,
        selectedCourseKey: courseKey,
        selectedCourseName: course.title,
        selectedCourseFee: coursePrice,
        paymentType: resolvedPaymentType,
        paidAmount: amount,
        paymentRemark: String(paymentRemark || "").trim(),
      },
      amount,
      currency: "INR",
      coursePrice,
      paymentType: resolvedPaymentType,
      status: "PENDING",
      createdAt: serverTimestamp(),
    });

    const response = NextResponse.json({ success: true, paymentUrl, orderId });

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
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Payment initiation failed. Please try again.",
      },
      { status: 500 }
    );
  }
}