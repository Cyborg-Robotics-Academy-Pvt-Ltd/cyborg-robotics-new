import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    if (!JUSPAY_BASE_URL || !MERCHANT_ID || !API_KEY || !BASE_URL) {
      return NextResponse.json(
        { success: false, message: "Server configuration error" },
        { status: 500 },
      );
    }

    const orderId = `ORDER_${randomUUID()}`;
    const customerId = `WS_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

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
        return_url: `${BASE_URL}/api/payment/return`,
        metadata: {
          flow: "workshop",
          workshopKey,
          workshopName: workshop.title,
          childName,
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
      console.error("Juspay did not return a payment URL for workshop:", juspayData);
      return NextResponse.json(
        { success: false, message: "Payment URL not received. Please try again." },
        { status: 502 },
      );
    }

    await addDoc(collection(db, "payments"), {
      orderId,
      customerId,
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

    return NextResponse.json({
      success: true,
      paymentUrl,
      orderId,
    });
  } catch (error) {
    console.error("Workshop payment initiation error:", error);
    return NextResponse.json(
      { success: false, message: "Payment initiation failed. Please try again." },
      { status: 500 },
    );
  }
}
