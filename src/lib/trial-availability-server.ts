import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import type { TrialMode } from "@/lib/trial-location";
import {
  isValidTrialDate,
  isValidTrialTime,
} from "@/lib/trial-availability";

const availabilityCollection = "trialAvailability";

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

export async function listTrialAvailabilityOverrides(
  mode: TrialMode,
  from: string,
  to: string,
) {
  const snapshots = await adminDb
    .collection(availabilityCollection)
    .where("date", ">=", from)
    .where("date", "<=", to)
    .get();

  return Object.fromEntries(
    snapshots.docs.flatMap((snapshot) => {
      const data = snapshot.data();
      if (data.mode !== mode) return [];
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
}

export async function deleteTrialAvailabilityOverride(
  mode: TrialMode,
  date: string,
) {
  await adminDb
    .collection(availabilityCollection)
    .doc(availabilityDocId(mode, date))
    .delete();
}

export { isValidTrialDate, isValidTrialTime };
