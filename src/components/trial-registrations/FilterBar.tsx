"use client";

import React from "react";
import {
  Calendar,
  CalendarClock,
  CircleDot,
  MapPin,
  Search,
  Target,
  Thermometer,
  X,
  type LucideIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { LocationFilter } from "@/app/enquire-form/types";
import { LocationTabs } from "@/components/trial-registrations/LocationTabs";
import {
  OFFLINE_CENTERS,
  LEAD_OUTCOME_OPTIONS,
  LEAD_TEMP_OPTIONS,
  STATUS_OPTIONS,
} from "@/app/enquire-form/constants";
import {
  dateToYMD,
  formatYMDDisplay,
  ymdToDate,
} from "@/app/enquire-form/utils";
import {
  CenterFilter,
  LeadOutcomeFilter,
  LeadTempFilter,
} from "@/app/enquire-form/types";

type Props = {
  locationFilter: LocationFilter;
  onLocationChange: (value: LocationFilter) => void;
  locationCounts: { all: number; online: number; offline: number };
  datePreset: string;
  onDatePresetChange: (value: string) => void;
  dateStart: string;
  onDateStartChange: (value: string) => void;
  dateEnd: string;
  onDateEndChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;

  statusFilter: string;
  onStatusChange: (value: string) => void;

  centerFilter: CenterFilter;
  onCenterChange: (value: CenterFilter) => void;

  leadTempFilter: LeadTempFilter;
  onLeadTempChange: (value: LeadTempFilter) => void;

  leadOutcomeFilter: LeadOutcomeFilter;
  onLeadOutcomeChange: (value: LeadOutcomeFilter) => void;

  trialDateFilter: string;
  onTrialDateChange: (value: string) => void;

  followUpDateFilter: string;
  onFollowUpDateChange: (value: string) => void;

  hasActiveFilters: boolean;
  onClearFilters: () => void;

};

/* Shared control look: uniform height, radius, hover and keyboard focus */
const CONTROL =
  "h-10 rounded-lg border border-stone-200 bg-white text-sm shadow-sm transition-colors hover:border-stone-300 focus-visible:border-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30";

/* Applied when a filter is narrowing the list */
const CONTROL_ACTIVE =
  "border-red-300 bg-red-50/60 text-red-800 hover:border-red-400";

const BUTTON = `inline-flex items-center justify-center gap-2 whitespace-nowrap px-3.5 font-medium ${CONTROL}`;

const DATE_TRIGGER = `inline-flex w-full items-center gap-2 px-3 sm:w-44 ${CONTROL}`;

const CLEAR_DATE =
  "w-full rounded-md py-1.5 text-center text-xs font-medium text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300";

/* Select trigger with a leading icon. Value span grows so the chevron stays right. */
type FilterTriggerProps = {
  icon: LucideIcon;
  label: string;
  placeholder: string;
  active: boolean;
  className?: string;
};

function FilterTrigger({
  icon: Icon,
  label,
  placeholder,
  active,
  className,
}: FilterTriggerProps) {
  return (
    <SelectTrigger
      aria-label={label}
      className={cn(
        CONTROL,
        "w-full justify-start gap-2 px-3 [&>span]:flex-1 [&>span]:text-left",
        active && CONTROL_ACTIVE,
        className,
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-red-600" : "text-stone-400",
        )}
      />
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
  );
}

export function FilterBar({
  locationFilter, onLocationChange, locationCounts,
  datePreset, onDatePresetChange, dateStart, onDateStartChange, dateEnd, onDateEndChange,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  centerFilter,
  onCenterChange,
  leadTempFilter,
  onLeadTempChange,
  leadOutcomeFilter,
  onLeadOutcomeChange,
  trialDateFilter,
  onTrialDateChange,
  followUpDateFilter,
  onFollowUpDateChange,
  hasActiveFilters,
  onClearFilters,
}: Props) {
  return (
    <div
      role="search"
      aria-label="Filter enquiries"
      className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl border border-stone-200/80 bg-stone-50/60 p-2"
    >
      <LocationTabs locationFilter={locationFilter} onChange={onLocationChange} counts={locationCounts} />
      <Select value={datePreset} onValueChange={onDatePresetChange}>
        <FilterTrigger icon={Calendar} label="Date range" placeholder="Date range" active={datePreset !== "all"} className="sm:w-40" />
        <SelectContent>
          <SelectItem value="all">All dates</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="month">This month</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>
      {datePreset === "custom" && <div className="flex shrink-0 items-center gap-1">
        <Input aria-label="Start date" type="date" value={dateStart} onChange={e => onDateStartChange(e.target.value)} className={cn(CONTROL, "w-36 px-2")} />
        <span className="text-xs text-stone-400">to</span>
        <Input aria-label="End date" type="date" value={dateEnd} onChange={e => onDateEndChange(e.target.value)} className={cn(CONTROL, "w-36 px-2")} />
      </div>}
      {/* SEARCH */}

      <div className="relative w-56 shrink-0">
        <Search
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
            searchTerm ? "text-red-600" : "text-stone-400",
          )}
        />

        <Input
          type="search"
          aria-label="Search enquiries"
          placeholder="Search name, email, phone, location..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className={cn(
            CONTROL,
            "w-full pl-9",
            searchTerm && CONTROL_ACTIVE,
          )}
        />
      </div>

      {/* CENTER */}

      <Select
        value={centerFilter}
        onValueChange={(value) => onCenterChange(value as CenterFilter)}
      >
        <FilterTrigger
          icon={MapPin}
          label="Filter by center"
          placeholder="All centers"
          active={centerFilter !== "all"}
          className="sm:w-48"
        />
        <SelectContent>
          <SelectItem value="all">All centers</SelectItem>
          {OFFLINE_CENTERS.map((center) => (
            <SelectItem key={center.id} value={center.id}>
              {center.name.replace(", Pune", "")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* STATUS */}

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <FilterTrigger
          icon={CircleDot}
          label="Filter by trial status"
          placeholder="Trial Status"
          active={statusFilter !== "all"}
          className="sm:w-44"
        />

        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>

          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* LEAD TEMP */}

      <Select
        value={leadTempFilter}
        onValueChange={(value) => onLeadTempChange(value as LeadTempFilter)}
      >
        <FilterTrigger
          icon={Thermometer}
          label="Filter by lead temperature"
          placeholder="Lead Temp"
          active={leadTempFilter !== "all"}
          className="sm:w-40"
        />

        <SelectContent>
          <SelectItem value="all">All temps</SelectItem>

          {LEAD_TEMP_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* LEAD OUTCOME */}

      <Select
        value={leadOutcomeFilter}
        onValueChange={(value) =>
          onLeadOutcomeChange(value as LeadOutcomeFilter)
        }
      >
        <FilterTrigger
          icon={Target}
          label="Filter by lead outcome"
          placeholder="Lead Outcome"
          active={leadOutcomeFilter !== "all"}
          className="sm:w-44"
        />

        <SelectContent>
          <SelectItem value="all">All outcomes</SelectItem>

          {LEAD_OUTCOME_OPTIONS.filter((option) =>
            ["opened", "joined", "closed", "nurture"].includes(option.value),
          ).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* TRIAL SLOT DATE */}

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={
              trialDateFilter
                ? `Trial slot date: ${formatYMDDisplay(trialDateFilter)}`
                : "Filter by trial slot date"
            }
            className={cn(
              DATE_TRIGGER,
              trialDateFilter ? CONTROL_ACTIVE : "text-stone-400",
            )}
          >
            <Calendar
              aria-hidden
              className={cn(
                "h-4 w-4 shrink-0",
                trialDateFilter ? "text-red-600" : "text-stone-400",
              )}
            />

            <span className="truncate">
              {trialDateFilter
                ? formatYMDDisplay(trialDateFilter)
                : "Trial slot"}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto rounded-xl border-stone-200 bg-white p-0 shadow-lg"
          align="start"
        >
          <CalendarPicker
            mode="single"
            selected={ymdToDate(trialDateFilter)}
            onSelect={(date) => onTrialDateChange(date ? dateToYMD(date) : "")}
            initialFocus
          />

          {trialDateFilter && (
            <div className="border-t border-stone-100 p-2">
              <button
                type="button"
                onClick={() => onTrialDateChange("")}
                className={CLEAR_DATE}
              >
                Clear date
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* NEXT FOLLOW-UP DATE */}

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={
              followUpDateFilter
                ? `Follow-up date: ${formatYMDDisplay(followUpDateFilter)}`
                : "Filter by follow-up date"
            }
            className={cn(
              DATE_TRIGGER,
              followUpDateFilter ? CONTROL_ACTIVE : "text-stone-400",
            )}
          >
            <CalendarClock
              aria-hidden
              className={cn(
                "h-4 w-4 shrink-0",
                followUpDateFilter ? "text-red-600" : "text-stone-400",
              )}
            />

            <span className="truncate">
              {followUpDateFilter
                ? formatYMDDisplay(followUpDateFilter)
                : "Follow-up"}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto rounded-xl border-stone-200 bg-white p-0 shadow-lg"
          align="start"
        >
          <CalendarPicker
            mode="single"
            selected={ymdToDate(followUpDateFilter)}
            onSelect={(date) =>
              onFollowUpDateChange(date ? dateToYMD(date) : "")
            }
            initialFocus
          />

          {followUpDateFilter && (
            <div className="border-t border-stone-100 p-2">
              <button
                type="button"
                onClick={() => onFollowUpDateChange("")}
                className={CLEAR_DATE}
              >
                Clear date
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* ACTIONS */}

      <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className={cn(
              BUTTON,
              "flex-1 text-stone-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-300 sm:flex-none",
            )}
          >
            <X aria-hidden className="h-3.5 w-3.5" />
            Clear
          </button>
        )}

      </div>
    </div>
  );
}
