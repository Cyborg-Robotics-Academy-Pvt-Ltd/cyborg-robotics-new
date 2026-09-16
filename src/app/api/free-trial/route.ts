import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  MAX_BOOKINGS_PER_SLOT,
  getTrimmedString,
  slotIdFor,
  validateCoreFields,
  validateSlotFields,
} from "@/lib/free-trial-validation";

/* -------------------------------------------------------------------------- */
/* KALYANI NAGAR - ONLY TRIAL CENTER                                         */
/* -------------------------------------------------------------------------- */

const TRIAL_CENTER = {
  id: "kalyani-nagar-pune",
  name: "Kalyani Nagar, Pune",
};

/* -------------------------------------------------------------------------- */
/* SIMPLE SERVER CACHE                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Cache is only an optimization.
 *
 * Firestore remains the source of truth.
 *
 * key:
 *   phone:xxxxxxxxxx
 *   email:example@email.com
 *
 * value:
 *   true = already enquired
 *
 * TTL:
 *   5 minutes
 */

type CacheEntry = {
  alreadyEnquired: boolean;
  expiresAt: number;
};

const enquiryCache = new Map<string, CacheEntry>();

const CACHE_TTL = 5 * 60 * 1000;

/* -------------------------------------------------------------------------- */
/* NORMALIZE CACHE VALUE                                                     */
/* -------------------------------------------------------------------------- */

function normalizeCacheValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "");
}

/* -------------------------------------------------------------------------- */
/* GET CACHE                                                                 */
/* -------------------------------------------------------------------------- */

function getCachedEnquiry(key: string) {
  const cached = enquiryCache.get(key);

  if (!cached) {
    return null;
  }

  /* Remove expired cache */

  if (Date.now() > cached.expiresAt) {
    enquiryCache.delete(key);
    return null;
  }

  return cached.alreadyEnquired;
}

/* -------------------------------------------------------------------------- */
/* SET CACHE                                                                 */
/* -------------------------------------------------------------------------- */

function setCachedEnquiry(
  key: string,
  alreadyEnquired: boolean,
) {
  enquiryCache.set(key, {
    alreadyEnquired,
    expiresAt: Date.now() + CACHE_TTL,
  });
}

/* -------------------------------------------------------------------------- */
/* INVALIDATE CACHE                                                          */
/* -------------------------------------------------------------------------- */

function invalidateEnquiryCache(values: string[]) {
  for (const value of values) {
    if (!value) continue;

    const normalized = normalizeCacheValue(value);

    if (!normalized) continue;

    enquiryCache.delete(`phone:${normalized}`);
    enquiryCache.delete(`email:${normalized}`);
  }
}

/* -------------------------------------------------------------------------- */
/* CHECK FIRESTORE FOR EXISTING ENQUIRY                                      */
/* -------------------------------------------------------------------------- */

