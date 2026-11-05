import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import {
  EnquireFormAccessError,
  requireEnquireFormEditor,
} from "@/lib/enquire-form-access";
import { validateSlotFields } from "@/lib/free-trial-validation";
import { getTrialAvailabilityOverride } from "@/lib/trial-availability-server";
import { sendTrialRescheduleEmails } from "@/lib/mailer";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireEnquireFormEditor(req);

    const { id } = await params;
    const body = (await req.json()) as Record<string, unknown>;
    const registrationRef = adminDb
      .collection("freeTrialRegistrations")
      .doc(id);
    const registrationSnapshot = await registrationRef.get();

    if (!registrationSnapshot.exists) {
      return NextResponse.json(
        { success: false, message: "Trial registration was not found." },
        { status: 404 },
      );
    }

    const registration = registrationSnapshot.data();
    if (!registration) {
      return NextResponse.json(
        { success: false, message: "Trial registration was not found." },
        { status: 404 },
      );
    }

    const trialMode =
      registration.trialMode === "offline" ? "offline" : "online";
    const configuredSlots = await getTrialAvailabilityOverride(
      trialMode,
      typeof body.trialDate === "string" ? body.trialDate.trim() : "",
    );
    const slotResult = validateSlotFields(body, trialMode, configuredSlots);

    if (!slotResult.ok) {
      return NextResponse.json(
        { success: false, message: slotResult.message },
        { status: 400 },
      );
    }

    const { date, time } = slotResult.data;

    await registrationRef.update({
      trialDate: date,
      trialTime: time,
      status: "reschedule",
      reminderSent: false,
      reminderSentAt: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await sendTrialRescheduleEmails({
      studentName: registration.studentName || "Student",
      age: Number(registration.age || 0),
      contactNumber: registration.contactNumber || "",
      email: registration.email || "",
      location: registration.location || "",
      trialMode,
      locationName: registration.locationName || "Online trial",
      trialDate: date,
      trialTime: time,
    });

    return NextResponse.json({
      success: true,
      trialDate: date,
      trialTime: time,
    });
  } catch (error) {
    console.error("Unable to reschedule trial:", error);
    if (error instanceof EnquireFormAccessError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reschedule the trial. Please try again.",
      },
      { status: 500 },
    );
  }
}
