"use client";

import React, { useState } from "react";
import {
  Calendar,
  CalendarClock,
  Flag,
  Globe,
  History,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Thermometer,
  Trash2,
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

export function DesktopRow({
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

  const saveClose = () => {
    onCloseRemarkSave(registration.id, closeValue);
    setEditingClose(false);
  };

  return (
    <TableRow className="border-stone-100 transition-colors hover:bg-orange-50/40">
      {/* STUDENT */}

      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white shadow-sm",
              avatarShade(registration.studentName),
            )}
          >
            {initials(registration.studentName)}
          </div>

          <div>
            <p className="font-medium text-stone-900">
              {registration.studentName}
            </p>
            <p className="mt-0.5 text-xs text-stone-400">
              Age {registration.age}
            </p>
          </div>
        </div>
      </TableCell>

      {/* CONTACT */}

      <TableCell>
        <div className="flex flex-col gap-1 text-sm">
          <a
            href={`mailto:${registration.email}`}
            className="flex items-center gap-1.5 text-stone-500 hover:text-orange-600"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="max-w-[180px] truncate">{registration.email}</span>
          </a>

          <a
            href={`tel:${registration.contactNumber}`}
            className="flex items-center gap-1.5 text-stone-500 hover:text-orange-600"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {registration.contactNumber}
          </a>
        </div>
      </TableCell>

      {/* TRIAL SLOT */}

      <TableCell>
        <div className="flex whitespace-nowrap items-center gap-1.5 text-sm text-stone-700">
          <Calendar className="h-3 w-3 text-stone-400" />
          <span className="tabular-nums text-sm">{registration.trialDate}</span>
          <span className="text-stone-400">· {registration.trialTime}</span>
        </div>
      </TableCell>

      {/* LOCATION */}

      <TableCell>
        <div className="flex items-center gap-2">
          <div
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
            <p className="max-w-[180px] font-medium text-stone-700">
              {displayLocation}
            </p>

            {locationType === "offline" &&
              registration.location &&
              registration.locationName &&
              normalizeLocation(registration.location) !==
                normalizeLocation(registration.locationName) && (
                <p className="text-xs text-stone-400">
                  {registration.location}
                </p>
              )}
          </div>
        </div>
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
            <Globe className="h-3.5 w-3.5" />
          ) : (
            <MapPin className="h-3.5 w-3.5" />
          )}
          {locationType === "online" ? "Online" : "Offline"}
        </div>
      </TableCell>

      {/* TRIAL STATUS */}

      <TableCell>
        <Select
          value={registration.status || "booked"}
          onValueChange={(value) => onStatusChange(registration.id, value)}
        >
          <SelectTrigger
            className={cn(
              "h-8 w-[145px] border-0 bg-white px-2 shadow-none focus:ring-0",
              status.text,
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
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
          {!isShow ? null : editingCounsellor ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={counsellorValue}
                onChange={(event) => setCounsellorValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveCounsellor();
                  if (event.key === "Escape") {
                    setEditingCounsellor(false);
                    setCounsellorValue(registration.counsellorRemark || "");
                  }
                }}
                placeholder="Add counsellor remark..."
                className="h-8 text-sm"
              />

              <button
                type="button"
                onClick={saveCounsellor}
                className="text-xs font-medium text-orange-600"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingCounsellor(true)}
              className="max-w-[220px] truncate text-left text-sm text-stone-500 hover:text-orange-600"
            >
              {registration.counsellorRemark || "Add counsellor remark"}
            </button>
          )}
        </TableCell>
      )}

      {/* LEAD TEMP */}

      <TableCell>
        <Select
          value={registration.leadTemp}
          onValueChange={(value) => onLeadTempChange(registration.id, value)}
        >
          <SelectTrigger
            className={cn(
              "h-8 w-[115px] border-0 bg-white px-2 shadow-none focus:ring-0",
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
      </TableCell>

      {/* NEXT FOLLOW-UP */}

      <TableCell>
        <button
          type="button"
          onClick={() => onFollowUpClick(registration)}
          className="flex items-center whitespace-nowrap gap-1.5 rounded-md px-2 py-1 text-sm text-stone-600 hover:bg-stone-100 hover:text-orange-600"
        >
          <CalendarClock className="h-3.5 w-3.5 shrink-0 text-stone-400" />

          <span className="tabular-nums">
            {registration.nextFollowUpDate || "Set follow-up"}
          </span>

          {registration.followUpHistory?.length > 0 && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
              <History className="h-3 w-3" />
              {registration.followUpHistory.length}
            </span>
          )}
        </button>
      </TableCell>

      {/* LEAD OUTCOME */}

      <TableCell>
        <Select
          value={registration.leadOutcome}
          onValueChange={(value) => onLeadOutcomeChange(registration.id, value)}
        >
          <SelectTrigger
            className={cn(
              "h-8 w-[125px] border-0 bg-white px-2 shadow-none focus:ring-0",
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
      </TableCell>

      {/* CLOSE REMARK — column only when at least one visible row is
          "closed"; cell content only when THIS row is "closed" */}

      {hasClosedRows && (
        <TableCell className="min-w-[200px]">
          {!isClosed ? null : editingClose ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={closeValue}
                onChange={(event) => setCloseValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveClose();
                  if (event.key === "Escape") {
                    setEditingClose(false);
                    setCloseValue(registration.closeRemark || "");
                  }
                }}
                placeholder="Reason for closing..."
                className="h-8 text-sm"
              />

              <button
                type="button"
                onClick={saveClose}
                className="text-xs font-medium text-orange-600"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingClose(true)}
              className="max-w-[220px] truncate text-left text-sm text-stone-500 hover:text-orange-600"
            >
              {registration.closeRemark || "Add close remark"}
            </button>
          )}
        </TableCell>
      )}

      {/* ACTIONS */}

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
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
      </TableCell>
    </TableRow>
  );
}
