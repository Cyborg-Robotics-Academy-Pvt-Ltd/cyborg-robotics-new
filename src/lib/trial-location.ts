export type TrialMode = "online" | "offline";

export type OfflineCenter = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type TrialLocationResult = {
  trialMode: TrialMode;
  locationId: string | null;
  locationName: string;
  distanceKm: number | null;
};

/* =========================================================
   OFFLINE TRIAL CONFIGURATION
========================================================= */

/**
 * Maximum distance allowed for an offline trial.
 *
 * <= 20 km  => Offline
 * > 20 km   => Online
 *
 * IMPORTANT:
 * All offline trials are conducted at the
 * Kalyani Nagar Headquarters.
 */
export const OFFLINE_RADIUS_KM = 20;

/**
 * Kalyani Nagar Headquarters
 *
 * This is the ONLY offline trial location.
 *
 * Kharadi and Magarpatta are intentionally removed
 * from the trial-booking location logic.
 */
export const KALYANI_NAGAR_HQ: OfflineCenter = {
  id: "kalyani-nagar-pune",
  name: "Kalyani Nagar Headquarters",
  lat: 18.5483,
  lng: 73.9027,
};

/**
 * Kept as an array so existing code that imports
 * OFFLINE_CENTERS does not break.
 *
 * There is only ONE offline center.
 */
export const OFFLINE_CENTERS: OfflineCenter[] = [
  KALYANI_NAGAR_HQ,
];

/* =========================================================
   DISTANCE CALCULATION
========================================================= */

/**
 * Calculate distance between two coordinates
 * using the Haversine formula.
 */
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const earthRadiusKm = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLng =
    ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return earthRadiusKm * c;
}

/* =========================================================
   TRIAL MODE
========================================================= */

/**
 * Determine trial mode from user's coordinates.
 *
 * FLOW:
 *
 * User coordinates
 *       ↓
 * Calculate distance from Kalyani Nagar HQ
 *       ↓
 * <= 20 km
 *       ↓
 * OFFLINE
 *       ↓
 * Kalyani Nagar Headquarters
 *
 * > 20 km
 *       ↓
 * ONLINE
 *
 * IMPORTANT:
 *
 * Distance is used ONLY to determine
 * online/offline mode.
 *
 * We do NOT expose "nearest center"
 * to the user.
 */
export function getTrialModeFromCoordinates(
  latitude: number,
  longitude: number,
): TrialLocationResult {
  /* -------------------------------------------------------
     INVALID COORDINATES
  ------------------------------------------------------- */

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return {
      trialMode: "online",
      locationId: null,
      locationName: "Online",
      distanceKm: null,
    };
  }

  /* -------------------------------------------------------
     CALCULATE DISTANCE FROM KALYANI NAGAR HQ
  ------------------------------------------------------- */

  const distanceKm =
    calculateDistanceKm(
      latitude,
      longitude,
      KALYANI_NAGAR_HQ.lat,
      KALYANI_NAGAR_HQ.lng,
    );

  const roundedDistanceKm =
    Number(distanceKm.toFixed(2));

  /* -------------------------------------------------------
     OFFLINE
  ------------------------------------------------------- */

  if (
    distanceKm <= OFFLINE_RADIUS_KM
  ) {
    return {
      trialMode: "offline",

      locationId:
        KALYANI_NAGAR_HQ.id,

      locationName:
        KALYANI_NAGAR_HQ.name,

      distanceKm:
        roundedDistanceKm,
    };
  }

  /* -------------------------------------------------------
     ONLINE
  ------------------------------------------------------- */

  return {
    trialMode: "online",

    locationId: null,

    locationName: "Online",

    distanceKm:
      roundedDistanceKm,
  };
}

