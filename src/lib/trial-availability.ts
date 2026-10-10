import type { TrialMode } from "@/lib/trial-location";

export const DEFAULT_ONLINE_TRIAL_SLOTS = [
  "10:00",
  "12:00",
];

export const DEFAULT_OFFLINE_TRIAL_SLOTS = [
  "10:00",
  "18:00"
];

export type TrialAvailabilityOverrides = Record<string, string[]>;

export function getDefaultTrialSlots(mode: TrialMode, date: string) {
  const dayOfWeek = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  if (mode === "offline" && dayOfWeek !== 0 && dayOfWeek !== 6) return [];
  if (mode === "online" && dayOfWeek === 0) return [];

  return mode === "offline"
    ? DEFAULT_OFFLINE_TRIAL_SLOTS
    : DEFAULT_ONLINE_TRIAL_SLOTS;
}

export function isValidTrialTime(value: unknown): value is string {
  return (
    typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)
  );
}

export function isValidTrialDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}
