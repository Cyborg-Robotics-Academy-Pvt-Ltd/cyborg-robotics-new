"use client";

import React, { useState } from "react";
import {
  Calendar,
  CalendarClock,
  Check,
  Flag,
  Globe,
  History,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Thermometer,
  Trash2,
  X,
} from "lucide-react";

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
  getLocationType,
  initials,
  leadOutcomeStyle,
  leadTempStyle,
  statusStyle,
} from "@/app/enquire-form/utils";
import { TrialRegistration } from "@/app/enquire-form/types";

type Props = {
  registration: TrialRegistration;
  onStatusChange: (id: string, status: string) => void;
  onLeadTempChange: (id: string, value: string) => void;
  onLeadOutcomeChange: (id: string, value: string) => void;
  onCounsellorRemarkSave: (id: string, value: string) => void;
  onCloseRemarkSave: (id: string, value: string) => void;
  onFollowUpClick: (registration: TrialRegistration) => void;
  onEdit: (registration: TrialRegistration) => void;
  onDelete: (registration: TrialRegistration) => void;
};

export function MobileCard({
  registration,
  onStatusChange,
  onLeadTempChange,
  onLeadOutcomeChange,
  onCounsellorRemarkSave,
  onCloseRemarkSave,
  onFollowUpClick,
  onEdit,
  onDelete,
}: Props) {
  const [editingCounsellor, setEditingCounsellor] = useState(false);
  const [counsellorValue, setCounsellorValue] = useState(
    registration.counsellorRemark || "",
  );

  const [editingClose, setEditingClose] = useState(false);
  const [closeValue, setCloseValue] = useState(registration.closeRemark || "");

  const status = statusStyle(registration.status || "booked");
  const temp = leadTempStyle(registration.leadTemp);
  const outcome = leadOutcomeStyle(registration.leadOutcome);

  const locationType = getLocationType(registration);
  const displayLocation = getDisplayLocation(registration);

  const isShow = registration.status === "show";
  const isClosed = registration.leadOutcome === "closed";

  const saveCounsellor = () => {
    onCounsellorRemarkSave(registration.id, counsellorValue);
    setEditingCounsellor(false);
  };

  const cancelCounsellor = () => {
    setEditingCounsellor(false);
    setCounsellorValue(registration.counsellorRemark || "");
  };

  const saveClose = () => {
    onCloseRemarkSave(registration.id, closeValue);
    setEditingClose(false);
  };

  const cancelClose = () => {
    setEditingClose(false);
    setCloseValue(registration.closeRemark || "");
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white",
              avatarShade(registration.studentName),
            )}
          >
            {initials(registration.studentName)}
          </div>

          <div>
            <p className="font-medium text-stone-900">
              {registration.studentName}
            </p>
            <p className="text-xs text-stone-400">Age {registration.age}</p>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(registration)}
            className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-orange-600"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(registration)}
            className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* TRIAL STATUS */}

      <div className="mt-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
          Trial Status
        </p>

        <Select
          value={registration.status || "booked"}
          onValueChange={(value) => onStatusChange(registration.id, value)}
        >
          <SelectTrigger
            className={cn(
              "h-9 w-full border-stone-200 bg-stone-50",
              status.text,
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", status.dot)} />
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
      </div>

      {/* COUNSELLOR REMARK — only when status === show */}

      {isShow && (
        <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
          {editingCounsellor ? (
            <div className="space-y-2">
              <Input
                autoFocus
                value={counsellorValue}
                onChange={(event) => setCounsellorValue(event.target.value)}
                placeholder="Add counsellor remark..."
                className="bg-white"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelCounsellor}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveCounsellor}
                  className="inline-flex items-center gap-1 rounded-md bg-orange-600 px-3 py-1.5 text-xs text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingCounsellor(true)}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <div className="flex gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                    Counsellor Remark
                  </p>

                  <p
                    className={cn(
                      "mt-1 text-sm",
                      registration.counsellorRemark
                        ? "text-stone-700"
                        : "italic text-stone-400",
                    )}
                  >
                    {registration.counsellorRemark || "Click to add remark"}
                  </p>
                </div>
              </div>

              <Pencil className="h-4 w-4 shrink-0 text-stone-300" />
            </button>
          )}
        </div>
      )}

      {/* LEAD TEMP + LEAD OUTCOME */}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Lead Temp
          </p>

          <Select
            value={registration.leadTemp}
            onValueChange={(value) => onLeadTempChange(registration.id, value)}
          >
            <SelectTrigger
              className={cn(
                "h-9 w-full border-stone-200 bg-stone-50",
                temp.text,
              )}
            >
              <div className="flex items-center gap-1.5">
                <Thermometer className="h-3.5 w-3.5" />
                <SelectValue placeholder="Lead Temp" />
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
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
            Lead Outcome
          </p>

          <Select
            value={registration.leadOutcome}
            onValueChange={(value) =>
              onLeadOutcomeChange(registration.id, value)
            }
          >
            <SelectTrigger
              className={cn(
                "h-9 w-full border-stone-200 bg-stone-50",
                outcome.text,
              )}
            >
              <div className="flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5" />
                <SelectValue placeholder="Lead Outcome" />
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
        </div>
      </div>

      {/* CLOSE REMARK — only when leadOutcome === closed */}

      {isClosed && (
        <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
          {editingClose ? (
            <div className="space-y-2">
              <Input
                autoFocus
                value={closeValue}
                onChange={(event) => setCloseValue(event.target.value)}
                placeholder="Reason for closing..."
                className="bg-white"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelClose}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveClose}
                  className="inline-flex items-center gap-1 rounded-md bg-orange-600 px-3 py-1.5 text-xs text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingClose(true)}
              className="flex w-full items-start justify-between gap-3 text-left"
            >
              <div className="flex gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                    Close Remark
                  </p>

                  <p
                    className={cn(
                      "mt-1 text-sm",
                      registration.closeRemark
                        ? "text-stone-700"
                        : "italic text-stone-400",
                    )}
                  >
                    {registration.closeRemark || "Click to add remark"}
                  </p>
                </div>
              </div>

              <Pencil className="h-4 w-4 shrink-0 text-stone-300" />
            </button>
          )}
        </div>
      )}

      {/* DETAILS */}

      <div className="mt-4 space-y-2 text-sm text-stone-500">
        <a
          href={`mailto:${registration.email}`}
          className="flex items-center gap-2 hover:text-orange-600"
        >
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate">{registration.email}</span>
        </a>

        <a
          href={`tel:${registration.contactNumber}`}
          className="flex items-center gap-2 hover:text-orange-600"
        >
          <Phone className="h-4 w-4 shrink-0" />
          {registration.contactNumber}
        </a>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 shrink-0" />
          {registration.trialDate} · {registration.trialTime}
        </div>

        {/* LOCATION */}

        <div className="flex items-center gap-2">
          {locationType === "online" ? (
            <Globe className="h-4 w-4 shrink-0 text-blue-500" />
          ) : (
            <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
          )}

          <div>
            <span className="font-medium text-stone-700">
              {displayLocation}
            </span>
            <span className="ml-2 text-xs capitalize text-stone-400">
              ({locationType})
            </span>
          </div>
        </div>

        {/* NEXT FOLLOW-UP */}

        <button
          type="button"
          onClick={() => onFollowUpClick(registration)}
          className="flex items-center gap-2 hover:text-orange-600"
        >
          <CalendarClock className="h-4 w-4 shrink-0" />

          <span className="tabular-nums">
            {registration.nextFollowUpDate || "Set follow-up"}
          </span>

          {registration.followUpHistory?.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
              <History className="h-3 w-3" />
              {registration.followUpHistory.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
