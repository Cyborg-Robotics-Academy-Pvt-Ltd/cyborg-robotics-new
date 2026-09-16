"use client";

import React from "react";
import { Calendar, CalendarClock, History, Search, X } from "lucide-react";

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

import {
  LEAD_OUTCOME_OPTIONS,
  LEAD_TEMP_OPTIONS,
  STATUS_OPTIONS,
} from "@/app/enquire-form/constants";
import {
  dateToYMD,
  formatYMDDisplay,
  ymdToDate,
} from "@/app/enquire-form/utils";
import { LeadOutcomeFilter, LeadTempFilter } from "@/app/enquire-form/types";

type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;

  statusFilter: string;
  onStatusChange: (value: string) => void;

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

  onActivityClick: () => void;
};

export function FilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
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
  onActivityClick,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* SEARCH */}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

        <Input
          placeholder="Search name, email, phone, location..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full border-stone-200 bg-white pl-9 shadow-sm focus-visible:ring-orange-500 sm:w-72"
        />
      </div>

      {/* STATUS */}

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full border-stone-200 bg-white shadow-sm sm:w-40">
          <SelectValue placeholder="Trial Status" />
        </SelectTrigger>

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
        <SelectTrigger className="w-full border-stone-200 bg-white shadow-sm sm:w-36">
          <SelectValue placeholder="Lead Temp" />
        </SelectTrigger>

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
        <SelectTrigger className="w-full border-stone-200 bg-white shadow-sm sm:w-40">
          <SelectValue placeholder="Lead Outcome" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All outcomes</SelectItem>

          {LEAD_OUTCOME_OPTIONS.map((option) => (
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
            className={cn(
              "inline-flex w-full items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm hover:border-stone-300 sm:w-40",
              trialDateFilter ? "text-stone-900" : "text-stone-400",
            )}
          >
            <Calendar className="h-4 w-4 shrink-0 text-stone-400" />

            <span className="truncate">
              {trialDateFilter
                ? formatYMDDisplay(trialDateFilter)
                : "Trial slot"}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0 bg-white" align="start">
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
                className="w-full rounded-md py-1.5 text-center text-xs font-medium text-stone-500 hover:bg-stone-50 hover:text-red-600"
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
            className={cn(
              "inline-flex w-full items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm shadow-sm hover:border-stone-300 sm:w-40",
              followUpDateFilter ? "text-stone-900" : "text-stone-400",
            )}
          >
            <CalendarClock className="h-4 w-4 shrink-0 text-stone-400" />

            <span className="truncate">
              {followUpDateFilter
                ? formatYMDDisplay(followUpDateFilter)
                : "Follow-up"}
            </span>
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0 bg-white" align="start">
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
                className="w-full rounded-md py-1.5 text-center text-xs font-medium text-stone-500 hover:bg-stone-50 hover:text-red-600"
              >
                Clear date
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* CLEAR FILTERS */}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-500 shadow-sm hover:border-red-200 hover:text-red-600"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}

      {/* ACTIVITY */}

      <button
        type="button"
        onClick={onActivityClick}
        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-600 shadow-sm hover:border-stone-300 hover:text-orange-600"
      >
        <History className="h-4 w-4" />
        Activity
      </button>
    </div>
  );
}
