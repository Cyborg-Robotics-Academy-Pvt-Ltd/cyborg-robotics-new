"use client";

import {
  CalendarClock,
  CircleDot,
  Flag,
  History,
  MessageSquareText,
} from "lucide-react";
import type { TrialRegistration } from "@/app/enquire-form/types";
import { leadOutcomeLabel, statusLabel } from "@/app/enquire-form/utils";
import {
  getLeadOutcomeTone,
  TIMELINE_TONES,
  type TimelineTone,
} from "./timeline-colors";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  registration: TrialRegistration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatTimestamp(value: string | number | undefined) {
  if (value === undefined || value === "") return "Date not recorded";
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export function StudentTimelineDialog({
  registration,
  open,
  onOpenChange,
}: Props) {
  if (!registration) return null;

  const events = [
    {
      key: "enquiry",
      title: "Enquiry received",
      date: registration.createdAt || registration.dateOfRegistration,
      detail: registration.referralSource ? `Source: ${registration.referralSource}` : "Student entered the lead pipeline",
      icon: CircleDot,
      tone: "blue",
    },
    ...(registration.trialDate
      ? [{
          key: "trial",
          title: "Trial scheduled",
          date: registration.trialDate,
          detail: `${registration.trialTime || "Time not set"} · ${statusLabel(registration.status)}`,
          icon: CalendarClock,
          tone: "indigo",
        }]
      : []),
    ...(registration.followUpHistory || []).map((entry, index) => ({
      key: `followup-${index}`,
      title: entry.leadOutcome
        ? `Lead outcome · ${leadOutcomeLabel(entry.leadOutcome)}`
        : "Follow-up logged",
      date: entry.createdAt || entry.date,
      detail: [entry.remark, entry.updatedBy ? `Updated by ${entry.updatedBy}` : ""].filter(Boolean).join(" · ") || "No note recorded",
      icon: MessageSquareText,
      tone: entry.leadOutcome
        ? getLeadOutcomeTone(entry.leadOutcome)
        : "orange",
    })),
    ...(registration.leadOutcome
      ? [{
          key: "current-outcome",
          title: `Current lead outcome · ${leadOutcomeLabel(registration.leadOutcome)}`,
          date: undefined,
          detail: registration.closeRemark || "Current status; change date is not recorded",
          icon: Flag,
          tone: getLeadOutcomeTone(registration.leadOutcome),
        }]
      : []),
  ].sort((a, b) => {
    const toTime = (value: string | number | undefined) => {
      if (value === undefined || value === "") return Number.MAX_SAFE_INTEGER;
      const parsed = typeof value === "number" ? value : Date.parse(value);
      return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
    };
    return toTime(a.date) - toTime(b.date);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto border-stone-200 bg-white sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {registration.studentName || "Student"} timeline
          </DialogTitle>
        </DialogHeader>
        {events.length ? (
          <ol className="relative ml-2 space-y-0 border-l border-stone-200">
            {events.map((event) => {
              const Icon = event.icon;
              const colors = TIMELINE_TONES[event.tone as TimelineTone];
              return (
                <li key={event.key} className="relative pb-5 pl-6 last:pb-1">
                  <span className={`absolute -left-[13px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${colors.marker}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <p className={`text-sm font-semibold ${colors.title}`}>{event.title}</p>
                  {event.date !== undefined && event.date !== "" && (
                    <p className="mt-0.5 text-xs text-stone-500">
                      {formatTimestamp(event.date)}
                    </p>
                  )}
                  <p className="mt-1 whitespace-pre-wrap text-sm text-stone-600">{event.detail}</p>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="py-6 text-center text-sm text-stone-500">No timeline events recorded.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
