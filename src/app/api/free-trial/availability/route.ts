import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  deleteTrialAvailabilityOverride,
  isValidTrialDate,
  isValidTrialTime,
  listTrialAvailabilityOverrides,
  saveTrialAvailabilityOverride,
} from "@/lib/trial-availability-server";
import type { TrialMode } from "@/lib/trial-location";

export const runtime = "nodejs";

function isTrialMode(value: string | null): value is TrialMode {
  return value === "online" || value === "offline";
}

async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;
  if (!token) throw new Error("Unauthorized");

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    throw new Error("Unauthorized");
  }
  const admin = await adminDb.collection("admins").doc(decoded.uid).get();
  if (!admin.exists || ["inactive", "pending"].includes(admin.data()?.status)) {
    throw new Error("Forbidden");
  }
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed.";
  const status =
    message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
  return NextResponse.json(
    {
      success: false,
      message:
        status === 500
          ? "Unable to process the availability request."
          : message,
    },
    { status },
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (
      !isTrialMode(mode) ||
      !isValidTrialDate(from) ||
      !isValidTrialDate(to) ||
      from > to
    ) {
      return NextResponse.json(
        { success: false, message: "A valid mode and date range are required." },
        { status: 400 },
      );
    }
    const rangeDays =
      (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000;
    if (rangeDays > 62) {
      return NextResponse.json(
        { success: false, message: "Date range cannot exceed 63 days." },
        { status: 400 },
      );
    }

    const availability = await listTrialAvailabilityOverrides(mode, from, to);
    return NextResponse.json({ success: true, availability });
  } catch (error) {
    console.error("Unable to load trial availability:", error);
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin(request);
    const body = (await request.json()) as Record<string, unknown>;
    const mode = body.mode;
    const date = body.date;
    const slots = body.slots;

    if (
      (mode !== "online" && mode !== "offline") ||
      !isValidTrialDate(date) ||
      !Array.isArray(slots) ||
      !slots.every(isValidTrialTime) ||
      new Set(slots).size !== slots.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid mode, date, and unique time slots are required.",
        },
        { status: 400 },
      );
    }

    await saveTrialAvailabilityOverride(mode, date, slots);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unable to save trial availability:", error);
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const date = searchParams.get("date");
    if (!isTrialMode(mode) || !isValidTrialDate(date)) {
      return NextResponse.json(
        { success: false, message: "A valid mode and date are required." },
        { status: 400 },
      );
    }

    await deleteTrialAvailabilityOverride(mode, date);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unable to reset trial availability:", error);
    return errorResponse(error);
  }
}
