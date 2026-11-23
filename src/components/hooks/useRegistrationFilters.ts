import { useMemo, useState } from "react";
import {
  getDisplayLocation,
  getRegistrationCenter,
  getLocationType,
} from "@/app/enquire-form/utils";
import {
  CenterFilter,
  LeadOutcomeFilter,
  LeadTempFilter,
  LocationFilter,
  SortDir,
  SortField,
  TrialRegistration,
} from "@/app/enquire-form/types";
import { STATUS_OPTIONS } from "@/app/enquire-form/constants";

type DateRange = { start: string; end: string };

const registrationDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getRegistrationDate(registration: TrialRegistration) {
  if (registration.createdAt) {
    const createdAt = new Date(registration.createdAt);
    if (!Number.isNaN(createdAt.getTime())) return registrationDateFormatter.format(createdAt);
  }
  return registration.dateOfRegistration || "";
}

function matchesDateRange(registration: TrialRegistration, range: DateRange) {
  const date = getRegistrationDate(registration);
  return (!range.start || date >= range.start) && (!range.end || date <= range.end);
}

export function useRegistrationFilters(
  registrations: TrialRegistration[],
  dateRange: DateRange = { start: "", end: "" },
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");
  const [centerFilter, setCenterFilter] = useState<CenterFilter>("all");
  const [leadTempFilter, setLeadTempFilter] = useState<LeadTempFilter>("all");
  const [leadOutcomeFilter, setLeadOutcomeFilter] =
    useState<LeadOutcomeFilter>("all");

  /** Trial Slot date filter (YYYY-MM-DD). Empty string = no filter. */
  const [trialDateFilter, setTrialDateFilter] = useState("");

  /** Next Follow-up date filter (YYYY-MM-DD). Empty string = no filter. */
  const [followUpDateFilter, setFollowUpDateFilter] = useState("");

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  /* STATUS COUNTS */

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    registrations.forEach((registration) => {
      const status = registration.status || "booked";
      counts[status] = (counts[status] || 0) + 1;
    });

    return counts;
  }, [registrations]);

  /* LOCATION COUNTS */

  const locationCounts = useMemo(() => {
    const matchingWithoutLocation = registrations.filter((registration) => {
      if (!matchesDateRange(registration, dateRange)) return false;
      if (trialDateFilter) return registration.trialDate === trialDateFilter;

      if (
        centerFilter !== "all" &&
        getRegistrationCenter(registration) !== centerFilter
      ) return false;

      if (
        statusFilter !== "all" &&
        (registration.status || "booked").toLowerCase() !== statusFilter.toLowerCase()
      ) return false;

      if (
        leadTempFilter !== "all" &&
        (registration.leadTemp || "warm").toLowerCase() !== leadTempFilter.toLowerCase()
      ) return false;

      if (
        leadOutcomeFilter !== "all" &&
        (registration.leadOutcome || "opened").toLowerCase() !== leadOutcomeFilter.toLowerCase()
      ) return false;

      if (
        followUpDateFilter &&
        registration.nextFollowUpDate !== followUpDateFilter
      ) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const displayLocation = getDisplayLocation(registration).toLowerCase();
        const mode = getLocationType(registration);
        const matchesSearch =
          registration.studentName?.toLowerCase().includes(term) ||
          registration.email?.toLowerCase().includes(term) ||
          registration.contactNumber?.includes(term) ||
          registration.remark?.toLowerCase().includes(term) ||
          registration.location?.toLowerCase().includes(term) ||
          displayLocation.includes(term) ||
          mode.includes(term);
        if (!matchesSearch) return false;
      }

      return true;
    });

    const online = matchingWithoutLocation.filter(
      (registration) => getLocationType(registration) === "online",
    ).length;
    const offline = matchingWithoutLocation.length - online;

    return { all: matchingWithoutLocation.length, online, offline };
  }, [
    registrations,
    dateRange,
    trialDateFilter,
    centerFilter,
    statusFilter,
    leadTempFilter,
    leadOutcomeFilter,
    followUpDateFilter,
    searchTerm,
  ]);

  const sortedRegistrations = useMemo(() => {
    const rows = [...registrations];
    rows.sort((a, b) => {
      const cmp = String(a[sortField] ?? "").localeCompare(
        String(b[sortField] ?? ""),
      );
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [registrations, sortField, sortDir]);

  /* FILTER + SORT */

  const filtered = useMemo(() => {
    let rows = trialDateFilter
      ? sortedRegistrations.filter(
          (registration) => registration.trialDate === trialDateFilter,
        )
      : [...sortedRegistrations];

    rows = rows.filter((registration) => matchesDateRange(registration, dateRange));

    // A selected trial date is a direct slot lookup. Other enquiry filters
    // must not hide registrations booked for that date (including reschedules).
    if (!trialDateFilter) {
      /* LOCATION */

      if (locationFilter !== "all") {
        rows = rows.filter(
          (registration) => getLocationType(registration) === locationFilter,
        );
      }

      if (centerFilter !== "all") {
        rows = rows.filter(
          (registration) => getRegistrationCenter(registration) === centerFilter,
        );
      }

      /* STATUS */

      if (statusFilter !== "all") {
        rows = rows.filter(
          (registration) =>
            (registration.status || "booked").toLowerCase() ===
            statusFilter.toLowerCase(),
        );
      }

      /* LEAD TEMP */

      if (leadTempFilter !== "all") {
        rows = rows.filter(
          (registration) =>
            (registration.leadTemp || "warm").toLowerCase() ===
            leadTempFilter.toLowerCase(),
        );
      }

      /* LEAD OUTCOME */

      if (leadOutcomeFilter !== "all") {
        rows = rows.filter(
          (registration) =>
            (registration.leadOutcome || "opened").toLowerCase() ===
            leadOutcomeFilter.toLowerCase(),
        );
      }

      /* NEXT FOLLOW-UP DATE */

      if (followUpDateFilter) {
        rows = rows.filter(
          (registration) => registration.nextFollowUpDate === followUpDateFilter,
        );
      }

      /* SEARCH */

      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();

        rows = rows.filter((registration) => {
          const displayLocation = getDisplayLocation(registration).toLowerCase();
          const mode = getLocationType(registration);

          return (
            registration.studentName?.toLowerCase().includes(term) ||
            registration.email?.toLowerCase().includes(term) ||
            registration.contactNumber?.includes(term) ||
            registration.remark?.toLowerCase().includes(term) ||
            registration.location?.toLowerCase().includes(term) ||
            displayLocation.includes(term) ||
            mode.includes(term)
          );
        });
      }
    }

    return rows;
  }, [
    sortedRegistrations,
    dateRange,
    searchTerm,
    statusFilter,
    locationFilter,
    centerFilter,
    leadTempFilter,
    leadOutcomeFilter,
    trialDateFilter,
    followUpDateFilter,
  ]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "all" ||
    locationFilter !== "all" ||
    centerFilter !== "all" ||
    leadTempFilter !== "all" ||
    leadOutcomeFilter !== "all" ||
    trialDateFilter !== "" ||
    followUpDateFilter !== "";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLocationFilter("all");
    setCenterFilter("all");
    setLeadTempFilter("all");
    setLeadOutcomeFilter("all");
    setTrialDateFilter("");
    setFollowUpDateFilter("");
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  return {
    // raw state + setters
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

    // derived
    filtered,
    statusCounts,
    locationCounts,
    hasActiveFilters,
    clearFilters,
    statusOptions: STATUS_OPTIONS,
  };
}
