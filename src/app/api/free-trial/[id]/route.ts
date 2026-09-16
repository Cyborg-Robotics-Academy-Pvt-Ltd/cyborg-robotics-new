import { NextResponse } from "next/server";

import {
  doc,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  MAX_BOOKINGS_PER_SLOT,
  getTrimmedString,
  slotIdFor,
  validateCoreFields,
  validateSlotFields,
} from "@/lib/free-trial-validation";

import {
  getTrialModeFromCoordinates,
} from "@/lib/trial-location";

import { sendTrialBookingEmails } from "@/lib/mailer";

/* =========================================================
   TYPES
========================================================= */

type LocationPayload = {
  location: string;
  latitude: number | null;
  longitude: number | null;
};

type RegistrationData = {
  status?: string;
  trialDate?: string | null;
  trialTime?: string | null;
};

/* =========================================================
   HELPERS
========================================================= */

function getNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function getLocationPayload(
  body: Record<string, unknown>,
): LocationPayload {
  const location = getTrimmedString(body.location);

  const latitude = getNumber(
    body.latitude ?? body.locationLat,
  );

  const longitude = getNumber(
    body.longitude ?? body.locationLng,
  );

  return {
    location,
    latitude,
    longitude,
  };
}

/* =========================================================
   PATCH
========================================================= */

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  const { id } = await params;

  let body: Record<string, unknown> = {};

  try {
    console.log("🔥 FREE TRIAL PATCH:", id);

    body = await req.json();

    console.log("📦 PATCH DATA:", body);

    /* =====================================================
       1. VALIDATE CORE FIELDS
    ===================================================== */

    const coreResult = validateCoreFields(body);

    if (!coreResult.ok) {
      return NextResponse.json(
        {
          success: false,
          message: coreResult.message,
        },
        {
          status: 400,
        },
      );
    }

    const core = coreResult.data;

    /* =====================================================
       2. GET LOCATION
    ===================================================== */

    const locationPayload =
      getLocationPayload(body);

    if (!locationPayload.location) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter your location.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       3. REQUIRE COORDINATES
    ===================================================== */

    if (
      locationPayload.latitude === null ||
      locationPayload.longitude === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select your location from the location suggestions.",
        },
        {
          status: 400,
        },
      );
    }

    /* =====================================================
       4. CALCULATE NEAREST CENTER
    ===================================================== */

    const locationResult =
      getTrialModeFromCoordinates(
        locationPayload.latitude,
        locationPayload.longitude,
      );

    console.log("📍 USER LOCATION:", {
      text: locationPayload.location,
      latitude: locationPayload.latitude,
      longitude: locationPayload.longitude,
    });

    console.log(
      "📍 TRIAL MODE:",
      locationResult.trialMode,
    );

    console.log(
      "📍 NEAREST CENTER:",
      locationResult.locationName,
    );

    console.log(
      "📍 DISTANCE:",
      locationResult.distanceKm,
      "km",
    );

    /* =====================================================
       5. REGISTRATION REF
    ===================================================== */

    const registrationRef = doc(
      db,
      "freeTrialRegistrations",
      id,
    );

    /* =====================================================
       6. CHECK SLOT
    ===================================================== */

    const hasSlot =
      getTrimmedString(body.trialDate).length > 0 &&
      getTrimmedString(body.trialTime).length > 0;

    /* =====================================================
       STEP 1
    ===================================================== */

    if (!hasSlot) {
      await updateDoc(registrationRef, {
        ...core,

        location: locationPayload.location,

        latitude: locationPayload.latitude,

        longitude: locationPayload.longitude,

        trialMode: locationResult.trialMode,

        locationId: locationResult.locationId,

        locationName: locationResult.locationName,

        distanceFromCenterKm:
          locationResult.distanceKm,

        status: "incomplete",

        updatedAt: serverTimestamp(),
      });

      console.log(
        "✅ INCOMPLETE LEAD UPDATED:",
        id,
      );

      return NextResponse.json(
        {
          success: true,

          id,

          status: "incomplete",

          trialMode:
            locationResult.trialMode,

          locationId:
            locationResult.locationId,

          locationName:
            locationResult.locationName,

          distanceKm:
            locationResult.distanceKm,

          message: "Lead updated.",
        },
        {
          status: 200,
        },
      );
    }

    /* =====================================================
       STEP 2 - VALIDATE SLOT
    ===================================================== */

    const slotResult =
      validateSlotFields(body);

    if (!slotResult.ok) {
      return NextResponse.json(
        {
          success: false,
          message: slotResult.message,
        },
        {
          status: 400,
        },
      );
    }

    const { date, time } =
      slotResult.data;

    /* =====================================================
       SLOT REF
    ===================================================== */

    const slotRef = doc(
      db,
      "trialSlotCounters",
      slotIdFor(date, time),
    );

    /* Tracks whether this call actually claimed a (new) slot, so we only
       email on a genuine booking/change — not on a duplicate resubmit of
       the exact same slot. */
    let shouldSendEmail = false;

    /* =====================================================
       TRANSACTION
    ===================================================== */

    await runTransaction(
      db,
      async (transaction) => {
        /* -----------------------------------------------
           READ REGISTRATION
        ------------------------------------------------ */

        const registrationSnap =
          await transaction.get(
            registrationRef,
          );

        if (!registrationSnap.exists()) {
          throw new Error(
            "LEAD_NOT_FOUND",
          );
        }

        const existing =
          registrationSnap.data() as RegistrationData;

        /* -----------------------------------------------
           IDEMPOTENCY
        ------------------------------------------------ */

        const alreadyBookedThisSlot =
          existing.status === "booked" &&
          existing.trialDate === date &&
          existing.trialTime === time;

        if (alreadyBookedThisSlot) {
          transaction.update(
            registrationRef,
            {
              ...core,

              location:
                locationPayload.location,

              latitude:
                locationPayload.latitude,

              longitude:
                locationPayload.longitude,

              trialMode:
                locationResult.trialMode,

              locationId:
                locationResult.locationId,

              locationName:
                locationResult.locationName,

              distanceFromCenterKm:
                locationResult.distanceKm,

              updatedAt:
                serverTimestamp(),
            },
          );

          return;
        }

        /* -----------------------------------------------
           PREVIOUS SLOT
        ------------------------------------------------ */

        let previousSlotRef:
          ReturnType<typeof doc> | null =
          null;

        let previousSlotSnap:
          DocumentSnapshot<DocumentData> | null =
          null;

        if (
          existing.status === "booked" &&
          existing.trialDate &&
          existing.trialTime
        ) {
          previousSlotRef = doc(
            db,
            "trialSlotCounters",
            slotIdFor(
              existing.trialDate,
              existing.trialTime,
            ),
          );

          previousSlotSnap =
            await transaction.get(
              previousSlotRef,
            );
        }

        /* -----------------------------------------------
           NEW SLOT
        ------------------------------------------------ */

        const newSlotSnap =
          await transaction.get(slotRef);

        const newSlotCount =
          newSlotSnap.exists()
            ? Number(
                newSlotSnap.data()?.count ?? 0,
              )
            : 0;

        console.log(
          "📊 NEW SLOT COUNT:",
          newSlotCount,
        );

        if (
          newSlotCount >=
          MAX_BOOKINGS_PER_SLOT
        ) {
          throw new Error(
            "SLOT_FULL",
          );
        }

        /* -----------------------------------------------
           FREE PREVIOUS SLOT
        ------------------------------------------------ */

        if (
          previousSlotRef &&
          previousSlotSnap
        ) {
          const previousCount =
            previousSlotSnap.exists()
              ? Number(
                  previousSlotSnap.data()?.count ??
                    0,
                )
              : 0;

          transaction.set(
            previousSlotRef,
            {
              count: Math.max(
                previousCount - 1,
                0,
              ),

              updatedAt:
                serverTimestamp(),
            },
            {
              merge: true,
            },
          );
        }

        /* -----------------------------------------------
           CLAIM NEW SLOT
        ------------------------------------------------ */

        transaction.set(
          slotRef,
          {
            date,

            time,

            count:
              newSlotCount + 1,

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          },
        );

        /* -----------------------------------------------
           FINAL REGISTRATION
        ------------------------------------------------ */

        transaction.update(
          registrationRef,
          {
            ...core,

            location:
              locationPayload.location,

            latitude:
              locationPayload.latitude,

            longitude:
              locationPayload.longitude,

            trialMode:
              locationResult.trialMode,

            locationId:
              locationResult.locationId,

            locationName:
              locationResult.locationName,

            distanceFromCenterKm:
              locationResult.distanceKm,

            trialDate: date,

            trialTime: time,

            status: "booked",

            updatedAt:
              serverTimestamp(),
          },
        );

        shouldSendEmail = true;
      },
    );

    /* =====================================================
       SEND CONFIRMATION EMAILS (post-transaction, only on
       a genuine new/changed booking — not a duplicate resubmit)
    ===================================================== */

    if (shouldSendEmail) {
      try {
        await sendTrialBookingEmails({
          studentName: core.studentName,
          age: core.age,
          contactNumber: core.contactNumber,
          email: core.email,
          location: locationPayload.location,
          trialMode: locationResult.trialMode,
          locationName: locationResult.locationName,
          trialDate: date,
          trialTime: time,
        });
      } catch (mailError) {
        // Booking already succeeded in Firestore — don't fail the request
        // just because email delivery had an issue.
        console.error(
          "❌ TRIAL CONFIRMATION EMAIL FAILED:",
          id,
          mailError,
        );
      }
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    console.log(
      "✅ LEAD FINALIZED:",
      id,
    );

    return NextResponse.json(
      {
        success: true,

        id,

        status: "new",

        trialMode:
          locationResult.trialMode,

        locationId:
          locationResult.locationId,

        locationName:
          locationResult.locationName,

        distanceKm:
          locationResult.distanceKm,

        message:
          "Trial registration confirmed.",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    /* =====================================================
       SLOT FULL
    ===================================================== */

    if (
      error instanceof Error &&
      error.message === "SLOT_FULL"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This slot is fully booked. Please pick another time.",
        },
        {
          status: 409,
        },
      );
    }

    /* =====================================================
       LEAD NOT FOUND
    ===================================================== */

    if (
      error instanceof Error &&
      error.message === "LEAD_NOT_FOUND"
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Registration not found. Please start again.",
        },
        {
          status: 404,
        },
      );
    }

    /* =====================================================
       GENERAL ERROR
    ===================================================== */

    console.error(
      "❌ FREE TRIAL PATCH ERROR:",
      id,
      error,
    );

    console.error(
      "❌ REQUEST BODY:",
      body,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Unable to update registration. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}
