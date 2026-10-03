import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
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

/**
 * Pure mapper: Firestore doc -> TrialRegistration.
 * Explicit return type means a missing field fails the build here,
 * not somewhere downstream.
 */
function mapRegistration(
  docSnapshot: QueryDocumentSnapshot<DocumentData>,
): TrialRegistration {
  const data = docSnapshot.data();

  const trialMode: TrialRegistration["trialMode"] =
    data.trialMode === "offline" ? "offline" : "online";

  const location = typeof data.location === "string" ? data.location.trim() : "";

  const locationId = typeof data.locationId === "string" ? data.locationId : null;

  const locationName =
    typeof data.locationName === "string" ? data.locationName : "";

  const preferredCenter =
    typeof data.preferredCenter === "string" && data.preferredCenter.trim()
      ? data.preferredCenter.trim()
      : null;

  const followUpHistory: FollowUpEntry[] = Array.isArray(data.followUpHistory)
    ? data.followUpHistory
    : [];

  return {
    id: docSnapshot.id,
    studentName: data.studentName || "",
    age: typeof data.age === "number" ? data.age : Number(data.age || 0),
    contactNumber: data.contactNumber || "",
    email: data.email || "",
    trialDate: data.trialDate || "",
    trialTime: data.trialTime || "",
    location,
    trialMode,
    locationId,
    locationName,
    preferredCenter,
    status: (data.status as TrialStatus) || "booked",
    remark: data.remark || "",
    counsellorRemark: data.counsellorRemark || "",
    leadTemp: (data.leadTemp as LeadTemp) || "",
    nextFollowUpDate: data.nextFollowUpDate || "",
    followUpHistory,
    leadOutcome: (data.leadOutcome as LeadOutcome) || "",
    closeRemark: data.closeRemark || "",
    dateOfRegistration: data.dateOfRegistration || "",
    // Pending server timestamps are null until the write is acknowledged.
    createdAt: data.createdAt?.toMillis?.() ?? 0,
  };
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
        setRegistrations(snapshot.docs.map(mapRegistration));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching registrations:", err);
        setError("Failed to load registrations.");
        setLoading(false);
      },
    );
  }, []);

  /* PATCH HELPER — Firestore write only; listener updates state */

  const patchRegistration = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      await updateDoc(doc(db, COLLECTION, id), payload);
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

  const rescheduleTrial = useCallback(
    async (id: string, trialDate: string, trialTime: string) => {
      try {
        const response = await fetch(`/api/free-trial/${id}/reschedule`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trialDate, trialTime }),
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
          updatedAt: serverTimestamp(),
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
    rescheduleTrial,
    updateRemark,
    updateCounsellorRemark,
    updateLeadTemp,
    updateLeadOutcome,
    updateCloseRemark,
    addFollowUp,
    editRegistration,
    deleteRegistration,
  };
}