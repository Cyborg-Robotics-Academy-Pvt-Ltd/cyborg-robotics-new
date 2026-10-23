"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Calendar,
  CalendarClock,
  Check,
  Flag,
  Globe,
  History,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Thermometer,
  Trash2,
  X,
} from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  LEAD_OUTCOME_OPTIONS,
  LEAD_TEMP_OPTIONS,
  STATUS_OPTIONS,
} from "@/app/enquire-form/constants";
import {
  avatarShade,
  getDisplayLocation,
  isEnquiryFromToday,
  getLocationType,
  initials,
  leadOutcomeStyle,
  leadTempStyle,
  normalizeLocation,
  statusStyle,
} from "@/app/enquire-form/utils";

import { TrialRegistration } from "@/app/enquire-form/types";

type Props = {
  registration: TrialRegistration;
  hasShowRows: boolean;
  hasClosedRows: boolean;
  onStatusChange: (id: string, status: string) => void;
  onLeadTempChange: (id: string, value: string) => void;
  onLeadOutcomeChange: (id: string, value: string) => void;
  onCounsellorRemarkSave: (id: string, value: string) => void;
  onCloseRemarkSave: (id: string, value: string) => void;
  onFollowUpClick: (registration: TrialRegistration) => void;
  onEdit: (registration: TrialRegistration) => void;
  onDelete: (registration: TrialRegistration) => void;
};

/* -------------------------------------------------------------------------- */
/* Shared styles                                                              */
/* -------------------------------------------------------------------------- */

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-1";

const selectTriggerBase = cn(
  "h-8 border-0 bg-transparent px-2 shadow-none transition-colors",
  "hover:bg-stone-100 focus:ring-0 focus-visible:ring-2 focus-visible:ring-orange-400/70",
);

/* -------------------------------------------------------------------------- */
/* Follow-up urgency                                                          */
/* -------------------------------------------------------------------------- */

type FollowUpTone = "overdue" | "today" | "upcoming";

