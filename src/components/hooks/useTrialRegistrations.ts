import { useCallback, useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
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

/**
 * Owns the Firestore round-trip for trial registrations:
 * initial fetch + every mutation (status, remarks, lead
 * temp/outcome, follow-ups, edit, delete).
 *
 * UI components stay dumb — they call these functions and
 * re-render off the returned `registrations` state.
 */
export function useTrialRegistrations() {
  const [registrations, setRegistrations] = useState<TrialRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* REAL-TIME REGISTRATIONS */

  useEffect(() => {
    setLoading(true);
    setError("");

    const registrationsRef = collection(db, "freeTrialRegistrations");
    const q = query(registrationsRef, orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      (snapshot) => {
        const data: TrialRegistration[] = snapshot.docs.map((docSnapshot) => {
          const firestoreData = docSnapshot.data();

          /**
           * Read mode from Firestore.
           *
           * Backend source of truth.
           */
          const trialMode: TrialRegistration["trialMode"] =
            firestoreData.trialMode === "offline" ? "offline" : "online";

          const location =
            typeof firestoreData.location === "string"
              ? firestoreData.location.trim()
              : "";

          const locationId =
            typeof firestoreData.locationId === "string"
              ? firestoreData.locationId
              : null;

          const locationName =
            typeof firestoreData.locationName === "string"
              ? firestoreData.locationName
              : "";

          const preferredCenter =
            typeof firestoreData.preferredCenter === "string" &&
            firestoreData.preferredCenter.trim()
              ? firestoreData.preferredCenter.trim()
              : null;

          const followUpHistory: FollowUpEntry[] = Array.isArray(
            firestoreData.followUpHistory,
          )
            ? firestoreData.followUpHistory
            : [];

          return {
            id: docSnapshot.id,

            studentName: firestoreData.studentName || "",

            age:
              typeof firestoreData.age === "number"
                ? firestoreData.age
                : Number(firestoreData.age || 0),

            contactNumber: firestoreData.contactNumber || "",

            email: firestoreData.email || "",

            trialDate: firestoreData.trialDate || "",

            trialTime: firestoreData.trialTime || "",

            location,

            trialMode,

            locationId,

            locationName,

            preferredCenter,

            status: (firestoreData.status as TrialStatus) || "booked",

            remark: firestoreData.remark || "",

            counsellorRemark: firestoreData.counsellorRemark || "",

            leadTemp: (firestoreData.leadTemp as LeadTemp) || "",

            nextFollowUpDate: firestoreData.nextFollowUpDate || "",

            followUpHistory,

            leadOutcome: (firestoreData.leadOutcome as LeadOutcome) || "",

            closeRemark: firestoreData.closeRemark || "",

            dateOfRegistration: firestoreData.dateOfRegistration || "",
          };
        });

        setRegistrations(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching registrations:", err);
        setError("Failed to load registrations.");
        setLoading(false);
      },
    );
  }, []);

  /* PATCH HELPER — updates Firestore, then mirrors into local state */

  const patchRegistration = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      await updateDoc(doc(db, "freeTrialRegistrations", id), payload);

      setRegistrations((previous) =>
        previous.map((registration) =>
          registration.id === id
            ? { ...registration, ...(payload as Partial<TrialRegistration>) }
            : registration,
        ),
      );
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

        /**
         * Recalculate mode when
         * location is changed.
         */
        const locationResult = getTrialModeFromLocation(location);

        const payload = {
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
          updatedAt: new Date(),
        };

        await patchRegistration(target.id, payload);

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
      await deleteDoc(doc(db, "freeTrialRegistrations", id));

      setRegistrations((previous) =>
        previous.filter((registration) => registration.id !== id),
      );

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
