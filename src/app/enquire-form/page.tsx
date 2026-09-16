"use client";

import React, { useMemo, useState } from "react";
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";

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

const Page = () => {
  const {
    registrations,
    loading,
    error,
    updateStatus,
    rescheduleTrial,
    updateCounsellorRemark,
    updateLeadTemp,
    updateLeadOutcome,
    updateCloseRemark,
    addFollowUp,
    editRegistration,
    deleteRegistration,
  } = useTrialRegistrations();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    locationFilter,
    setLocationFilter,
    leadTempFilter,
    setLeadTempFilter,
    leadOutcomeFilter,
    setLeadOutcomeFilter,
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
    const registration = registrations.find((item) => item.id === id);

    if (status === "reschedule" && registration) {
      setRescheduleTarget(registration);
      return;
    }

    updateStatus(id, status);
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
            leadTempFilter={leadTempFilter}
            onLeadTempChange={setLeadTempFilter}
            leadOutcomeFilter={leadOutcomeFilter}
            onLeadOutcomeChange={setLeadOutcomeFilter}
            trialDateFilter={trialDateFilter}
            onTrialDateChange={setTrialDateFilter}
            followUpDateFilter={followUpDateFilter}
            onFollowUpDateChange={setFollowUpDateFilter}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            onActivityClick={() => setActivityOpen(true)}
          />
        </div>

        <LocationTabs
          locationFilter={locationFilter}
          onChange={setLocationFilter}
          counts={locationCounts}
        />

        <StatusChips
          total={registrations.length}
          statusFilter={statusFilter}
          onChange={setStatusFilter}
          statusCounts={statusCounts}
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
              registrations={filtered}
              hasShowRows={hasShowRows}
              hasClosedRows={hasClosedRows}
              sortField={sortField}
              sortDir={sortDir}
              onToggleSort={toggleSort}
              onStatusChange={handleStatusChange}
              onLeadTempChange={updateLeadTemp}
              onLeadOutcomeChange={updateLeadOutcome}
              onCounsellorRemarkSave={updateCounsellorRemark}
              onCloseRemarkSave={updateCloseRemark}
              onFollowUpClick={setFollowUpTarget}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />

            <MobileList
              registrations={filtered}
              onStatusChange={handleStatusChange}
              onLeadTempChange={updateLeadTemp}
              onLeadOutcomeChange={updateLeadOutcome}
              onCounsellorRemarkSave={updateCounsellorRemark}
              onCloseRemarkSave={updateCloseRemark}
              onFollowUpClick={setFollowUpTarget}
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          </>
        )}
      </div>

      <EditDialog
        target={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={editRegistration}
      />

      <FollowUpDialog
        target={followUpTarget}
        onClose={() => setFollowUpTarget(null)}
        onSave={addFollowUp}
      />

      <ActivityDialog
        open={activityOpen}
        onOpenChange={setActivityOpen}
        registrations={registrations}
      />

      <DeleteAlertDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteRegistration}
      />

      <RescheduleDialog
        target={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSave={rescheduleTrial}
      />
    </div>
  );
};

export default Page;
