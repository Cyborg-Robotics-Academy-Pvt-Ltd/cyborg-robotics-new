"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Inbox,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { useTrialRegistrations } from "@/components/hooks/useTrialRegistrations";
import { useRegistrationFilters } from "@/components/hooks/useRegistrationFilters";

import { FilterBar } from "@/components/trial-registrations/FilterBar";
import { LocationTabs } from "@/components/trial-registrations/LocationTabs";
import { StatusChips } from "@/components/trial-registrations/StatusChips";
import { DesktopTable } from "@/components/trial-registrations/DesktopTable";
import { MobileList } from "@/components/trial-registrations/MobileList";
import { EditDialog } from "@/components/trial-registrations/EditDialog";
import { FollowUpDialog } from "@/components/trial-registrations/FollowUpDialog";
import { ActivityDialog } from "@/components/trial-registrations/ActivityDialog";
import { DeleteAlertDialog } from "@/components/trial-registrations/DeleteAlertDialog";
import { RescheduleDialog } from "@/components/trial-registrations/RescheduleDialog";
import { ManualEnquiryDialog } from "@/components/trial-registrations/ManualEnquiryDialog";
import { TrialRegistration } from "./types";
import { useAuth } from "@/lib/auth-context";
import { authReady } from "@/lib/firebase";
import { readApiJson } from "@/lib/read-api-json";

const ENQUIRIES_PER_PAGE_OPTIONS = [10, 25, 50, 100];

type TrainerOption = {
  id: string;
  name: string;
};

type CachedTrainerAccess = {
  selectedTrainerId: string | null;
  trainers: TrainerOption[];
  savedAt: number;
};

const TRAINER_ACCESS_CACHE_TTL_MS = 30 * 60 * 1000;

function trainerAccessCacheKey(uid: string, role: string) {
  return `enquire-form-access:v1:${uid}:${role}`;
}

function parseCachedTrainerAccess(value: unknown): CachedTrainerAccess | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const selectedTrainerId = record.selectedTrainerId;
  const savedAt = record.savedAt;
  const trainersValue = record.trainers;

  if (
    !(selectedTrainerId === null || typeof selectedTrainerId === "string") ||
    typeof savedAt !== "number" ||
    !Number.isFinite(savedAt) ||
    !Array.isArray(trainersValue) ||
    !trainersValue.every(
      (trainer) =>
        !!trainer &&
        typeof trainer === "object" &&
        "id" in trainer &&
        typeof trainer.id === "string" &&
        "name" in trainer &&
        typeof trainer.name === "string",
    )
  ) {
    return null;
  }

  return {
    selectedTrainerId,
    trainers: trainersValue as TrainerOption[],
    savedAt,
  };
}

