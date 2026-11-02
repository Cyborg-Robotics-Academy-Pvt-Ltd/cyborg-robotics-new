"use client";

import React, { useMemo, useState } from "react";
import {
  Calendar,
  Flag,
  History,
  MessageSquare,
  Search,
  Thermometer,
  User,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { TrialRegistration } from "@/app/enquire-form/types";
import {
  leadOutcomeLabel,
  leadOutcomeStyle,
  leadTempLabel,
  leadTempStyle,
  statusLabel,
  statusStyle,
} from "@/app/enquire-form/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrations: TrialRegistration[];
};

function formatActivityTimestamp(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const label =
    date.toDateString() === today.toDateString()
      ? "Today"
      : date.toDateString() === yesterday.toDateString()
        ? "Yesterday"
        : date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

  return `${label}, ${date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

/**
 * Flattened follow-up activity across every student, newest first.
 *
 * IMPORTANT: status / leadTemp / leadOutcome / counsellorRemark /
 * closeRemark are pulled from the PARENT registration (live,
 * current dashboard state) — NOT from the individual follow-up
 * entry. This means every entry for a student always reflects
 * that student's current status, even for follow-ups logged
 * weeks ago. Only `date` and `remark` are specific to the
 * follow-up itself.
 *
 * Built from ALL registrations (not the filtered/visible ones), so
 * the log is complete regardless of the current search or filter
 * state.
 */
export function ActivityDialog({ open, onOpenChange, registrations }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  const activityFeed = useMemo(() => {
    const entries = registrations.flatMap((registration) =>
      (registration.followUpHistory || []).map((entry, index) => ({
        key: `${registration.id}-${index}-${entry.date}`,
        studentName: registration.studentName,
        date: entry.date,
        createdAt: entry.createdAt,
        updatedBy: entry.updatedBy,
        updatedByEmail: entry.updatedByEmail,
        remark: entry.remark,

        // Live values from the current registration —
        // NOT from the frozen follow-up entry.
        status: registration.status,
        leadTemp: registration.leadTemp,
        leadOutcome: registration.leadOutcome,
        counsellorRemark: registration.counsellorRemark,
        closeRemark: registration.closeRemark,
      })),
    );

    return entries.sort((a, b) =>
      (b.createdAt || b.date).localeCompare(a.createdAt || a.date),
    );
  }, [registrations]);

  const filteredFeed = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return activityFeed;

    return activityFeed.filter(
      (entry) =>
        entry.studentName?.toLowerCase().includes(term) ||
        entry.date?.toLowerCase().includes(term) ||
        entry.remark?.toLowerCase().includes(term) ||
        entry.updatedBy?.toLowerCase().includes(term) ||
        entry.updatedByEmail?.toLowerCase().includes(term) ||
        entry.counsellorRemark?.toLowerCase().includes(term) ||
        entry.closeRemark?.toLowerCase().includes(term) ||
        statusLabel(entry.status).toLowerCase().includes(term) ||
        leadTempLabel(entry.leadTemp).toLowerCase().includes(term) ||
        leadOutcomeLabel(entry.leadOutcome).toLowerCase().includes(term),
    );
  }, [activityFeed, searchTerm]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setSearchTerm("");
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-0 bg-stone-50 p-0 shadow-[0_24px_80px_rgba(28,25,23,0.18)] sm:max-w-2xl">
        <div className="border-b border-stone-200 bg-gradient-to-r from-red-50 via-white to-stone-50 p-5">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-stone-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <History className="h-4 w-4" />
              </div>
              Activity timeline
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                autoFocus
                placeholder="Search student, status, remark..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-10 border-stone-200 bg-white pl-9 text-sm shadow-sm ring-0 placeholder:text-stone-400 focus-visible:ring-red-500"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-stone-500">
            <span>{filteredFeed.length} results</span>
            <span>{activityFeed.length} total entries</span>
          </div>
        </div>

        <div className="max-h-[68vh] space-y-3 overflow-y-auto p-4">
          {activityFeed.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-100/80 p-6 text-center text-sm italic text-stone-500">
              No follow-ups logged yet.
            </div>
          ) : filteredFeed.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-100/80 p-6 text-center text-sm italic text-stone-500">
              No matches for &quot;{searchTerm}&quot;.
            </div>
          ) : (
            filteredFeed.map((entry) => {
              const status = statusStyle(entry.status || "booked");
              const temp = leadTempStyle(entry.leadTemp || "warm");
              const outcome = leadOutcomeStyle(entry.leadOutcome || "opened");
              const isClosed = entry.leadOutcome === "closed";
              const isShow = entry.status === "show";
              const savedAt = formatActivityTimestamp(entry.createdAt);

              return (
                <div
                  key={entry.key}
                  className="relative pl-5"
                >
                  <div className="absolute left-[6px] top-1.5 h-full w-px bg-stone-200" />
                  <div className="absolute left-0 top-2 h-3 w-3 rounded-full border-2 border-white bg-red-700 shadow-sm" />

                  <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50/30">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-stone-800">
                          {entry.studentName}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
                          <Calendar className="h-3 w-3" />
                          Follow-up {entry.date}
                        </div>
                      </div>

                      {savedAt && (
                        <span className="shrink-0 rounded-full bg-stone-100 px-2 py-1 text-[10px] font-medium text-stone-500">
                          Updated {savedAt}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium shadow-sm ring-1 ring-inset ring-stone-200",
                          status.text,
                        )}
                      >
                        <span
                          className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
                        />
                        {statusLabel(entry.status)}
                      </span>

                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium shadow-sm ring-1 ring-inset ring-stone-200",
                          temp.text,
                        )}
                      >
                        <Thermometer className="h-3 w-3" />
                        {leadTempLabel(entry.leadTemp)}
                      </span>

                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium shadow-sm ring-1 ring-inset ring-stone-200",
                          outcome.text,
                        )}
                      >
                        <Flag className="h-3 w-3" />
                        {leadOutcomeLabel(entry.leadOutcome)}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "mt-3 rounded-xl border border-stone-200 bg-stone-50 p-2.5",
                        entry.remark ? "text-stone-600" : "italic text-stone-400",
                      )}
                    >
                      <div className="flex items-start gap-2 text-sm leading-6">
                        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                        <span>{entry.remark || "No follow-up remark"}</span>
                      </div>
                    </div>

                    {entry.updatedBy && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                        <User className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                        <span className="">
                          Updated by: {entry.updatedBy}
                          {entry.updatedByEmail &&
                          entry.updatedByEmail !== entry.updatedBy ? (
                            <span className="text-stone-400">
                            
                            </span>
                          ) : null}
                        </span>
                      </p>
                    )}

                    {isShow && entry.counsellorRemark && (
                      <p className="mt-2 text-xs leading-5 text-stone-600">
                        <span className="font-semibold text-stone-700">
                          Counsellor: {" "}
                        </span>
                        {entry.counsellorRemark}
                      </p>
                    )}

                    {isClosed && entry.closeRemark && (
                      <p className="mt-2 text-xs leading-5 text-stone-600">
                        <span className="font-semibold text-stone-700">
                          Close reason: {" "}
                        </span>
                        {entry.closeRemark}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