/** Accepts YYYY-MM-DD, DD/MM/YYYY and DD-MM-YYYY. Returns null if unparseable. */
function parseLocalDate(raw?: string | null): Date | null {
  if (!raw) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  const dmy = /^(\d{2})[/-](\d{2})[/-](\d{4})/.exec(raw);

  const parts = iso
    ? { y: +iso[1], m: +iso[2], d: +iso[3] }
    : dmy
      ? { y: +dmy[3], m: +dmy[2], d: +dmy[1] }
      : null;

  if (!parts) return null;

  const date = new Date(parts.y, parts.m - 1, parts.d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getFollowUpTone(raw?: string | null): FollowUpTone | null {
  const date = parseLocalDate(raw);
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) return "overdue";
  if (date.getTime() === today.getTime()) return "today";
  return "upcoming";
}

const FOLLOW_UP_STYLES: Record<FollowUpTone | "none", string> = {
  overdue: "bg-red-50 text-red-700 hover:bg-red-100",
  today: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  upcoming: "text-stone-600 hover:bg-stone-100 hover:text-orange-600",
  none: "text-stone-500 hover:bg-stone-100 hover:text-orange-600",
};

const FOLLOW_UP_LABEL: Record<FollowUpTone, string> = {
  overdue: "Overdue",
  today: "Due today",
  upcoming: "Upcoming",
};

/* -------------------------------------------------------------------------- */
/* Inline remark editor (replaces two duplicated editors)                     */
/* -------------------------------------------------------------------------- */

type InlineRemarkProps = {
  value: string;
  label: string;
  placeholder: string;
  emptyLabel: string;
  onSave: (value: string) => void;
};

function InlineRemark({
  value,
  label,
  placeholder,
  emptyLabel,
  onSave,
}: InlineRemarkProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);

  // Return focus to the trigger after closing the editor (keyboard users).
  useEffect(() => {
    if (wasEditing.current && !editing) triggerRef.current?.focus();
    wasEditing.current = editing;
  }, [editing]);

  const open = () => {
    setDraft(value); // always start from the latest server value
    setEditing(true);
  };

  const cancel = () => setEditing(false);

  const commit = () => {
    const next = draft.trim();
    if (next !== value.trim()) onSave(next);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          autoFocus
          value={draft}
          maxLength={500}
          aria-label={label}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              event.stopPropagation();
              cancel();
            }
          }}
          className="h-8 text-sm"
        />

        <button
          type="button"
          onClick={commit}
          aria-label="Save remark"
          title="Save (Enter)"
          className={cn(
            "rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50",
            focusRing,
          )}
        >
          <Check className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={cancel}
          aria-label="Cancel editing"
          title="Cancel (Esc)"
          className={cn(
            "rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600",
            focusRing,
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={open}
      title={value || undefined}
      aria-label={value ? `${label}: ${value}. Edit` : `${emptyLabel}`}
      className={cn(
        "group/remark flex max-w-[220px] items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-sm",
        "hover:bg-stone-100 hover:text-orange-600",
        value ? "text-stone-700" : "text-stone-400",
        focusRing,
      )}
    >
      <span className="truncate">{value || emptyLabel}</span>
      <Pencil
        aria-hidden
        className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover/remark:opacity-100"
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Row                                                                        */
/* -------------------------------------------------------------------------- */

function DesktopRowImpl({
  registration,
  hasShowRows,
  hasClosedRows,
  onStatusChange,
  onLeadTempChange,
  onLeadOutcomeChange,
  onCounsellorRemarkSave,
  onCloseRemarkSave,
  onFollowUpClick,
  onEdit,
  onDelete,
}: Props) {
  const { id } = registration;

  const status = statusStyle(registration.status || "booked");
  const temp = leadTempStyle(registration.leadTemp);
  const outcome = leadOutcomeStyle(registration.leadOutcome);

  const locationType = getLocationType(registration);
  const displayLocation = getDisplayLocation(registration);

  const isShow = registration.status === "show";
  const isClosed = registration.leadOutcome === "closed";

  const followUpCount = registration.followUpHistory?.length ?? 0;

  // Closed leads no longer need chasing, so don't flag them.
  const followUpTone = isClosed
    ? null
    : getFollowUpTone(registration.nextFollowUpDate);

  const saveCounsellor = useCallback(
    (value: string) => onCounsellorRemarkSave(id, value),
    [id, onCounsellorRemarkSave],
  );
  const saveClose = useCallback(
    (value: string) => onCloseRemarkSave(id, value),
    [id, onCloseRemarkSave],
  );

  const phoneHref = `tel:${registration.contactNumber.replace(/\s+/g, "")}`;

  return (
    <TableRow className="group border-stone-100 transition-colors hover:bg-orange-50/40 focus-within:bg-orange-50/40">
      {/* STUDENT */}

      <TableCell className="sticky left-0 z-10 w-[300px] min-w-[300px] max-w-[300px] bg-white bg-clip-padding group-hover:bg-[#fffcf8] group-focus-within:bg-[#fffcf8]">
        {followUpTone === "overdue" && (
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[3px] bg-red-500"
          />
        )}

        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white shadow-sm",
              avatarShade(registration.studentName),
            )}
          >
            {initials(registration.studentName)}
          </div>

          <div className="min-w-0">
            <p className="flex min-w-0 items-center gap-2 font-medium text-stone-900">
              <span className="min-w-0 truncate" title={registration.studentName}>
                {registration.studentName}
              </span>
              {isEnquiryFromToday(
                registration.createdAt,
                registration.dateOfRegistration,
              ) && (
                <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  New
                </span>
              )}
            </p>
            <p className="mt-0.5 text-xs text-stone-500">
              Age {registration.age}
            </p>
          </div>
        </div>
      </TableCell>

      {/* CONTACT */}

      <TableCell className="sticky left-[300px] z-10 w-[300px] min-w-[300px] max-w-[300px] bg-white bg-clip-padding shadow-[6px_0_8px_-6px_rgba(0,0,0,0.12)] group-hover:bg-[#fffcf8] group-focus-within:bg-[#fffcf8]">
        <div className="flex flex-col gap-1 text-sm">
          <a
            href={`mailto:${registration.email}`}
            title={registration.email}
            className={cn(
              "flex min-w-0 items-start gap-1.5 rounded text-stone-500 hover:text-orange-600",
              focusRing,
            )}
          >
            <Mail aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="sr-only">Email </span>
            <span className="min-w-0 break-all">{registration.email}</span>
          </a>

          <a
            href={phoneHref}
            className={cn(
              "flex items-center gap-1.5 rounded text-stone-500 hover:text-orange-600",
              focusRing,
            )}
          >
            <Phone aria-hidden className="h-3.5 w-3.5 shrink-0" />
            <span className="sr-only">Call </span>
            {registration.contactNumber}
          </a>
        </div>
      </TableCell>

      {/* ENQUIRY SUBMISSION TIME */}

      <TableCell className="whitespace-nowrap text-stone-600">
        {registration.createdAt
          ? new Date(registration.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "—"}
      </TableCell>

      {/* TRIAL SLOT */}

      <TableCell>
        <div className="flex items-center gap-1.5 whitespace-nowrap text-sm text-stone-700">
          <Calendar aria-hidden className="h-3 w-3 text-stone-400" />
          <span className="tabular-nums">{registration.trialDate}</span>
          <span className="text-stone-500">· {registration.trialTime}</span>
        </div>
      </TableCell>

      {/* ENQUIRY REMARK */}

      <TableCell className="min-w-[220px] max-w-[320px]">
        <p
          className="line-clamp-2 whitespace-normal text-sm text-stone-700"
          title={registration.remark || undefined}
        >
          {registration.remark || "—"}
        </p>
      </TableCell>

      {/* REFERRAL SOURCE */}

      <TableCell className="whitespace-nowrap text-stone-700">
        {registration.referralSource || "—"}
      </TableCell>

      {/* LOCATION */}

      <TableCell>
        <div className="flex items-center gap-2">
          <div
            aria-hidden
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              locationType === "online" ? "bg-blue-50" : "bg-orange-50",
            )}
          >
            {locationType === "online" ? (
              <Globe className="h-4 w-4 text-blue-600" />
            ) : (
              <MapPin className="h-4 w-4 text-orange-600" />
            )}
          </div>

          <div className="min-w-0">
            <p
              className="max-w-[180px] truncate font-medium text-stone-700"
              title={displayLocation}
            >
              {displayLocation}
            </p>

            {locationType === "offline" &&
              registration.location &&
              registration.locationName &&
              normalizeLocation(registration.location) !==
                normalizeLocation(registration.locationName) && (
                <p className="max-w-[180px] truncate text-xs text-stone-500">
                  {registration.location}
                </p>
              )}
          </div>
        </div>
      </TableCell>

      {/* VISIT OPTION */}

      <TableCell>
        <span className="whitespace-nowrap text-sm text-stone-700">
          {registration.preferredCenter === "kalyani-nagar"
            ? "Kalyani Nagar HQ trial"
            : registration.preferredCenter === "unable-to-visit-hq"
              ? "Unable to visit HQ"
              : "—"}
        </span>
      </TableCell>

      {/* MODE */}

      <TableCell>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            locationType === "online"
              ? "bg-blue-50 text-blue-700"
              : "bg-orange-50 text-orange-700",
          )}
        >
          {locationType === "online" ? (
            <Globe aria-hidden className="h-3.5 w-3.5" />
          ) : (
            <MapPin aria-hidden className="h-3.5 w-3.5" />
          )}
          {locationType === "online" ? "Online" : "Offline"}
        </div>
      </TableCell>

      {/* TRIAL STATUS */}

      <TableCell>
        <Select
          value={registration.status || "booked"}
          onValueChange={(value) => onStatusChange(id, value)}
        >
          <SelectTrigger
            aria-label={`Trial status for ${registration.studentName}`}
            className={cn(selectTriggerBase, "w-[145px]", status.text)}
          >
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden
                className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
              />
              <SelectValue />
            </div>
          </SelectTrigger>

          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* COUNSELLOR REMARK — column only when at least one visible row
          is "show"; cell content only when THIS row is "show" */}

      {hasShowRows && (
        <TableCell className="min-w-[200px]">
          {isShow && (
            <InlineRemark
              value={registration.counsellorRemark || ""}
              label="Counsellor remark"
              placeholder="Add counsellor remark…"
              emptyLabel="Add counsellor remark"
              onSave={saveCounsellor}
            />
          )}
        </TableCell>
      )}

      {/* LEAD TEMP */}

      <TableCell>
        <Select
          value={registration.leadTemp ?? ""}
          onValueChange={(value) => onLeadTempChange(id, value)}
        >
          <SelectTrigger
            aria-label={`Lead temperature for ${registration.studentName}`}
            className={cn(selectTriggerBase, "w-[115px]", temp.text)}
          >
            <div className="flex items-center gap-1.5">
              <Thermometer aria-hidden className="h-3.5 w-3.5" />
              <SelectValue placeholder="Lead temp" />
            </div>
          </SelectTrigger>

          <SelectContent>
            {LEAD_TEMP_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* NEXT FOLLOW-UP */}

      <TableCell>
        <button
          type="button"
          onClick={() => onFollowUpClick(registration)}
          title={
            followUpTone
              ? `${FOLLOW_UP_LABEL[followUpTone]} — ${registration.nextFollowUpDate}`
              : undefined
          }
          className={cn(
            "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-sm transition-colors",
            FOLLOW_UP_STYLES[followUpTone ?? "none"],
            focusRing,
          )}
        >
          <CalendarClock
            aria-hidden
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              followUpTone === "overdue" || followUpTone === "today"
                ? "text-current"
                : "text-stone-400",
            )}
          />

          {followUpTone && followUpTone !== "upcoming" && (
            <span className="sr-only">{FOLLOW_UP_LABEL[followUpTone]}: </span>
          )}

          <span className="tabular-nums">
            {registration.nextFollowUpDate || "Set follow-up"}
          </span>

          {followUpCount > 0 && (
            <span
              className="ml-1 inline-flex items-center gap-1 rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] text-stone-600 ring-1 ring-stone-200"
              title={`${followUpCount} previous follow-up${followUpCount > 1 ? "s" : ""}`}
            >
              <History aria-hidden className="h-3 w-3" />
              {followUpCount}
              <span className="sr-only"> previous follow-ups</span>
            </span>
          )}
        </button>
      </TableCell>

      {/* LEAD OUTCOME */}

      <TableCell>
        <Select
          value={registration.leadOutcome ?? ""}
          onValueChange={(value) => onLeadOutcomeChange(id, value)}
        >
          <SelectTrigger
            aria-label={`Lead outcome for ${registration.studentName}`}
            className={cn(selectTriggerBase, "w-[125px]", outcome.text)}
          >
            <div className="flex items-center gap-1.5">
              <Flag aria-hidden className="h-3.5 w-3.5" />
              <SelectValue placeholder="Lead outcome" />
            </div>
          </SelectTrigger>

          <SelectContent>
            {LEAD_OUTCOME_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* CLOSE REMARK — column only when at least one visible row is
          "closed"; cell content only when THIS row is "closed" */}

      {hasClosedRows && (
        <TableCell className="min-w-[200px]">
          {isClosed && (
            <InlineRemark
              value={registration.closeRemark || ""}
              label="Close remark"
              placeholder="Reason for closing…"
              emptyLabel="Add close remark"
              onSave={saveClose}
            />
          )}
        </TableCell>
      )}

      {/* ACTIONS */}

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(registration)}
            aria-label={`Edit ${registration.studentName}`}
            title="Edit"
            className={cn(
              "rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-orange-600",
              focusRing,
            )}
          >
            <Pencil aria-hidden className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(registration)}
            aria-label={`Delete ${registration.studentName}`}
            title="Delete"
            className={cn(
              "rounded-md p-1.5 text-stone-500 hover:bg-red-50 hover:text-red-600",
              focusRing,
            )}
          >
            <Trash2 aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export const DesktopRow = memo(DesktopRowImpl);