async function checkExistingEnquiry(
  phone: string,
  email: string,
) {
  const normalizedPhone =
    normalizeCacheValue(phone);

  const normalizedEmail =
    normalizeCacheValue(email);

  /* ---------------------------------------------------------------------- */
  /* PHONE CACHE                                                            */
  /* ---------------------------------------------------------------------- */

  if (normalizedPhone) {
    const cachedPhone = getCachedEnquiry(
      `phone:${normalizedPhone}`,
    );

    if (cachedPhone === true) {
      return true;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* EMAIL CACHE                                                            */
  /* ---------------------------------------------------------------------- */

  if (normalizedEmail) {
    const cachedEmail = getCachedEnquiry(
      `email:${normalizedEmail}`,
    );

    if (cachedEmail === true) {
      return true;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* FIRESTORE PHONE CHECK                                                  */
  /* ---------------------------------------------------------------------- */

  if (normalizedPhone) {
    const phoneQuery = query(
      collection(
        db,
        "freeTrialRegistrations",
      ),
      where("phone", "==", phone),
      limit(1),
    );

    const phoneSnapshot =
      await getDocs(phoneQuery);

    if (!phoneSnapshot.empty) {
      setCachedEnquiry(
        `phone:${normalizedPhone}`,
        true,
      );

      if (normalizedEmail) {
        setCachedEnquiry(
          `email:${normalizedEmail}`,
          true,
        );
      }

      return true;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* FIRESTORE EMAIL CHECK                                                  */
  /* ---------------------------------------------------------------------- */

  if (normalizedEmail) {
    const emailQuery = query(
      collection(
        db,
        "freeTrialRegistrations",
      ),
      where("email", "==", email),
      limit(1),
    );

    const emailSnapshot =
      await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      setCachedEnquiry(
        `email:${normalizedEmail}`,
        true,
      );

      if (normalizedPhone) {
        setCachedEnquiry(
          `phone:${normalizedPhone}`,
          true,
        );
      }

      return true;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* NOTHING FOUND                                                          */
  /* ---------------------------------------------------------------------- */

  if (normalizedPhone) {
    setCachedEnquiry(
      `phone:${normalizedPhone}`,
      false,
    );
  }

  if (normalizedEmail) {
    setCachedEnquiry(
      `email:${normalizedEmail}`,
      false,
    );
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* POST                                                                       */
/* -------------------------------------------------------------------------- */

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};

  try {
    console.log("🔥 FREE TRIAL API HIT");

    body = await req.json();

    console.log(
      "📦 RECEIVED DATA:",
      body,
    );

    /* ====================================================================== */
    /* 1. VALIDATE CORE FIELDS                                                */
    /* ====================================================================== */

    const coreResult =
      validateCoreFields(body);

    if (!coreResult.ok) {
      console.error(
        "❌ Core validation failed:",
        coreResult.message,
      );

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

    /* ====================================================================== */
    /* 2. GET USER LOCATION                                                   */
    /* ====================================================================== */

    /**
     * We still accept location/userLocation
     * so old frontend code does not break.
     *
     * BUT:
     * Trial center is ALWAYS Kalyani Nagar.
     */

    const userLocation =
      getTrimmedString(
        body.location ??
          body.userLocation,
      );

    console.log(
      "📍 USER LOCATION:",
      userLocation,
    );

    if (!userLocation) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter your location.",
        },
        {
          status: 400,
        },
      );
    }

    /* ====================================================================== */
    /* 3. ALWAYS USE KALYANI NAGAR                                            */
    /* ====================================================================== */

    const locationResult = {
      trialMode: "offline" as const,

      locationId:
        TRIAL_CENTER.id,

      locationName:
        TRIAL_CENTER.name,
    };

    console.log(
      "🏫 TRIAL CENTER:",
      locationResult.locationName,
    );

    /* ====================================================================== */
    /* 4. CHECK ALREADY ENQUIRED                                              */
    /* ====================================================================== */

    const phone =
      getTrimmedString(
        body.phone ??
          (core as Record<string, unknown>)
            .phone,
      );

    const email =
      getTrimmedString(
        body.email ??
          (core as Record<string, unknown>)
            .email,
      );

    console.log(
      "📞 CHECKING PHONE:",
      phone,
    );

    console.log(
      "📧 CHECKING EMAIL:",
      email,
    );

    const alreadyEnquired =
      await checkExistingEnquiry(
        phone,
        "",
      );

    if (alreadyEnquired) {
      console.log(
        "⚠️ USER ALREADY ENQUIRED",
      );

      return NextResponse.json(
        {
          success: false,

          alreadyEnquired: true,

          status: "already_enquired",

          trialMode:
            locationResult.trialMode,

          locationId:
            locationResult.locationId,

          locationName:
            locationResult.locationName,

          message:
            "You have already enquired for a free trial.",
        },
        {
          status: 409,
        },
      );
    }

    /* ====================================================================== */
    /* 5. CHECK SLOT                                                          */
    /* ====================================================================== */

    const hasSlot =
      getTrimmedString(
        body.trialDate,
      ).length > 0 &&
      getTrimmedString(
        body.trialTime,
      ).length > 0;

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    /* ====================================================================== */
    /* STEP 1 - SAVE INCOMPLETE LEAD                                          */
    /* ====================================================================== */

    if (!hasSlot) {
      const registrationRef =
        doc(
          collection(
            db,
            "freeTrialRegistrations",
          ),
        );

      const registrationData = {
        ...core,

        /* User entered location */

        location: userLocation,

        /* ALWAYS KALYANI NAGAR */

        trialMode:
          locationResult.trialMode,

        locationId:
          locationResult.locationId,

        locationName:
          locationResult.locationName,

        trialDate: null,

        trialTime: null,

        status: "incomplete",

        nextFollowUpDate: null,

        assignedTo: null,

        remark: "",

        source: "website",

        createdFrom:
          "free-trial-page",

        dateOfRegistration:
          today,

        createdAt:
          serverTimestamp(),
      };

      console.log(
        "💾 INCOMPLETE LEAD:",
        {
          id: registrationRef.id,
          ...registrationData,
        },
      );

      await setDoc(
        registrationRef,
        registrationData,
      );

      /* -------------------------------------------------------------------- */
      /* CACHE USER AS ALREADY ENQUIRED                                      */
      /* -------------------------------------------------------------------- */

      if (phone) {
        setCachedEnquiry(
          `phone:${normalizeCacheValue(phone)}`,
          true,
        );
      }

      if (email) {
        setCachedEnquiry(
          `email:${normalizeCacheValue(email)}`,
          true,
        );
      }

      return NextResponse.json(
        {
          success: true,

          alreadyEnquired: false,

          id: registrationRef.id,

          status: "incomplete",

          trialMode:
            locationResult.trialMode,

          locationId:
            locationResult.locationId,

          locationName:
            locationResult.locationName,

          message:
            "Lead captured.",
        },
        {
          status: 201,
        },
      );
    }

    /* ====================================================================== */
    /* STEP 2 - VALIDATE SLOT                                                 */
    /* ====================================================================== */

    const slotResult =
      validateSlotFields(body);

    if (!slotResult.ok) {
      console.error(
        "❌ Slot validation failed:",
        slotResult.message,
      );

      return NextResponse.json(
        {
          success: false,
          message:
            slotResult.message,
        },
        {
          status: 400,
        },
      );
    }

    const {
      date,
      time,
    } = slotResult.data;

    /* ====================================================================== */
    /* 6. SLOT ID                                                             */
    /* ====================================================================== */

    const slotId =
      slotIdFor(
        date,
        time,
      );

    const slotRef =
      doc(
        db,
        "trialSlotCounters",
        slotId,
      );

    /* ====================================================================== */
    /* 7. REGISTRATION REF                                                    */
    /* ====================================================================== */

    const registrationRef =
      doc(
        collection(
          db,
          "freeTrialRegistrations",
        ),
      );

    /* ====================================================================== */
    /* 8. REGISTRATION DATA                                                   */
    /* ====================================================================== */

    const registrationData = {
      ...core,

      /* User entered location */

      location: userLocation,

      /* ALWAYS KALYANI NAGAR */

      trialMode:
        locationResult.trialMode,

      locationId:
        locationResult.locationId,

      locationName:
        locationResult.locationName,

      trialDate: date,

      trialTime: time,

      status: "booked",

      nextFollowUpDate: null,

      assignedTo: null,

      remark: "",

      source: "website",

      createdFrom:
        "free-trial-page",

      dateOfRegistration:
        today,

      createdAt:
        serverTimestamp(),
    };

    console.log(
      "💾 DATA GOING TO FIRESTORE:",
      {
        documentId:
          registrationRef.id,

        ...registrationData,
      },
    );

    /* ====================================================================== */
    /* 9. SLOT CAPACITY + REGISTRATION                                       */
    /* ====================================================================== */

    await runTransaction(
      db,
      async (transaction) => {
        const slotSnap =
          await transaction.get(
            slotRef,
          );

        const currentCount =
          slotSnap.exists()
            ? slotSnap.data()
                .count ?? 0
            : 0;

        console.log(
          "📊 CURRENT SLOT COUNT:",
          currentCount,
        );

        if (
          currentCount >=
          MAX_BOOKINGS_PER_SLOT
        ) {
          throw new Error(
            "SLOT_FULL",
          );
        }

        /* -------------------------------------------------------------- */
        /* UPDATE SLOT COUNTER                                             */
        /* -------------------------------------------------------------- */

        transaction.set(
          slotRef,
          {
            date,

            time,

            count:
              currentCount + 1,

            updatedAt:
              serverTimestamp(),
          },
          {
            merge: true,
          },
        );

        /* -------------------------------------------------------------- */
        /* SAVE REGISTRATION                                               */
        /* -------------------------------------------------------------- */

        transaction.set(
          registrationRef,
          registrationData,
        );
      },
    );

    /* ====================================================================== */
    /* 10. UPDATE CACHE                                                       */
    /* ====================================================================== */

    if (phone) {
      setCachedEnquiry(
        `phone:${normalizeCacheValue(phone)}`,
        true,
      );
    }

    if (email) {
      setCachedEnquiry(
        `email:${normalizeCacheValue(email)}`,
        true,
      );
    }

    console.log(
      "✅ FIRESTORE DATA SAVED:",
      registrationRef.id,
    );

    /* ====================================================================== */
    /* SUCCESS                                                                */
    /* ====================================================================== */

    return NextResponse.json(
      {
        success: true,

        alreadyEnquired: false,

        id: registrationRef.id,

        status: "new",

        trialMode:
          locationResult.trialMode,

        locationId:
          locationResult.locationId,

        locationName:
          locationResult.locationName,

        message:
          "Trial registration saved successfully.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    /* ====================================================================== */
    /* SLOT FULL                                                              */
    /* ====================================================================== */

    if (
      error instanceof Error &&
      error.message ===
        "SLOT_FULL"
    ) {
      console.warn(
        "⚠️ SLOT FULL",
        body,
      );

      return NextResponse.json(
        {
          success: false,

          alreadyEnquired: false,

          message:
            "This slot is fully booked. Please pick another time.",
        },
        {
          status: 409,
        },
      );
    }

    /* ====================================================================== */
    /* GENERAL ERROR                                                          */
    /* ====================================================================== */

    console.error(
      "❌ FREE TRIAL REGISTRATION ERROR:",
      error,
    );

    console.error(
      "❌ FAILED REQUEST DATA:",
      body,
    );

    return NextResponse.json(
      {
        success: false,

        alreadyEnquired: false,

        message:
          "Unable to save registration. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}
