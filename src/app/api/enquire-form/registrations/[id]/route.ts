import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import {
  EnquireFormAccessError,
  requireEnquireFormEditor,
} from "@/lib/enquire-form-access";
import { OFFLINE_CENTERS } from "@/app/enquire-form/constants";

export const runtime = "nodejs";

const EDITABLE_FIELDS = new Set([
  "studentName",
  "age",
  "contactNumber",
  "email",
  "trialDate",
  "trialTime",
  "location",
  "trialMode",
  "locationId",
  "locationName",
  "salesSelectedCenter",
  "status",
  "remark",
  "counsellorRemark",
  "leadTemp",
  "nextFollowUpDate",
  "followUpHistory",
  "leadOutcome",
  "closeRemark",
]);

const STRING_FIELDS = new Set([
  "studentName",
  "contactNumber",
  "email",
  "trialDate",
  "trialTime",
  "location",
  "trialMode",
  "locationName",
  "status",
  "remark",
  "counsellorRemark",
  "leadTemp",
  "nextFollowUpDate",
  "leadOutcome",
  "closeRemark",
]);

const FIELD_OPTIONS: Record<string, Set<string>> = {
  trialMode: new Set(["online", "offline"]),
  salesSelectedCenter: new Set(OFFLINE_CENTERS.map((center) => center.id)),
  status: new Set(["", "booked", "show", "no-show", "reschedule", "cancelled"]),
  leadTemp: new Set(["", "hot", "warm", "cold"]),
  leadOutcome: new Set(["", "opened", "closed", "nurture", "later", "joined"]),
};

function isValidUpdate(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const entries = Object.entries(value);
  if (entries.length === 0) return false;

  return entries.every(([field, fieldValue]) => {
    if (!EDITABLE_FIELDS.has(field)) return false;
    if (field === "salesSelectedCenter") {
      return (
        fieldValue === null ||
        (typeof fieldValue === "string" &&
          FIELD_OPTIONS.salesSelectedCenter.has(fieldValue))
      );
    }
    if (STRING_FIELDS.has(field)) {
      return (
        typeof fieldValue === "string" &&
        (!FIELD_OPTIONS[field] || FIELD_OPTIONS[field].has(fieldValue))
      );
    }
    if (field === "age") {
      return typeof fieldValue === "number" && Number.isFinite(fieldValue);
    }
    if (field === "locationId") {
      return fieldValue === null || typeof fieldValue === "string";
    }
    return field === "followUpHistory" && Array.isArray(fieldValue);
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const actor = await requireEnquireFormEditor(request);

    const updates: unknown = await request.json();
    if (!isValidUpdate(updates)) {
      return NextResponse.json(
        { success: false, message: "Invalid enquiry updates." },
        { status: 400 },
      );
    }
    if (actor.role === "marketing") {
      return NextResponse.json(
        { success: false, message: "Marketing accounts have read-only access." },
        { status: 403 },
      );
    }
    if (
      actor.role === "trainer" &&
      (Object.keys(updates).length !== 1 || !Object.hasOwn(updates, "status"))
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Trainers can only update trial status.",
        },
        { status: 403 },
      );
    }

    const { id } = await params;
    const registration = adminDb.collection("freeTrialRegistrations").doc(id);
    const snapshot = await registration.get();
    if (!snapshot.exists) {
      return NextResponse.json(
        { success: false, message: "Enquiry not found." },
        { status: 404 },
      );
    }

    const shouldResetTrialEmailSentAt = [
      "age",
      "email",
      "trialDate",
      "trialMode",
      "trialTime",
    ].some((field) => Object.hasOwn(updates, field));

    const existingData = snapshot.data();
    const isFirstTrialBooking =
      Object.hasOwn(updates, "trialDate") &&
      typeof updates.trialDate === "string" &&
      updates.trialDate.length > 0 &&
      !existingData?.trialDate;

    await registration.update({
      ...updates,
      ...(isFirstTrialBooking
        ? {
            bookingOrigin:
              Array.isArray(existingData?.followUpHistory) &&
              existingData.followUpHistory.length > 0
                ? "follow-up"
                : "direct",
          }
        : {}),
      ...(shouldResetTrialEmailSentAt
        ? { trialConfirmationEmailSentAt: null }
        : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof EnquireFormAccessError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("Unable to update enquiry:", error);
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : "";
    return NextResponse.json(
      {
        success: false,
        message: errorCode
          ? `Unable to update the enquiry (server error ${errorCode}).`
          : "Unable to update the enquiry.",
      },
      { status: 500 },
    );
  }
}
