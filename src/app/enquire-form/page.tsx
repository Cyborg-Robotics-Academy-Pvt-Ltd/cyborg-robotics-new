"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Inbox,
  History,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";

import { useTrialRegistrations } from "@/components/hooks/useTrialRegistrations";
import { useRegistrationFilters } from "@/components/hooks/useRegistrationFilters";

import { FilterBar } from "@/components/trial-registrations/FilterBar";
import { DesktopTable } from "@/components/trial-registrations/DesktopTable";
import { MobileList } from "@/components/trial-registrations/MobileList";
import { EditDialog } from "@/components/trial-registrations/EditDialog";
import { FollowUpDialog } from "@/components/trial-registrations/FollowUpDialog";
import { ActivityDialog } from "@/components/trial-registrations/ActivityDialog";
import { DeleteAlertDialog } from "@/components/trial-registrations/DeleteAlertDialog";
import { RescheduleDialog } from "@/components/trial-registrations/RescheduleDialog";
import { ManualEnquiryDialog } from "@/components/trial-registrations/ManualEnquiryDialog";
import { LocationFilter, TrialRegistration } from "./types";
import { useAuth } from "@/lib/auth-context";
import { SalesAnalytics } from "@/components/trial-registrations/SalesAnalytics";

const istYmd = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
const shiftYmd = (ymd: string, days: number) => {
  const [year, month, day] = ymd.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
};

const ENQUIRIES_PER_PAGE_OPTIONS = [10, 25, 50, 100];
type EnquiryView = "enquiries" | "analytics";

function writeViewAndModeToUrl(view: EnquiryView, mode: LocationFilter, replace = false) {
  const url = new URL(window.location.href);
  url.searchParams.set("view", view);
  url.searchParams.set("mode", mode);
  window.history[replace ? "replaceState" : "pushState"]({}, "", url);
}

