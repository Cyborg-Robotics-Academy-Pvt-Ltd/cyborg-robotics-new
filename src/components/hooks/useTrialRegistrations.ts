import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";

import { authReady, db } from "@/lib/firebase";
import { readApiJson } from "@/lib/read-api-json";
import { getTrialModeFromLocation } from "@/app/enquire-form/utils";
import {
  EditDraft,
  FollowUpEntry,
  LeadOutcome,
  LeadTemp,
  TrialRegistration,
  TrialStatus,
} from "@/app/enquire-form/types";

const COLLECTION = "freeTrialRegistrations";

async function getAuthToken(): Promise<string> {
  const auth = await authReady;
  const token = await auth?.currentUser?.getIdToken();
  if (!token) throw new Error("Please sign in before updating enquiries.");
  return token;
}

function getCreatedAtMillis(value: unknown): number {
  if (typeof value === "number") {
    return value > 0 && value < 1_000_000_000_000 ? value * 1000 : value;
  }

  if (value instanceof Date) return value.getTime();
  if (typeof value === "string") return Date.parse(value) || 0;

  if (value && typeof value === "object") {
    const timestamp = value as {
      toMillis?: () => number;
      toDate?: () => Date;
      seconds?: number;
      _seconds?: number;
    };

    if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
    if (typeof timestamp.toDate === "function") return timestamp.toDate().getTime();
    if (typeof timestamp.seconds === "number") return timestamp.seconds * 1000;
    if (typeof timestamp._seconds === "number") return timestamp._seconds * 1000;
  }

  return 0;
}

/**
 * Pure mapper: Firestore doc -> TrialRegistration.
 * Explicit return type means a missing field fails the build here,
 * not somewhere downstream.
 */
function mapRegistration(
  docSnapshot: QueryDocumentSnapshot<DocumentData>,
): TrialRegistration {
  const data = docSnapshot.data();

  const location = typeof data.location === "string" ? data.location.trim() : "";
  const trialMode: TrialRegistration["trialMode"] =
    data.trialMode === "offline"
      ? "offline"
      : data.trialMode === "online"
        ? "online"
        : getTrialModeFromLocation(location).trialMode;

  const locationId = typeof data.locationId === "string" ? data.locationId : null;

  const locationName =
    typeof data.locationName === "string" ? data.locationName : "";

  const preferredCenter =
    typeof data.preferredCenter === "string" && data.preferredCenter.trim()
      ? data.preferredCenter.trim()
      : null;

  const salesSelectedCenter =
    typeof data.salesSelectedCenter === "string"
      ? data.salesSelectedCenter
      : null;

  const followUpHistory: FollowUpEntry[] = Array.isArray(data.followUpHistory)
    ? data.followUpHistory
    : [];

  return {
    id: docSnapshot.id,
    assignedTo: typeof data.assignedTo === "string" ? data.assignedTo : null,
    assignedToName: typeof data.assignedToName === "string" ? data.assignedToName : null,
    assignedToEmail: typeof data.assignedToEmail === "string" ? data.assignedToEmail : null,
    bookingOrigin:
      data.bookingOrigin === "direct" || data.bookingOrigin === "follow-up"
        ? data.bookingOrigin
        : data.createdFrom === "free-trial-page" && data.trialDate
          ? "direct"
          : undefined,
    studentName: data.studentName || "",
    age: typeof data.age === "number" ? data.age : Number(data.age || 0),
    contactNumber: data.contactNumber || "",
    email: data.email || "",
    programInterest:
      typeof data.programInterest === "string" ? data.programInterest : "",
    referralSource: data.referralSource || "",
    trialDate: data.trialDate || "",
    trialTime: data.trialTime || "",
    trialConfirmationEmailSentAt:
      getCreatedAtMillis(data.trialConfirmationEmailSentAt) || null,
    location,
    trialMode,
    locationId,
    locationName,
    preferredCenter,
    salesSelectedCenter,
    status: (data.status as TrialStatus | undefined) ?? "booked",
    remark: data.remark || "",
    counsellorRemark: data.counsellorRemark || "",
    leadTemp: (data.leadTemp as LeadTemp) || "",
    nextFollowUpDate: data.nextFollowUpDate || "",
    followUpHistory,
    leadOutcome: (data.leadOutcome as LeadOutcome) || "",
    closeRemark: data.closeRemark || "",
    dateOfRegistration: data.dateOfRegistration || "",
    // Pending server timestamps are null until the write is acknowledged.
    createdAt: getCreatedAtMillis(data.createdAt),
  };
}

