import {
  CalendarClock,
  CircleDot,
  Flag,
  MessageSquareText,
} from "lucide-react";
import type { TrialRegistration } from "@/app/enquire-form/types";
import { leadOutcomeLabel, statusLabel } from "@/app/enquire-form/utils";
import {
  getLeadOutcomeTone,
  TIMELINE_TONES,
  type TimelineTone,
} from "./timeline-colors";

type Props = { registration: TrialRegistration };

function formatEventDate(value?: string | number) {
  if (!value) return "Date not recorded";
  const date = typeof value === "number" ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StudentTimelineStrip({ registration }: Props) {
  const followUps = registration.followUpHistory || [];
  const events = [
    {
      key: "enquiry",
      title: "Enquiry received",
      date: registration.createdAt || registration.dateOfRegistration,
      detail: registration.referralSource
        ? `Source: ${registration.referralSource}`
        : "Lead entered",
      icon: CircleDot,
      tone: "blue",
    },
    {
      key: "trial-status",
      title: "Trial status",
      date: registration.trialDate || undefined,
      detail: registration.trialDate
        ? `${statusLabel(registration.status)}${registration.trialTime ? ` · ${registration.trialTime}` : ""}`
        : "Filled the form, not booked trial",
      icon: CalendarClock,
      tone: "indigo",
    },
    ...(registration.counsellorRemark
      ? [{
          key: "counsellor-remark",
          title: "Counsellor remark",
          date: undefined,
          detail: registration.counsellorRemark,
          icon: MessageSquareText,
          tone: "amber",
        }]
      : []),
    ...followUps.map((followUp, index) => ({
      key: `follow-up-${index}`,
      title: `Follow-up ${index + 1}`,
      date: followUp.date || followUp.createdAt,
      detail: [
        followUp.remark || "No remark recorded",
        followUp.status ? `Trial: ${statusLabel(followUp.status)}` : "",
        followUp.leadTemp ? `Lead: ${followUp.leadTemp}` : "",
        followUp.leadOutcome ? `Outcome: ${leadOutcomeLabel(followUp.leadOutcome)}` : "",
        followUp.updatedByEmail || followUp.updatedBy
          ? `Logged by ${followUp.updatedByEmail || followUp.updatedBy}`
          : "",
      ].filter(Boolean).join(" · "),
      icon: CalendarClock,
      tone: "orange",
    })),
    ...(registration.nextFollowUpDate
      ? [{
          key: "next-follow-up-scheduled",
          title: "Next follow-up scheduled",
          date: registration.nextFollowUpDate,
          detail: "Upcoming follow-up",
          icon: CalendarClock,
          tone: "amber",
        }]
      : []),
    ...(registration.leadOutcome
      ? [{
          key: "lead-outcome",
          title: "Lead Outcome",
          date: undefined,
          detail: leadOutcomeLabel(registration.leadOutcome),
          icon: Flag,
          tone: getLeadOutcomeTone(registration.leadOutcome),
        }]
      : []),
    ...(registration.leadOutcome === "closed" && registration.closeRemark
      ? [{
          key: "close-remark",
          title: "Closed remark",
          date: undefined,
          detail: registration.closeRemark,
          icon: MessageSquareText,
          tone: "red",
        }]
      : []),
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white px-4 py-5">
      <div className="relative min-w-max">
        <div aria-hidden="true" className="absolute left-3 right-3 top-3 h-px bg-slate-200" />
        <ol className="relative flex items-start gap-0">
          {events.map((event) => {
            const Icon = event.icon;
            const colors = TIMELINE_TONES[event.tone as TimelineTone];
            return (
              <li key={event.key} className="relative w-56 shrink-0 pr-5">
                <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border ${colors.marker}`}>
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <p className={`mt-2 text-xs font-semibold ${colors.title}`}>{event.title}</p>
                {event.date !== undefined && event.date !== "" && (
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {formatEventDate(event.date)}
                  </p>
                )}
                <p className="mt-1 whitespace-normal text-xs text-slate-600">{event.detail}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