const Page = () => {
  const [datePreset, setDatePreset] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [activeView, setActiveView] = useState<EnquiryView>("analytics");
  const dateRange = useMemo(() => {
    const today = istYmd(new Date());
    if (datePreset === "today") return { start: today, end: today };
    if (datePreset === "7d" || datePreset === "30d") {
      return { start: shiftYmd(today, -(datePreset === "7d" ? 6 : 29)), end: today };
    }
    if (datePreset === "month") return { start: `${today.slice(0, 7)}-01`, end: today };
    if (datePreset === "custom") return { start: customStart, end: customEnd };
    return { start: "", end: "" };
  }, [datePreset, customStart, customEnd]);
  const { userRole } = useAuth();
  const canDelete = userRole === "admin" || userRole === "superAdmin";
  const canModify = userRole !== null;
  const trainerView = userRole === "trainer";
  const marketingView = userRole === "marketing";
  const canAddTrialSlot =
    userRole === "admin" ||
    userRole === "sales" ||
    marketingView;
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
    trialDateFilter,
    setTrialDateFilter,
    followUpDateFilter,
    setFollowUpDateFilter,
    sortField,
    sortDir,
    toggleSort,
    filtered,
    locationCounts,
    hasActiveFilters,
    clearFilters,
  } = useRegistrationFilters(registrations, dateRange);

  useEffect(() => {
    const readUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const requestedView = params.get("view");
      const requestedMode = params.get("mode");
      const view: EnquiryView = requestedView === "enquiries" ? "enquiries" : "analytics";
      const mode: LocationFilter = requestedMode === "online" || requestedMode === "offline"
        ? requestedMode
        : "all";
      setActiveView(view);
      setLocationFilter(mode);
      if (params.get("view") !== view || params.get("mode") !== mode) {
        writeViewAndModeToUrl(view, mode, true);
      }
    };
    readUrlState();
    window.addEventListener("popstate", readUrlState);
    return () => window.removeEventListener("popstate", readUrlState);
  }, [setLocationFilter]);

  const changeView = (view: EnquiryView) => {
    setActiveView(view);
    writeViewAndModeToUrl(view, locationFilter);
  };
  const changeMode = (mode: LocationFilter) => {
    setLocationFilter(mode);
    writeViewAndModeToUrl(activeView, mode);
  };
  const handleViewKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next: EnquiryView = event.key === "Home"
      ? "enquiries"
      : event.key === "End"
        ? "analytics"
        : activeView === "enquiries"
          ? "analytics"
          : "enquiries";
    changeView(next);
    document.getElementById(`enquiry-view-${next}`)?.focus();
  };

  const bookingCounts = useMemo(
    () => filtered.reduce((counts, registration) => {
      if (!registration.trialDate || registration.status === "cancelled") return counts;
      if (registration.bookingOrigin === "direct") counts.direct++;
      if (registration.bookingOrigin === "follow-up") counts.followUp++;
      return counts;
    }, { direct: 0, followUp: 0 }),
    [filtered],
  );

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
    datePreset,
    customStart,
    customEnd,
    statusFilter,
    locationFilter,
    centerFilter,
    leadTempFilter,
    leadOutcomeFilter,
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
        <div role="tablist" aria-label="Enquiry page views" className="mb-4 flex gap-5 border-b border-stone-200">
          {([
            { view: "enquiries", label: "Enquiries", Icon: Inbox },
            { view: "analytics", label: "Analytics", Icon: BarChart3 },
          ] as const).map(({ view, label, Icon }) => (
            <button
              key={view}
              id={`enquiry-view-${view}`}
              type="button"
              role="tab"
              aria-selected={activeView === view}
              tabIndex={activeView === view ? 0 : -1}
              onClick={() => changeView(view)}
              onKeyDown={handleViewKeyDown}
              className={`relative inline-flex items-center gap-2 pb-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 ${activeView === view ? "text-red-700" : "text-foreground/70 hover:text-foreground"}`}
            >
              <Icon aria-hidden className="h-4 w-4" />
              {label}
              {activeView === view && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-red-700" />}
            </button>
          ))}
        </div>
        <div className="mb-2 flex min-w-0">
          <FilterBar
            locationFilter={locationFilter}
            onLocationChange={changeMode}
            locationCounts={locationCounts}
            datePreset={datePreset}
            onDatePresetChange={setDatePreset}
            dateStart={customStart}
            onDateStartChange={setCustomStart}
            dateEnd={customEnd}
            onDateEndChange={setCustomEnd}
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
            trialDateFilter={trialDateFilter}
            onTrialDateChange={setTrialDateFilter}
            followUpDateFilter={followUpDateFilter}
            onFollowUpDateChange={setFollowUpDateFilter}
            hasActiveFilters={hasActiveFilters || datePreset !== "all"}
            onClearFilters={() => { clearFilters(); setDatePreset("all"); setCustomStart(""); setCustomEnd(""); }}
          />
        </div>

        <div className="mb-2 flex flex-wrap items-stretch gap-2">
          <div className="flex flex-wrap items-stretch gap-2">
          <div className="flex min-w-[170px] items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-xs font-medium text-stone-500">
              Direct trial bookings
            </p>
            <p className="text-lg font-semibold leading-none text-stone-900">
              {bookingCounts.direct}
            </p>
          </div>
          {canAddTrialSlot && (
            <button
              type="button"
              onClick={() => setManualEnquiryOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
            >
              <Plus aria-hidden className="h-4 w-4" />
              New enquiry
            </button>
          )}
          <div className="flex min-w-[170px] items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-sm">
            <p className="text-xs font-medium text-stone-500">
              Booked after follow-up
            </p>
            <p className="text-lg font-semibold leading-none text-stone-900">
              {bookingCounts.followUp}
            </p>
          </div>
          </div>
          <button
            type="button"
            onClick={() => setActivityOpen(true)}
            className="ml-auto inline-flex h-10 items-center justify-center gap-2 self-center rounded-lg border border-stone-200 bg-white px-3.5 text-sm font-medium text-stone-600 shadow-sm transition-colors hover:border-stone-300 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
          >
            <History aria-hidden className="h-4 w-4" />
            Activity
          </button>
        </div>


        {/* EMPTY */}

        {activeView === "analytics" ? (
          <div className="mt-4 w-full min-w-0">
            <SalesAnalytics registrations={filtered} />
          </div>
        ) : filtered.length === 0 ? (
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
                onClick={() => { clearFilters(); setDatePreset("all"); setCustomStart(""); setCustomEnd(""); }}
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
