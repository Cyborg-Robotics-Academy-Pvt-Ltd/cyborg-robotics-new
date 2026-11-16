import { FieldValue } from "firebase-admin/firestore";
import { revalidateTag, unstable_cache } from "next/cache";

import { adminDb } from "@/lib/firebase-admin";
import type { TrialMode } from "@/lib/trial-location";
import {
  isValidTrialDate,
  isValidTrialTime,
} from "@/lib/trial-availability";

const availabilityCollection = "trialAvailability";
const availabilityCacheTag = "trial-availability";

function availabilityDocId(mode: TrialMode, date: string) {
  return `${mode}_${date}`;
}

export async function getTrialAvailabilityOverride(
  mode: TrialMode,
  date: string,
): Promise<string[] | undefined> {
  if (!isValidTrialDate(date)) return undefined;

  const snapshot = await adminDb
    .collection(availabilityCollection)
    .doc(availabilityDocId(mode, date))
    .get();

  if (!snapshot.exists) return undefined;

  const slots = snapshot.data()?.slots;
  if (
    !Array.isArray(slots) ||
    !slots.every((slot) => isValidTrialTime(slot))
  ) {
    throw new Error(`Invalid availability configuration for ${mode} ${date}.`);
  }

  return slots;
}

const getCachedTrialAvailabilityOverrides = unstable_cache(
  async (mode: TrialMode, from: string, to: string) => {
    const snapshots = await adminDb
      .collection(availabilityCollection)
      .where("mode", "==", mode)
      .where("date", ">=", from)
      .where("date", "<=", to)
      .get();

    return Object.fromEntries(
      snapshots.docs.flatMap((snapshot) => {
        const data = snapshot.data();
        if (
          !isValidTrialDate(data.date) ||
          !Array.isArray(data.slots) ||
          !data.slots.every(isValidTrialTime)
        ) {
          throw new Error(`Invalid availability configuration in ${snapshot.id}.`);
        }
        return [[data.date, data.slots as string[]]];
      }),
    );
  },
  ["trial-availability-overrides"],
  {
    // Availability changes go through the helpers below, which invalidate this
    // tag after a successful write. Keep reads cached until that happens.
    revalidate: false,
    tags: [availabilityCacheTag],
  },
);

export async function listTrialAvailabilityOverrides(
  mode: TrialMode,
  from: string,
  to: string,
) {
  return getCachedTrialAvailabilityOverrides(mode, from, to);
}

export async function saveTrialAvailabilityOverride(
  mode: TrialMode,
  date: string,
  slots: string[],
) {
  await adminDb
    .collection(availabilityCollection)
    .doc(availabilityDocId(mode, date))
    .set({
      mode,
      date,
      slots,
      updatedAt: FieldValue.serverTimestamp(),
    });
  revalidateTag(availabilityCacheTag, { expire: 0 });
}

export async function saveTrialAvailabilityOverrides(
  mode: TrialMode,
    dates: string[],
    slots: string[],
) {
    const batch = adminDb.batch();
    dates.forEach((date) => {
      batch.set(
        adminDb
          .collection(availabilityCollection)
          .doc(availabilityDocId(mode, date)),
        {
          mode,
          date,
          slots,
          updatedAt: FieldValue.serverTimestamp(),
        },
      );
    });
    await batch.commit();
    revalidateTag(availabilityCacheTag, { expire: 0 });
}

export async function deleteTrialAvailabilityOverride(
    mode: TrialMode,
    date: string,
) {
  await adminDb
    .collection(availabilityCollection)
    .doc(availabilityDocId(mode, date))
    .delete();
  revalidateTag(availabilityCacheTag, { expire: 0 });
}

export { isValidTrialDate, isValidTrialTime };
