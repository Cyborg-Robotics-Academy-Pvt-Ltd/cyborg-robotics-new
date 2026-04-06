import { NextResponse } from "next/server";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
      childName,
      age,
      contactNumber,
      locationId,
      locationName,
      ageGroup,
    } = body;

    const missingFields = [
      requireString(childName, "childName"),
      requireString(age, "age"),
      requireString(contactNumber, "contactNumber"),
      requireString(locationId, "locationId"),
      requireString(locationName, "locationName"),
      requireString(ageGroup, "ageGroup"),
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

    if (!/^\d{10}$/.test(contactNumber.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number - must be 10 digits",
        },
        { status: 400 },
      );
    }

    const parsedAge = Number(age);

    if (!Number.isInteger(parsedAge) || parsedAge < 4 || parsedAge > 16) {
      return NextResponse.json(
        {
          success: false,
          message: "Age must be between 4 and 16",
        },
        { status: 400 },
      );
    }

    const workshopName = `Summer Camp 2026 - ${locationName.trim()}`;

    const docRef = await addDoc(collection(db, "workshopRegistrations"), {
      childName: childName.trim(),
      age: parsedAge,
      contactNumber: contactNumber.trim(),
      locationId: locationId.trim(),
      locationName: locationName.trim(),
      ageGroup: ageGroup.trim(),
      workshopKey: `summer-camp-2026-${locationId.trim()}`,
      workshopName,
      studentName: childName.trim(),
      currentAge: String(parsedAge),
      primaryParentContact: contactNumber.trim(),
      selectedCourseName: workshopName,
      paymentType: "booking-request",
      paymentRemark: "Booked from workshops page",
      status: "new",
      source: "workshops-page",
      dateOfRegistration: new Date().toISOString().split("T")[0],
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Booking saved successfully.",
    });
  } catch (error) {
    console.error("Workshop booking error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save booking. Please try again.",
      },
      { status: 500 },
    );
  }
}
