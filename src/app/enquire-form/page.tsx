"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Inbox,
  Loader2,
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
import { TrialRegistration } from "./types";
import { useAuth } from "@/lib/auth-context";
import { authReady } from "@/lib/firebase";

const ENQUIRIES_PER_PAGE_OPTIONS = [10, 25, 50, 100];

type TrainerOption = {
  id: string;
  name: string;
};

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
  const canModify =
    userRole !== null &&
    (userRole !== "trainer" || selectedTrainerId === user?.uid);
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
    updateCounsellorRemark,
    updateLeadTemp,
    updateLeadOutcome,
    updateCloseRemark,
    addFollowUp,
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
    setSelectedTrainerId(null);
    setTrainerOptions([]);
    setAccessLoading(true);
    const loadAccess = async () => {
      try {
        const auth = await authReady;
        const token = await auth?.currentUser?.getIdToken();
        if (!token) throw new Error("Please sign in again to manage access.");

        const response = await fetch("/api/enquire-form/access", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await response.json()) as {
          success?: boolean;
          selectedTrainerId?: string | null;
          trainers?: TrainerOption[];
          message?: string;
        };
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load trainer access.");
        }

        if (disposed) return;
        setSelectedTrainerId(data.selectedTrainerId ?? null);
        if (data.trainers) setTrainerOptions(data.trainers);
        setAccessError("");
      } catch (error) {
        if (disposed) return;
        console.error("Unable to load Enquire form trainer access:", error);
        setAccessError(
          error instanceof Error ? error.message : "Unable to load trainer access.",
        );
      } finally {
        if (!disposed) setAccessLoading(false);
      }
    };

    void loadAccess();
    const refreshTimer =
      userRole === "trainer"
        ? window.setInterval(() => void loadAccess(), 15000)
        : undefined;

    return () => {
      disposed = true;
      if (refreshTimer !== undefined) window.clearInterval(refreshTimer);
    };
  }, [user, userRole]);

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
      const data = (await response.json()) as {
        success?: boolean;
        selectedTrainerId?: string | null;
        message?: string;
      };
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update trainer access.");
      }

      setSelectedTrainerId(data.selectedTrainerId ?? null);
    } catch (error) {
      console.error("Unable to update Enquire form trainer access:", error);
      setAccessError(
        error instanceof Error ? error.message : "Unable to update trainer access.",
      );
    } finally {
      setSavingTrainerSelection(false);
    }
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

  const handleStatusChange = (id: string, status: string) => {
    if (!canModify) return;

    const registration = registrations.find((item) => item.id === id);

    if (status === "reschedule" && registration) {
      setRescheduleTarget(registration);
      return;
    }

    updateStatus(id, status);
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
        <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
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
        <h1 className="text-[1.75rem] font-bold tracking-tight text-stone-900 text-center py-3">
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

      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-1 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
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

        {(userRole === "admin" || userRole === "superAdmin") && (
          <div className="mb-5 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-l-4 border-orange-500 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
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
                        : selectedTrainer
                          ? `Enabled for ${selectedTrainer.name}`
                          : selectedTrainerId
                            ? "Trainer assigned"
                            : "No trainer selected"}
                    </span>
                  </div>
                  <p className="mt-1 max-w-xl text-sm text-stone-500">
                    Select one trainer who can update enquiry columns. All
                    other trainers will have read-only access.
                  </p>
                </div>
              </div>

              <div className="w-full shrink-0 sm:w-72">
                <label
                  htmlFor="enquiry-trainer-access"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500"
                >
                  Trainer allowed to edit
                </label>
                <select
                  id="enquiry-trainer-access"
                  value={selectedTrainerId ?? ""}
                  onChange={(event) =>
                    void handleTrainerSelection(event.target.value)
                  }
                  disabled={accessLoading || savingTrainerSelection}
                  className="h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-500"
                >
                  <option value="">
                    {accessLoading
                      ? "Loading trainers..."
                      : "No trainer selected"}
                  </option>
                  {trainerOptions.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
                {accessError && (
                  <p role="alert" className="mt-1.5 text-xs text-red-600">
                    {accessError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {userRole === "trainer" && accessLoading && (
          <p className="mb-4 text-sm text-stone-500">
            Checking edit access…
          </p>
        )}
        {userRole === "trainer" && !accessLoading && !canModify && (
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
                className="text-sm font-medium text-orange-600 hover:text-orange-700"
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
              onEdit={setEditTarget}
              onDelete={handleDelete}
              canDelete={canDelete}
            />

            <MobileList
              registrations={paginatedRegistrations}
              canModify={canModify}
              onStatusChange={handleStatusChange}
              onSalesSelectedCenterChange={updateSalesSelectedCenter}
              onLeadTempChange={updateLeadTemp}
              onLeadOutcomeChange={updateLeadOutcome}
              onCounsellorRemarkSave={updateCounsellorRemark}
              onCloseRemarkSave={updateCloseRemark}
              onFollowUpClick={setFollowUpTarget}
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
        onClose={() => setRescheduleTarget(null)}
        onSave={rescheduleTrial}
      />
    </div>
  );
};

export default Page;
