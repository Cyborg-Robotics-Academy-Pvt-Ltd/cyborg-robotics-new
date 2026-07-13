import { adminDb } from "@/lib/firebase-admin";

const CENTER_PREFIXES = {
  "KALYANI NAGAR": "KN",
  "VIMAN NAGAR": "VN",
  MAGARPATTA: "MG",
  KHARADI: "KH",
} as const;

export type AdminCenterLocation = keyof typeof CENTER_PREFIXES;

export function normalizeCenterLocation(center: string): AdminCenterLocation {
  const normalized = center.trim().toUpperCase();

  if (normalized.includes("VIMAN") || normalized.includes("VN")) {
    return "VIMAN NAGAR";
  }
  if (normalized.includes("MAGARPATTA") || normalized.includes("MG")) {
    return "MAGARPATTA";
  }
  if (normalized.includes("KHARADI") || normalized.includes("KH")) {
    return "KHARADI";
  }
  return "KALYANI NAGAR";
}

export async function generatePrnNumberAdmin(
  center: AdminCenterLocation,
): Promise<string> {
  const prefix = CENTER_PREFIXES[center];
  const studentsSnapshot = await adminDb.collection("students").get();
  let maxNumber = 1000;

  studentsSnapshot.forEach((studentDoc) => {
    const prn = studentDoc.data().PrnNumber;
    if (typeof prn !== "string" || !prn.startsWith(`CRA${prefix}`)) return;

    const number = Number.parseInt(prn.replace(`CRA${prefix}`, ""), 10);
    if (!Number.isNaN(number) && number > maxNumber) {
      maxNumber = number;
    }
  });

  return `CRA${prefix}${String(maxNumber + 1).padStart(4, "0")}`;
}
