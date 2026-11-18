import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import {
  EnquireFormAccessError,
  requireEnquireFormTrialSlotEditor,
} from "@/lib/enquire-form-access";
import {
  slotIdFor,
  validateSlotFields,
} from "@/lib/free-trial-validation";
import { getTrialModeFromLocation } from "@/app/enquire-form/utils";
import { OFFLINE_CENTERS } from "@/app/enquire-form/constants";
import {
  sendTrialBookingEmails,
  sendTrialRescheduleEmails,
} from "@/lib/mailer";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireEnquireFormTrialSlotEditor(req);

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

    const savedTrialMode =
      registration.trialMode === "offline" || registration.trialMode === "online"
        ? registration.trialMode
        : null;
    const inferredTrialMode = getTrialModeFromLocation(
      [registration.location, registration.locationName]
        .filter((value): value is string => typeof value === "string")
        .join(" "),
    ).trialMode;
    const isFirstBooking = !registration.trialDate || !registration.trialTime;
    const unrestrictedAddSlot =
      (actor.role === "sales" || actor.role === "admin") &&
      body.action === "add-slot" &&
      isFirstBooking;
    const requestedTrialMode =
      body.trialMode === "online" || body.trialMode === "offline"
        ? body.trialMode
        : null;
    const trialMode: "online" | "offline" =
      (unrestrictedAddSlot ? requestedTrialMode : null) ??
      savedTrialMode ??
      inferredTrialMode;
    const inferredOfflineLocation = getTrialModeFromLocation(
      [registration.location, registration.locationName]
        .filter((value): value is string => typeof value === "string")
        .join(" "),
    );
    const offlineCenter =
      OFFLINE_CENTERS.find((center) => center.id === registration.locationId) ??
      OFFLINE_CENTERS.find(
        (center) => center.id === inferredOfflineLocation.locationId,
      ) ??
      OFFLINE_CENTERS[0];
    const locationName =
      unrestrictedAddSlot && trialMode === "online"
        ? "Online"
        : unrestrictedAddSlot
          ? offlineCenter.name
          : registration.locationName || "Online trial";
    const manuallyEnteredTime =
      typeof body.trialTime === "string" ? body.trialTime.trim() : "";
    const slotResult = validateSlotFields(body, trialMode, [manuallyEnteredTime]);

    if (!slotResult.ok) {
      return NextResponse.json(
        { success: false, message: slotResult.message },
        { status: 400 },
      );
    }

    const { date, time } = slotResult.data;
    if (
      unrestrictedAddSlot &&
      new Date(`${date}T00:00:00.000Z`).getUTCDay() === 2
    ) {
      return NextResponse.json(
        { success: false, message: "Trial slots are unavailable on Tuesdays." },
        { status: 400 },
      );
    }

    const nextSlotRef = adminDb
      .collection("trialSlotCounters")
      .doc(slotIdFor(date, time));
    const previousSlotRef =
      !isFirstBooking &&
      (registration.trialDate !== date || registration.trialTime !== time)
        ? adminDb
            .collection("trialSlotCounters")
            .doc(slotIdFor(registration.trialDate, registration.trialTime))
        : null;

    await adminDb.runTransaction(async (transaction) => {
      const nextSlotSnapshot = await transaction.get(nextSlotRef);
      const previousSlotSnapshot = previousSlotRef
        ? await transaction.get(previousSlotRef)
        : null;
      const nextCount = Number(nextSlotSnapshot.data()?.count ?? 0);
      const isSameSlot =
        registration.trialDate === date && registration.trialTime === time;

      if (!isSameSlot) {
        transaction.set(
          nextSlotRef,
          {
            date,
            time,
            count: nextCount + 1,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }

      if (previousSlotRef && previousSlotSnapshot) {
        const previousCount = Number(previousSlotSnapshot.data()?.count ?? 0);
        transaction.set(
          previousSlotRef,
          {
            count: Math.max(previousCount - 1, 0),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }

      transaction.update(registrationRef, {
        trialDate: date,
        trialTime: time,
        ...(unrestrictedAddSlot
          ? {
              trialMode,
              locationId: trialMode === "offline" ? offlineCenter.id : null,
              locationName,
            }
          : {}),
        ...(isFirstBooking
          ? {
              bookingOrigin:
                body.bookingOrigin === "follow-up" ||
                (Array.isArray(registration.followUpHistory) &&
                  registration.followUpHistory.length > 0)
                  ? "follow-up"
                  : "direct",
            }
          : {}),
        status: isFirstBooking ? "booked" : "reschedule",
        trialConfirmationEmailSentAt: null,
        reminderSent: false,
        reminderSentAt: null,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    const emailData = {
      studentName: registration.studentName || "Student",
      age: Number(registration.age || 0),
      contactNumber: registration.contactNumber || "",
      email: registration.email || "",
      location: registration.location || "",
      trialMode,
      locationName,
      trialDate: date,
      trialTime: time,
    };
    try {
      if (isFirstBooking) {
        await sendTrialBookingEmails(emailData);
      } else {
        await sendTrialRescheduleEmails(emailData);
      }
    } catch (mailError) {
      console.error("Unable to send trial booking email:", id, mailError);
    }

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
