import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import {
  EnquireFormAccessError,
  requireEnquireFormTrialSlotEditor,
} from "@/lib/enquire-form-access";
import {
  getTrialModeFromCoordinates,
  KALYANI_NAGAR_HQ,
} from "@/lib/trial-location";
import { slotIdFor, validateSlotFields } from "@/lib/free-trial-validation";
import { getTrialAvailabilityOverride } from "@/lib/trial-availability-server";
import {
  DEFAULT_OFFLINE_TRIAL_SLOTS,
  DEFAULT_ONLINE_TRIAL_SLOTS,
} from "@/lib/trial-availability";
import { sendTrialBookingEmails } from "@/lib/mailer";

export const runtime = "nodejs";

const PROGRAM_OPTIONS = new Set([
  "Competition",
  "Regular Classes",
  "Diwali workshop",
  "Year Long Course",
  "Camp",
  "Workshop",
]);

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function registrationDateInIndia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function POST(request: Request) {
  try {
    await requireEnquireFormTrialSlotEditor(request);

    const body = (await request.json()) as Record<string, unknown>;
    const studentName = getString(body.studentName);
    const contactNumber = getString(body.contactNumber);
    const email = getString(body.email).toLowerCase();
    const location = getString(body.location);
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const programInterest = getString(body.programInterest);
    const referralSource = getString(body.referralSource);
    const age = Number(body.age);

    if (
      !studentName ||
      !Number.isInteger(age) ||
      age < 4 ||
      age > 18 ||
      !/^\d{10}$/.test(contactNumber) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !location ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !PROGRAM_OPTIONS.has(programInterest)
    ) {
      return NextResponse.json(
        { success: false, message: "Please complete all required fields with valid details." },
        { status: 400 },
      );
    }

    const detectedLocation = getTrialModeFromCoordinates(latitude, longitude);
    const requestedTrialMode =
      body.trialMode === "online" || body.trialMode === "offline"
        ? body.trialMode
        : detectedLocation.trialMode;
    const locationResult =
      requestedTrialMode === detectedLocation.trialMode
        ? detectedLocation
        : requestedTrialMode === "offline"
          ? {
              ...detectedLocation,
              trialMode: "offline" as const,
              locationId: KALYANI_NAGAR_HQ.id,
              locationName: KALYANI_NAGAR_HQ.name,
            }
          : {
              ...detectedLocation,
              trialMode: "online" as const,
              locationId: null,
              locationName: "Online",
            };
    const trialDate = getString(body.trialDate);
    const trialTime = getString(body.trialTime);
    if (!trialDate || !trialTime) {
      return NextResponse.json(
        { success: false, message: "Select both a trial date and time." },
        { status: 400 },
      );
    }

    const configuredSlots = await getTrialAvailabilityOverride(
      locationResult.trialMode,
      trialDate,
    );
    if (new Date(`${trialDate}T00:00:00.000Z`).getUTCDay() === 2) {
      return NextResponse.json(
        { success: false, message: "Trial slots are unavailable on Tuesdays." },
        { status: 400 },
      );
    }
    const permittedSlots = configuredSlots?.length
      ? configuredSlots
      : locationResult.trialMode === "offline"
        ? DEFAULT_OFFLINE_TRIAL_SLOTS
        : DEFAULT_ONLINE_TRIAL_SLOTS;
    const slotResult = validateSlotFields(
      { trialDate, trialTime },
      locationResult.trialMode,
      permittedSlots,
    );
    if (!slotResult.ok) {
      return NextResponse.json(
        { success: false, message: slotResult.message },
        { status: 400 },
      );
    }
    const booking = slotResult.data;

    const registration = adminDb.collection("freeTrialRegistrations").doc();
    const registrationData = {
      studentName,
      age,
      contactNumber,
      email,
      programInterest,
      referralSource,
      location,
      trialMode: locationResult.trialMode,
      locationId: locationResult.locationId,
      locationName: locationResult.locationName,
      preferredCenter: null,
      salesSelectedCenter: null,
      trialDate: booking.date,
      trialTime: booking.time,
      trialConfirmationEmailSentAt: null,
      bookingOrigin: "direct",
      status: "booked",
      remark: "",
      counsellorRemark: "",
      leadTemp: "",
      nextFollowUpDate: null,
      followUpHistory: [],
      leadOutcome: "",
      closeRemark: "",
      assignedTo: null,
      assignedToName: null,
      assignedToEmail: null,
      source: "manual-entry",
      createdFrom: "enquire-form-manual-entry",
      dateOfRegistration: registrationDateInIndia(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const slotRef = adminDb
      .collection("trialSlotCounters")
      .doc(slotIdFor(booking.date, booking.time));
    await adminDb.runTransaction(async (transaction) => {
      const slotSnapshot = await transaction.get(slotRef);
      const count = Number(slotSnapshot.data()?.count ?? 0);
      transaction.set(
        slotRef,
        {
          date: booking.date,
          time: booking.time,
          count: count + 1,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      transaction.create(registration, registrationData);
    });

    try {
      await sendTrialBookingEmails({
        studentName,
        age,
        contactNumber,
        email,
        location,
        trialMode: locationResult.trialMode,
        locationName: locationResult.locationName,
        trialDate: booking.date,
        trialTime: booking.time,
      });
    } catch (mailError) {
      console.error("Unable to send manual trial booking emails:", registration.id, mailError);
    }

    return NextResponse.json(
      {
        success: true,
        id: registration.id,
        trialMode: locationResult.trialMode,
        status: "booked",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof EnquireFormAccessError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    console.error("Unable to create manual enquiry:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create the enquiry. Please try again." },
      { status: 500 },
    );
  }
}
