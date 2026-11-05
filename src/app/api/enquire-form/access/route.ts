import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase-admin";
import {
  EnquireFormAccessError,
  getEnquireFormActor,
  requireEnquireFormAdmin,
} from "@/lib/enquire-form-access";

export const runtime = "nodejs";

const ACCESS_DOCUMENT = "appSettings/enquireFormAccess";

function isActive(profile: {
  exists: boolean;
  data: () => { status?: string } | undefined;
}) {
  return (
    profile.exists &&
    !["inactive", "pending"].includes(profile.data()?.status ?? "")
  );
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed.";
  const status = error instanceof EnquireFormAccessError ? error.status : 500;
  return NextResponse.json(
    {
      success: false,
      message:
        status === 500 ? "Unable to update Enquire form access." : message,
    },
    { status },
  );
}

export async function GET(request: Request) {
  try {
    const requester = await getEnquireFormActor(request);
    if (requester.role !== "admin" && requester.role !== "trainer") {
      throw new EnquireFormAccessError("Forbidden", 403);
    }
    const accessRef = adminDb.doc(ACCESS_DOCUMENT);
    const accessSnapshot = await accessRef.get();
    const selectedTrainerId =
      typeof accessSnapshot.data()?.selectedTrainerId === "string"
        ? accessSnapshot.data()?.selectedTrainerId
        : null;

    if (requester.role !== "admin") {
      return NextResponse.json({ success: true, selectedTrainerId });
    }

    const trainerSnapshot = await adminDb.collection("trainers").get();
    const trainers = trainerSnapshot.docs
      .filter((trainer) => isActive(trainer))
      .map((trainer) => {
        const data = trainer.data();
        const name =
          typeof data.name === "string" && data.name.trim()
            ? data.name.trim()
            : typeof data.fullName === "string" && data.fullName.trim()
              ? data.fullName.trim()
              : typeof data.displayName === "string" && data.displayName.trim()
                ? data.displayName.trim()
                : typeof data.username === "string" && data.username.trim()
                  ? data.username.trim()
                  : "Unnamed trainer";
        return {
          id: trainer.id,
          name,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ success: true, selectedTrainerId, trainers });
  } catch (error) {
    console.error("Unable to load Enquire form access:", error);
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireEnquireFormAdmin(request);

    const body: unknown = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("trainerId" in body) ||
      !(
        body.trainerId === null ||
        (typeof body.trainerId === "string" && body.trainerId.length > 0)
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Choose a valid trainer." },
        { status: 400 },
      );
    }

    const trainerId = body.trainerId;
    if (typeof trainerId === "string") {
      const trainer = await adminDb.collection("trainers").doc(trainerId).get();
      if (!isActive(trainer)) {
        return NextResponse.json(
          { success: false, message: "Choose an active trainer." },
          { status: 400 },
        );
      }
    }

    await adminDb.doc(ACCESS_DOCUMENT).set({
      selectedTrainerId: trainerId,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, selectedTrainerId: trainerId });
  } catch (error) {
    console.error("Unable to save Enquire form access:", error);
    return errorResponse(error);
  }
}
