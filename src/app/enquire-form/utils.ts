import {
  AVATAR_SHADES,
  LEAD_OUTCOME_OPTIONS,
  LEAD_OUTCOME_STYLES,
  LEAD_TEMP_OPTIONS,
  LEAD_TEMP_STYLES,
  OFFLINE_CENTERS,
  STATUS_OPTIONS,
  STATUS_STYLES,
} from "./constants";
import { LocationType, TrialRegistration } from "./types";

/* =========================================================
   LOCATION HELPERS
========================================================= */

export function normalizeLocation(value: string = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[,\-_/]+/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Calculate mode from location.
 *
 * Kalyani Nagar -> Offline
 * Kharadi       -> Offline
 * Magarpatta    -> Offline
 * Anything else -> Online
 */
export function getTrialModeFromLocation(location: string) {
  const normalizedLocation = normalizeLocation(location);

  const center = OFFLINE_CENTERS.find((center) =>
    center.keywords.some((keyword) =>
      normalizedLocation.includes(normalizeLocation(keyword)),
    ),
  );

  if (!center) {
    return {
      trialMode: "online" as const,
      locationId: null,
      locationName: "",
    };
  }

  return {
    trialMode: "offline" as const,
    locationId: center.id,
    locationName: center.name,
  };
}

/* =========================================================
   MODE HELPER
========================================================= */

export function getLocationType(registration: TrialRegistration): LocationType {
  return registration.trialMode === "offline" ? "offline" : "online";
}

/* =========================================================
   DISPLAY LOCATION
========================================================= */

/**
 * IMPORTANT:
 *
 * Location and Mode are two different things.
 *
 * Location:
 *   Show actual location entered by user.
 *
 * Mode:
 *   Show Online / Offline.
 *
 * Offline:
 *   Prefer backend center name.
 *
 * Online:
 *   Show actual entered location.
 */
export function getDisplayLocation(registration: TrialRegistration): string {
  const userLocation = registration.location?.trim();

  const mode = getLocationType(registration);

  /**
   * OFFLINE
   *
   * Example:
   * location = "Kalyani"
   * locationName = "Kalyani Nagar, Pune"
   *
   * Display:
   * Kalyani Nagar, Pune
   */
  if (mode === "offline") {
    return registration.locationName?.trim() || userLocation || "Offline";
  }

  /**
   * ONLINE
   *
   * Example:
   * location = "Wagholi, Pune"
   *
   * Display:
   * Wagholi, Pune
   *
   * NOT "Online".
   */
  return userLocation || "Location not provided";
}

/* =========================================================
   STYLE LOOKUPS
========================================================= */

export function statusStyle(status: string) {
  return STATUS_STYLES[status?.toLowerCase()] ?? STATUS_STYLES.booked;
}

export function leadTempStyle(value: string) {
  return LEAD_TEMP_STYLES[value?.toLowerCase()] ?? LEAD_TEMP_STYLES.warm;
}

export function leadOutcomeStyle(value: string) {
  return LEAD_OUTCOME_STYLES[value?.toLowerCase()] ?? LEAD_OUTCOME_STYLES.opened;
}

export function avatarShade(name: string) {
  const sum = name?.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) ?? 0;

  return AVATAR_SHADES[sum % AVATAR_SHADES.length];
}

export function initials(name: string) {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

/* =========================================================
   LABEL LOOKUPS (value -> display label)
========================================================= */

export function statusLabel(value?: string) {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? "Booked";
}

export function leadTempLabel(value?: string) {
  return LEAD_TEMP_OPTIONS.find((o) => o.value === value)?.label ?? "Warm";
}

export function leadOutcomeLabel(value?: string) {
  return LEAD_OUTCOME_OPTIONS.find((o) => o.value === value)?.label ?? "Opened";
}

/* =========================================================
   DATE HELPERS
========================================================= */

/**
 * Local-date <-> "YYYY-MM-DD" helpers for the
 * calendar filter pickers.
 *
 * Deliberately avoids `toISOString()` (UTC-based,
 * can roll the date back a day for IST users).
 */
export function dateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ymdToDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function formatYMDDisplay(value: string): string {
  const date = ymdToDate(value);

  if (!date) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}