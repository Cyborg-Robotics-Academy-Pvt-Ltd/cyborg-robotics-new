import { useMemo, useState } from "react";
import { getDisplayLocation, getLocationType } from "@/app/enquire-form/utils";
import {
  LeadOutcomeFilter,
  LeadTempFilter,
  LocationFilter,
  SortDir,
  SortField,
  TrialRegistration,
} from "@/app/enquire-form/types";
import { STATUS_OPTIONS } from "@/app/enquire-form/constants";

export function useRegistrationFilters(registrations: TrialRegistration[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");
  const [leadTempFilter, setLeadTempFilter] = useState<LeadTempFilter>("all");
  const [leadOutcomeFilter, setLeadOutcomeFilter] =
    useState<LeadOutcomeFilter>("all");

  /** Trial Slot date filter (YYYY-MM-DD). Empty string = no filter. */
  const [trialDateFilter, setTrialDateFilter] = useState("");

  /** Next Follow-up date filter (YYYY-MM-DD). Empty string = no filter. */
  const [followUpDateFilter, setFollowUpDateFilter] = useState("");

  const [sortField, setSortField] = useState<SortField>("trialDate");
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
    let online = 0;
    let offline = 0;

    registrations.forEach((registration) => {
      const type = getLocationType(registration);

      if (type === "online") {
        online++;
      } else {
        offline++;
      }
    });

    return { all: registrations.length, online, offline };
  }, [registrations]);

  /* FILTER + SORT */

  const filtered = useMemo(() => {
    let rows = [...registrations];

    /* LOCATION */

    if (locationFilter !== "all") {
      rows = rows.filter(
        (registration) => getLocationType(registration) === locationFilter,
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

    /* TRIAL SLOT DATE */

    if (trialDateFilter) {
      rows = rows.filter(
        (registration) => registration.trialDate === trialDateFilter,
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

    /* SORT */

    rows.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      const cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));

      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [
    registrations,
    searchTerm,
    statusFilter,
    locationFilter,
    leadTempFilter,
    leadOutcomeFilter,
    trialDateFilter,
    followUpDateFilter,
    sortField,
    sortDir,
  ]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    statusFilter !== "all" ||
    locationFilter !== "all" ||
    leadTempFilter !== "all" ||
    leadOutcomeFilter !== "all" ||
    trialDateFilter !== "" ||
    followUpDateFilter !== "";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLocationFilter("all");
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
