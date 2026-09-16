import { NextResponse } from "next/server";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { validateSlotFields } from "@/lib/free-trial-validation";
import { sendTrialRescheduleEmails } from "@/lib/mailer";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const slotResult = validateSlotFields(body);

    if (!slotResult.ok) {
      return NextResponse.json({ success: false, message: slotResult.message }, { status: 400 });
    }

    const registrationRef = doc(db, "freeTrialRegistrations", id);
    const registrationSnapshot = await getDoc(registrationRef);

    if (!registrationSnapshot.exists()) {
      return NextResponse.json({ success: false, message: "Trial registration was not found." }, { status: 404 });
    }

    const registration = registrationSnapshot.data();
    const { date, time } = slotResult.data;

    await updateDoc(registrationRef, {
      trialDate: date,
      trialTime: time,
      status: "reschedule",
      reminderSent: false,
      reminderSentAt: null,
      updatedAt: serverTimestamp(),
    });

    await sendTrialRescheduleEmails({
      studentName: registration.studentName || "Student",
      age: Number(registration.age || 0),
      contactNumber: registration.contactNumber || "",
      email: registration.email || "",
      location: registration.location || "",
      trialMode: registration.trialMode === "offline" ? "offline" : "online",
      locationName: registration.locationName || "Online trial",
      trialDate: date,
      trialTime: time,
    });

    return NextResponse.json({ success: true, trialDate: date, trialTime: time });
  } catch (error) {
    console.error("Unable to reschedule trial:", error);
    return NextResponse.json(
      { success: false, message: "Unable to reschedule the trial. Please try again." },
      { status: 500 },
    );
  }
}