function markDuplicateRegistrations(
  registrations: TrialRegistration[],
): TrialRegistration[] {
  const keysByRegistration = registrations.map((registration) => {
    const digits = registration.contactNumber.replace(/\D/g, "");
    const phone = digits.length > 10 ? digits.slice(-10) : digits;
    const email = registration.email.trim().toLowerCase();
    return [
      ...(phone ? [`phone:${phone}`] : []),
      ...(email ? [`email:${email}`] : []),
    ];
  });
  const keyCounts = new Map<string, number>();

  keysByRegistration.flat().forEach((key) => {
    keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
  });

  return registrations.map((registration, index) => ({
    ...registration,
    isDuplicate: keysByRegistration[index].some(
      (key) => (keyCounts.get(key) ?? 0) > 1,
    ),
  }));
}

/**
 * Owns the Firestore round-trip for trial registrations.
 *
 * `onSnapshot` is the single source of truth: mutations only write to
 * Firestore, and the listener updates `registrations` (including
 * optimistic local-write events).
 */
export function useTrialRegistrations() {
  const [registrations, setRegistrations] = useState<TrialRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* REAL-TIME REGISTRATIONS */

  useEffect(() => {
    setLoading(true);
    setError("");

    const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        setRegistrations(
          markDuplicateRegistrations(snapshot.docs.map(mapRegistration)),
        );
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching registrations:", err);
        setError("Failed to load registrations.");
        setLoading(false);
      },
    );
  }, []);

  /* PATCH HELPER — server write; listener updates state */

  const patchRegistration = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      const token = await getAuthToken();
      const response = await fetch(
        `/api/enquire-form/registrations/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await readApiJson<{
        success?: boolean;
        message?: string;
      }>(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update the enquiry.");
      }
    },
    [],
  );

  /* STATUS */

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      try {
        await patchRegistration(id, { status });
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Failed to update status. Please try again.");
      }
    },
    [patchRegistration],
  );

  const updateSalesSelectedCenter = useCallback(
    async (id: string, center: string | null) => {
      try {
        await patchRegistration(id, { salesSelectedCenter: center });
      } catch (err) {
        console.error("Error updating selected enquiry center:", err);
        alert("Failed to save the selected center. Please try again.");
      }
    },
    [patchRegistration],
  );

  const rescheduleTrial = useCallback(
    async (id: string, trialDate: string, trialTime: string) => {
      try {
        const token = await getAuthToken();
        const response = await fetch(`/api/free-trial/${id}/reschedule`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
            body: JSON.stringify({
              trialDate,
              trialTime,
              bookingOrigin: "follow-up",
              action: "reschedule",
            }),
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to reschedule the trial.");
        }

        return true;
      } catch (err) {
        console.error("Error rescheduling trial:", err);
        alert(err instanceof Error ? err.message : "Unable to reschedule the trial.");
        return false;
      }
    },
    [],
  );

  const addTrialSlot = useCallback(
    async (
      id: string,
      trialDate: string,
      trialTime: string,
      trialMode?: "online" | "offline",
    ) => {
      try {
        const token = await getAuthToken();
        const response = await fetch(
          `/api/free-trial/${encodeURIComponent(id)}/reschedule`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              trialDate,
              trialTime,
              bookingOrigin: "follow-up",
              action: "add-slot",
              ...(trialMode ? { trialMode } : {}),
            }),
          },
        );
        const data = (await response.json()) as {
          success?: boolean;
          message?: string;
        };

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to add the trial slot.");
        }

        return true;
      } catch (err) {
        console.error("Error adding trial slot:", err);
        alert(err instanceof Error ? err.message : "Unable to add the trial slot.");
        return false;
      }
    },
    [],
  );

  const sendTrialMeetingEmail = useCallback(async (id: string) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(
        `/api/enquire-form/registrations/${encodeURIComponent(id)}/trial-email`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send the trial email.");
      }

      alert("Trial meeting link email sent.");
      return true;
    } catch (err) {
      console.error("Error sending trial meeting link email:", err);
      alert(err instanceof Error ? err.message : "Unable to send the trial email.");
      return false;
    }
  }, []);

  /* REMARK (general — kept for parity; not currently wired to any column) */

  const updateRemark = useCallback(
    async (id: string, remark: string) => {
      try {
        await patchRegistration(id, { remark: remark.trim() });
      } catch (err) {
        console.error("Error updating remark:", err);
        alert("Failed to save remark. Please try again.");
      }
    },
    [patchRegistration],
  );

  /* COUNSELLOR REMARK */

  const updateCounsellorRemark = useCallback(
    async (id: string, counsellorRemark: string) => {
      try {
        await patchRegistration(id, {
          counsellorRemark: counsellorRemark.trim(),
        });
      } catch (err) {
        console.error("Error updating counsellor remark:", err);
        alert("Failed to save counsellor remark. Please try again.");
      }
    },
    [patchRegistration],
  );

  /* LEAD TEMP */

  const updateLeadTemp = useCallback(
    async (id: string, leadTemp: string) => {
      try {
        await patchRegistration(id, { leadTemp });
      } catch (err) {
        console.error("Error updating lead temperature:", err);
        alert("Failed to update lead temperature. Please try again.");
      }
    },
    [patchRegistration],
  );

  /* LEAD OUTCOME */

  const updateLeadOutcome = useCallback(
    async (id: string, leadOutcome: string) => {
      try {
        await patchRegistration(id, { leadOutcome });
      } catch (err) {
        console.error("Error updating lead outcome:", err);
        alert("Failed to update lead outcome. Please try again.");
      }
    },
    [patchRegistration],
  );

  /* CLOSE REMARK */

  const updateCloseRemark = useCallback(
    async (id: string, closeRemark: string) => {
      try {
        await patchRegistration(id, { closeRemark: closeRemark.trim() });
      } catch (err) {
        console.error("Error updating close remark:", err);
        alert("Failed to save close remark. Please try again.");
      }
    },
    [patchRegistration],
  );

  /* FOLLOW UP */

  const addFollowUp = useCallback(
    async (
      registration: TrialRegistration,
      entry: FollowUpEntry,
    ): Promise<FollowUpEntry[] | null> => {
      try {
        const updatedHistory = [...(registration.followUpHistory || []), entry];

        await patchRegistration(registration.id, {
          nextFollowUpDate: entry.date,
          followUpHistory: updatedHistory,
        });

        return updatedHistory;
      } catch (err) {
        console.error("Error saving follow-up:", err);
        alert("Failed to save follow-up. Please try again.");
        return null;
      }
    },
    [patchRegistration],
  );

  const updateFollowUp = useCallback(
    async (
      registration: TrialRegistration,
      currentHistory: FollowUpEntry[],
      index: number,
      entry: FollowUpEntry,
    ): Promise<FollowUpEntry[] | null> => {
      try {
        const updatedHistory = [...currentHistory];
        if (index < 0 || index >= updatedHistory.length) {
          throw new Error("The follow-up entry no longer exists.");
        }

        updatedHistory[index] = entry;
        await patchRegistration(registration.id, {
          ...(index === updatedHistory.length - 1
            ? { nextFollowUpDate: entry.date }
            : {}),
          followUpHistory: updatedHistory,
        });

        return updatedHistory;
      } catch (err) {
        console.error("Error updating follow-up:", err);
        alert("Failed to update follow-up. Please try again.");
        return null;
      }
    },
    [patchRegistration],
  );

  /* EDIT */

  const editRegistration = useCallback(
    async (target: TrialRegistration, draft: EditDraft): Promise<boolean> => {
      if (!draft.studentName.trim() || !draft.contactNumber.trim()) {
        alert("Student name and contact number are required.");
        return false;
      }

      const ageNum = Number(draft.age);

      if (draft.age !== "" && Number.isNaN(ageNum)) {
        alert("Age must be a number.");
        return false;
      }

      try {
        const location = draft.location.trim();

        /** Recalculate mode when location is changed. */
        const locationResult = getTrialModeFromLocation(location);

        await patchRegistration(target.id, {
          studentName: draft.studentName.trim(),
          age: draft.age === "" ? target.age : ageNum,
          contactNumber: draft.contactNumber.trim(),
          email: draft.email.trim(),
          trialDate: draft.trialDate.trim(),
          trialTime: draft.trialTime.trim(),
          location,
          trialMode: locationResult.trialMode,
          locationId: locationResult.locationId,
          locationName: locationResult.locationName,
        });

        return true;
      } catch (err) {
        console.error("Error updating registration:", err);
        alert("Failed to save changes. Please try again.");
        return false;
      }
    },
    [patchRegistration],
  );

  /* DELETE */

  const deleteRegistration = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      return true;
    } catch (err) {
      console.error("Error deleting registration:", err);
      alert("Failed to delete registration. Please try again.");
      return false;
    }
  }, []);

  return {
    registrations,
    loading,
    error,
    updateStatus,
    updateSalesSelectedCenter,
    rescheduleTrial,
    addTrialSlot,
    sendTrialMeetingEmail,
    updateRemark,
    updateCounsellorRemark,
    updateLeadTemp,
    updateLeadOutcome,
    updateCloseRemark,
    addFollowUp,
    updateFollowUp,
    editRegistration,
    deleteRegistration,
  };
}
