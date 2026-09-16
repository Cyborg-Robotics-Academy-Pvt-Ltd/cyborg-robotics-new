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
      <DialogContent className="sm:max-w-lg bg-white border-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Activity
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            autoFocus
            placeholder="Search name, date, status, remark..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="border-stone-200 bg-white pl-9 shadow-sm focus-visible:ring-orange-500"
          />
        </div>

        <div className="max-h-[65vh] space-y-2 overflow-y-auto">
          {activityFeed.length === 0 ? (
            <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4 text-center text-sm italic text-stone-400">
              No follow-ups logged yet.
            </p>
          ) : filteredFeed.length === 0 ? (
            <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4 text-center text-sm italic text-stone-400">
              No matches for &quot;{searchTerm}&quot;.
            </p>
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
                  className="rounded-lg border border-stone-200 bg-stone-50 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-stone-700">
                      {entry.studentName}
                    </span>
                    <div className="shrink-0 text-right text-xs tabular-nums text-stone-400">
                      <span className="flex items-center justify-end gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Follow-up: {entry.date}
                      </span>
                      {savedAt && (
                        <p className="mt-1 text-[11px]">Updated: {savedAt}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium",
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
                        "inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium",
                        temp.text,
                      )}
                    >
                      <Thermometer className="h-3 w-3" />
                      {leadTempLabel(entry.leadTemp)}
                    </span>

                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium",
                        outcome.text,
                      )}
                    >
                      <Flag className="h-3 w-3" />
                      {leadOutcomeLabel(entry.leadOutcome)}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "mt-2 flex items-start gap-1.5 text-sm",
                      entry.remark ? "text-stone-600" : "italic text-stone-400",
                    )}
                  >
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                    {entry.remark || "No follow-up remark"}
                  </p>

                  {entry.updatedBy && (
                    <p className="mt-1 flex items-center gap-1.5 pl-5 text-xs text-stone-500">
                      <User className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                      Updated by: {entry.updatedBy}
                      {entry.updatedByEmail &&
                      entry.updatedByEmail !== entry.updatedBy ? (
                        <span className="text-stone-400">
                          ({entry.updatedByEmail})
                        </span>
                      ) : null}
                    </p>
                  )}

                  {isShow && entry.counsellorRemark && (
                    <p className="mt-1 pl-5 text-xs text-stone-500">
                      <span className="font-medium text-stone-600">
                        Counsellor:{" "}
                      </span>
                      {entry.counsellorRemark}
                    </p>
                  )}

                  {isClosed && entry.closeRemark && (
                    <p className="mt-1 pl-5 text-xs text-stone-500">
                      <span className="font-medium text-stone-600">
                        Close reason:{" "}
                      </span>
                      {entry.closeRemark}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