const Page = () => {
  const { user, userRole } = useAuth();
  const canDelete = userRole === "admin" || userRole === "superAdmin";
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(
    null,
  );
  const [trainerOptions, setTrainerOptions] = useState<TrainerOption[]>([]);
  const [accessLoading, setAccessLoading] = useState(
    userRole === "admin" || userRole === "superAdmin" || userRole === "trainer",
  );
  const [savingTrainerSelection, setSavingTrainerSelection] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [accessWarning, setAccessWarning] = useState("");
  const [accessRefreshKey, setAccessRefreshKey] = useState(0);
  const canModify =
    userRole !== null &&
    (userRole !== "trainer" || selectedTrainerId === user?.uid);
  const trainerView = userRole === "trainer";
  const marketingView = userRole === "marketing";
  const canAddTrialSlot =
    userRole === "admin" ||
    userRole === "sales" ||
    marketingView;
  const selectedTrainer = trainerOptions.find(
    (trainer) => trainer.id === selectedTrainerId,
  );
  const {
    registrations,
    loading,
    error,
    updateStatus,
    updateSalesSelectedCenter,
    rescheduleTrial,
    addTrialSlot,
    sendTrialMeetingEmail,
    updateCounsellorRemark,
    updateLeadTemp,
    updateLeadOutcome,
    updateCloseRemark,
    addFollowUp,
    updateFollowUp,
    editRegistration,
    deleteRegistration,
  } = useTrialRegistrations();

  useEffect(() => {
    if (
      !user ||
      !["admin", "superAdmin", "trainer"].includes(userRole || "")
    ) {
      setAccessLoading(false);
      return;
    }

    let disposed = false;
    let cachedAt = 0;
    let hasCachedAccess = false;
    let retryAfter = 0;
    const cacheKey = trainerAccessCacheKey(user.uid, userRole || "unknown");

    try {
      const cachedValue = parseCachedTrainerAccess(
        JSON.parse(window.localStorage.getItem(cacheKey) || "null"),
      );
      if (cachedValue) {
        cachedAt = cachedValue.savedAt;
        hasCachedAccess = true;
        setSelectedTrainerId(cachedValue.selectedTrainerId);
        setTrainerOptions(cachedValue.trainers);
        setAccessLoading(false);
        setAccessError("");
        setAccessWarning(
          Date.now() - cachedValue.savedAt > TRAINER_ACCESS_CACHE_TTL_MS
            ? "Using saved trainer access while checking for updates."
            : "",
        );
      }
    } catch (cacheError) {
      console.warn("Unable to read saved trainer access:", cacheError);
    }

    if (!hasCachedAccess) {
      setAccessLoading(true);
      setAccessWarning("");
    }
    const loadAccess = async () => {
      if (hasCachedAccess && Date.now() - cachedAt < TRAINER_ACCESS_CACHE_TTL_MS) {
        setAccessLoading(false);
        return;
      }
      if (Date.now() < retryAfter) return;

      try {
        const auth = await authReady;
        const token = await auth?.currentUser?.getIdToken();
        if (!token) throw new Error("Please sign in again to manage access.");

        const response = await fetch("/api/enquire-form/access", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await readApiJson<{
          success?: boolean;
          selectedTrainerId?: string | null;
          trainers?: TrainerOption[];
          message?: string;
          roleClaimUpdated?: boolean;
        }>(response);
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load trainer access.");
        }

        if (disposed) return;
        const selectedId = data.selectedTrainerId ?? null;
        const trainers = data.trainers ?? [];
        const savedAt = Date.now();
        setSelectedTrainerId(selectedId);
        setTrainerOptions(trainers);
        cachedAt = savedAt;
        hasCachedAccess = true;
        try {
          window.localStorage.setItem(
            cacheKey,
            JSON.stringify({
              selectedTrainerId: selectedId,
              trainers,
              savedAt,
            } satisfies CachedTrainerAccess),
          );
        } catch (cacheError) {
          console.warn("Unable to save trainer access locally:", cacheError);
        }
        if (data.roleClaimUpdated) {
          await auth?.currentUser?.getIdToken(true);
        }
        setAccessError("");
        setAccessWarning("");
      } catch (error) {
        if (disposed) return;
        console.error("Unable to load Enquire form trainer access:", error);
        retryAfter = Date.now() + 60_000;
        if (hasCachedAccess) {
          setAccessWarning(
            "Firebase is unavailable. Showing the last saved trainer access; it may be out of date.",
          );
        } else {
          setAccessError(
            error instanceof Error
              ? error.message
              : "Unable to load trainer access.",
          );
        }
      } finally {
        if (!disposed) setAccessLoading(false);
      }
    };

    void loadAccess();
    const refreshAccess = () => {
      if (document.visibilityState === "visible") void loadAccess();
    };
    document.addEventListener("visibilitychange", refreshAccess);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", refreshAccess);
    };
  }, [user, userRole, accessRefreshKey]);

  const handleTrainerSelection = async (trainerId: string) => {
    setSavingTrainerSelection(true);
    setAccessError("");

    try {
      const auth = await authReady;
      const token = await auth?.currentUser?.getIdToken();
      if (!token) throw new Error("Please sign in again to manage access.");

      const response = await fetch("/api/enquire-form/access", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trainerId: trainerId || null }),
      });
      const data = await readApiJson<{
        success?: boolean;
        selectedTrainerId?: string | null;
        message?: string;
      }>(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update trainer access.");
      }

      setSelectedTrainerId(data.selectedTrainerId ?? null);
      const savedAt = Date.now();
      if (user) {
        try {
          window.localStorage.setItem(
            trainerAccessCacheKey(user.uid, userRole || "unknown"),
            JSON.stringify({
              selectedTrainerId: data.selectedTrainerId ?? null,
              trainers: trainerOptions,
              savedAt,
            } satisfies CachedTrainerAccess),
          );
        } catch (cacheError) {
          console.warn("Unable to save trainer access locally:", cacheError);
        }
      }
      setAccessWarning("");
    } catch (error) {
      console.error("Unable to update Enquire form trainer access:", error);
      setAccessError(
        error instanceof Error ? error.message : "Unable to update trainer access.",
      );
    } finally {
      setSavingTrainerSelection(false);
    }
  };

  const retryTrainerAccess = () => {
    if (user) {
      try {
        window.localStorage.removeItem(
          trainerAccessCacheKey(user.uid, userRole || "unknown"),
        );
      } catch (cacheError) {
        console.warn("Unable to clear saved trainer access:", cacheError);
      }
    }
    setAccessRefreshKey((value) => value + 1);
  };

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    locationFilter,
    setLocationFilter,
    centerFilter,
    setCenterFilter,
    leadTempFilter,
    setLeadTempFilter,
    leadOutcomeFilter,
    setLeadOutcomeFilter,
    todayOnly,
    setTodayOnly,
    todayCount,
    trialDateFilter,
    setTrialDateFilter,
    followUpDateFilter,
    setFollowUpDateFilter,
    sortField,
    sortDir,
    toggleSort,
    filtered,
    statusCounts,
    locationCounts,
    hasActiveFilters,
    clearFilters,
  } = useRegistrationFilters(registrations);

  const [currentPage, setCurrentPage] = useState(1);
  const [enquiriesPerPage, setEnquiriesPerPage] = useState(10);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / enquiriesPerPage),
  );

  const paginatedRegistrations = useMemo(() => {
    const start = (currentPage - 1) * enquiriesPerPage;
    return filtered.slice(start, start + enquiriesPerPage);
  }, [currentPage, enquiriesPerPage, filtered]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    locationFilter,
    centerFilter,
    leadTempFilter,
    leadOutcomeFilter,
    todayOnly,
    trialDateFilter,
    followUpDateFilter,
    sortField,
    sortDir,
  ]);

  /* DIALOG TARGETS */

  const [activityOpen, setActivityOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TrialRegistration | null>(null);
  const [followUpTarget, setFollowUpTarget] =
    useState<TrialRegistration | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrialRegistration | null>(
    null,
  );
  const [rescheduleTarget, setRescheduleTarget] =
    useState<TrialRegistration | null>(null);
  const [openTimelineId, setOpenTimelineId] = useState<string | null>(null);
  const [manualEnquiryOpen, setManualEnquiryOpen] = useState(false);

  const handleStatusChange = (id: string, status: string) => {
    if (!canModify) return;

    const registration = registrations.find((item) => item.id === id);
    if (!registration) return;

    if (
      status !== "reschedule" &&
      (!registration.trialDate || !registration.trialTime)
    ) {
      alert("Add a trial date and time before changing the trial status.");
      return;
    }

    if (status === "reschedule" && !trainerView) {
      setRescheduleTarget(registration);
      return;
    }

    updateStatus(id, status);
  };

  const saveTrialSlot = (
    id: string,
    date: string,
    time: string,
    trialMode?: "online" | "offline",
  ) => {
    const registration = registrations.find((item) => item.id === id);
    if (!registration) return Promise.resolve(false);

    return !registration.trialDate || !registration.trialTime
      ? addTrialSlot(id, date, time, trialMode)
      : rescheduleTrial(id, date, time);
  };

  const handleDelete = (registration: TrialRegistration) => {
    if (canDelete) setDeleteTarget(registration);
  };

  /**
   * Whether the Counsellor Remark / Close Remark columns should
   * render at all. A table's columns are shared across every row,
   * so each only makes sense to show when at least one visible row
   * matches the relevant state.
   */
  const hasShowRows = useMemo(
    () => filtered.some((registration) => registration.status === "show"),
    [filtered],
  );

  const hasClosedRows = useMemo(
    () =>
      filtered.some(
        (registration: any) => registration.leadOutcome === "closed",
      ),
    [filtered],
  );

  /* LOADING */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-stone-50">
        <Loader2 className="h-5 w-5 animate-spin text-red-600" />
        <span className="ml-2.5 text-sm text-stone-500">
          Loading registrations…
        </span>
      </div>
    );
  }

  /* ERROR */

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2 bg-stone-50">
        <AlertTriangle className="h-6 w-6 text-red-600" />
        <p className="text-sm text-stone-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* HEADER */}

      <div className="relative">
        <h1 className="text-xl font-bold tracking-tight text-stone-900 text-center py-2">
          Free Trial Enquiries
        </h1>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
          aria-label="Refresh enquiries"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-3 sm:px-6">
        {canAddTrialSlot && (
          <button
            type="button"
            onClick={() => setManualEnquiryOpen(true)}
            className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-red-700 px-4 py-4 text-sm font-medium text-white shadow-lg transition hover:bg-red-800"
          >
            <Plus className="h-6 w-6" />
           
          </button>
        )}
        <div className="mb-2 flex min-w-0">
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            centerFilter={centerFilter}
            onCenterChange={setCenterFilter}
            leadTempFilter={leadTempFilter}
            onLeadTempChange={setLeadTempFilter}
            leadOutcomeFilter={leadOutcomeFilter}
            onLeadOutcomeChange={setLeadOutcomeFilter}
            todayOnly={todayOnly}
            todayCount={todayCount}
            onTodayToggle={() => setTodayOnly((current) => !current)}
            trialDateFilter={trialDateFilter}
            onTrialDateChange={setTrialDateFilter}
            followUpDateFilter={followUpDateFilter}
            onFollowUpDateChange={setFollowUpDateFilter}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onActivityClick={() => setActivityOpen(true)}
          />
        </div>

        <div className="mb-2 flex flex-wrap items-stretch gap-2">
          <div className="flex flex-wrap items-stretch gap-2">
          <div className="flex min-w-[170px] items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-xs font-medium text-stone-500">
              Direct trial bookings
            </p>
            <p className="text-lg font-semibold leading-none text-stone-900">
              {registrations.filter(
                (registration) =>
                  registration.trialDate &&
                  registration.status !== "cancelled" &&
                  registration.bookingOrigin === "direct",
              ).length}
            </p>
          </div>
          <div className="flex min-w-[170px] items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-xs font-medium text-stone-500">
              Booked after follow-up
            </p>
            <p className="text-lg font-semibold leading-none text-stone-900">
              {registrations.filter(
                (registration) =>
                  registration.trialDate &&
                  registration.status !== "cancelled" &&
                  registration.bookingOrigin === "follow-up",
              ).length}
            </p>
          </div>
          </div>

        {(userRole === "admin" || userRole === "superAdmin") && (
          <div className="min-w-[320px] flex-1 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="flex h-full flex-col justify-center gap-2 border-l-4 border-red-500 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-700">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-stone-900">
                      Trainer edit access
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        selectedTrainerId
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {accessLoading
                        ? "Loading access"
                        : accessError
                          ? "Access unavailable"
                          : selectedTrainer
                            ? `Enabled for ${selectedTrainer.name}`
                            : selectedTrainerId
                              ? "Trainer assigned"
                              : "No trainer selected"}
                    </span>
                  </div>
                  <p className="hidden text-xs text-stone-500 lg:block">
                    Only the selected trainer can update trial status. All
                    other trainers have read-only access.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <label
                  htmlFor="enquiry-trainer-access"
                  className="sr-only"
                >
                  Trainer allowed to edit
                </label>
                <select
                  id="enquiry-trainer-access"
                  value={selectedTrainerId ?? ""}
                  onChange={(event) =>
                    void handleTrainerSelection(event.target.value)
                  }
                  disabled={
                    accessLoading || savingTrainerSelection || Boolean(accessError)
                  }
                  className="h-8 w-48 rounded-lg border border-stone-300 bg-white px-2 text-xs text-stone-800 shadow-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-500"
                >
                  <option value="">
                    {accessLoading
                      ? "Loading trainers..."
                      : accessError
                        ? "Unable to load trainers"
                        : "No trainer selected"}
                  </option>
                  {trainerOptions.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
                {accessError && (
                  <div className="mt-1.5 flex items-start justify-between gap-2">
                    <p role="alert" className="text-xs text-red-600">
                      {accessError}
                    </p>
                    <button
                      type="button"
                      onClick={retryTrainerAccess}
                      className="shrink-0 text-xs font-semibold text-red-700 underline"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>

        {accessWarning && (
          <p
            role="status"
            aria-live="polite"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            {accessWarning}
          </p>
        )}

        {userRole === "trainer" && accessLoading && (
          <p className="mb-4 text-sm text-stone-500">
            Checking edit access…
          </p>
        )}
        {userRole === "trainer" && !accessLoading && accessError && (
          <div className="mb-4 flex items-center gap-3 text-sm text-red-600">
            <p role="alert">{accessError}</p>
            <button
              type="button"
              onClick={retryTrainerAccess}
              className="shrink-0 font-semibold text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}
        {userRole === "trainer" && !accessLoading && !accessError && !canModify && (
          <p className="mb-4 text-sm text-stone-500">
            An admin must select your trainer account before you can edit enquiries.
          </p>
        )}

        <LocationTabs
          locationFilter={locationFilter}
          onChange={setLocationFilter}
          counts={locationCounts}
        />

       

        {/* EMPTY */}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-stone-300 bg-white py-20 text-center">
            <Inbox className="h-7 w-7 text-stone-300" />

            <p className="text-sm text-stone-500">
              {registrations.length === 0
                ? "No free trial registrations yet."
                : "Nothing matches your search or filter."}
            </p>

            {registrations.length > 0 && hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <DesktopTable
              registrations={paginatedRegistrations}
              hasShowRows={hasShowRows}
              hasClosedRows={hasClosedRows}
              canModify={canModify}
              trainerView={trainerView}
              marketingView={marketingView}
              showContact={!trainerView && (canModify || marketingView)}
              canAddTrialSlot={canAddTrialSlot}
              openTimelineId={openTimelineId}
              onTimelineToggle={(id) =>
                setOpenTimelineId((current) => (current === id ? null : id))
              }
              sortField={sortField}
              sortDir={sortDir}
              onToggleSort={toggleSort}
              onStatusChange={handleStatusChange}
              onSalesSelectedCenterChange={updateSalesSelectedCenter}
              onLeadTempChange={updateLeadTemp}
              onLeadOutcomeChange={updateLeadOutcome}
              onCounsellorRemarkSave={updateCounsellorRemark}
              onCloseRemarkSave={updateCloseRemark}
              onFollowUpClick={setFollowUpTarget}
              onAddTrialSlot={setRescheduleTarget}
              onSendTrialMeetingEmail={sendTrialMeetingEmail}
              onEdit={setEditTarget}
              onDelete={handleDelete}
              canDelete={canDelete}
            />

            <MobileList
              registrations={paginatedRegistrations}
              canModify={canModify}
              trainerView={trainerView}
              marketingView={marketingView}
              showContact={!trainerView && (canModify || marketingView)}
              canAddTrialSlot={canAddTrialSlot}
              openTimelineId={openTimelineId}
              onTimelineToggle={(id) =>
                setOpenTimelineId((current) => (current === id ? null : id))
              }
              onStatusChange={handleStatusChange}
              onSalesSelectedCenterChange={updateSalesSelectedCenter}
              onLeadTempChange={updateLeadTemp}
              onLeadOutcomeChange={updateLeadOutcome}
              onCounsellorRemarkSave={updateCounsellorRemark}
              onCloseRemarkSave={updateCloseRemark}
              onFollowUpClick={setFollowUpTarget}
              onAddTrialSlot={setRescheduleTarget}
              onSendTrialMeetingEmail={sendTrialMeetingEmail}
              onEdit={setEditTarget}
              onDelete={handleDelete}
              canDelete={canDelete}
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="enquiries-per-page" className="text-sm text-stone-500">
                  Entries per page
                </label>
                <select
                  id="enquiries-per-page"
                  value={enquiriesPerPage}
                  onChange={(event) => {
                    setEnquiriesPerPage(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-700"
                >
                  {ENQUIRIES_PER_PAGE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-stone-500">
                  Page {currentPage} of {totalPages} · {filtered.length}{" "}
                  enquiries
                </p>

                {totalPages > 1 && <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page - 1)}
                    disabled={currentPage === 1}
                    className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>}
              </div>
            </div>
          </>
        )}
      </div>

      <EditDialog
        target={canModify ? editTarget : null}
        onClose={() => setEditTarget(null)}
        onSave={editRegistration}
      />

      <FollowUpDialog
        target={canModify ? followUpTarget : null}
        onClose={() => setFollowUpTarget(null)}
        onSave={addFollowUp}
        onUpdate={updateFollowUp}
      />

      <ActivityDialog
        open={activityOpen}
        onOpenChange={setActivityOpen}
        registrations={registrations}
      />

      {canDelete && (
        <DeleteAlertDialog
          target={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteRegistration}
        />
      )}

      <RescheduleDialog
        target={canModify ? rescheduleTarget : null}
        allowAllDayAddSlot={canAddTrialSlot}
        onClose={() => setRescheduleTarget(null)}
        onSave={saveTrialSlot}
      />

      <ManualEnquiryDialog
        open={manualEnquiryOpen}
        onOpenChange={setManualEnquiryOpen}
      />
    </div>
  );
};

export default Page;
