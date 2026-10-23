"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { SortableHead } from "./SortableHead";
import { DesktopRow } from "./DesktopRow";
import {
  SortDir,
  SortField,
  TrialRegistration,
} from "@/app/enquire-form/types";

type Props = {
  registrations: TrialRegistration[];
  hasShowRows: boolean;
  hasClosedRows: boolean;
  sortField: SortField;
  sortDir: SortDir;
  onToggleSort: (field: SortField) => void;
  onStatusChange: (id: string, status: string) => void;
  onLeadTempChange: (id: string, value: string) => void;
  onLeadOutcomeChange: (id: string, value: string) => void;
  onCounsellorRemarkSave: (id: string, value: string) => void;
  onCloseRemarkSave: (id: string, value: string) => void;
  onFollowUpClick: (registration: TrialRegistration) => void;
  onEdit: (registration: TrialRegistration) => void;
  onDelete: (registration: TrialRegistration) => void;
};

export function DesktopTable({
  registrations,
  hasShowRows,
  hasClosedRows,
  sortField,
  sortDir,
  onToggleSort,
  ...rowHandlers
}: Props) {
  return (
    <div className="hidden w-full md:block">
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <Table
          containerClassName="!overflow-visible"
          className="min-w-[1500px] text-sm [&_th]:h-10 [&_th]:px-3 [&_th]:text-sm [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm [&_td_*]:text-sm"
        >
          <TableHeader className="bg-stone-50">
            <TableRow className="border-stone-200 hover:bg-white">
              <SortableHead
                label="Student"
                field="studentName"
                active={sortField}
                dir={sortDir}
                onClick={onToggleSort}
                className="sticky left-0 z-30 w-[230px] min-w-[300px] max-w-[300px] bg-stone-50"
              />

              <TableHead className="sticky left-[300px] z-30 w-[300px] min-w-[300px] max-w-[300px] bg-stone-50 text-stone-500">
                Contact
              </TableHead>

              <SortableHead
                label="Enquired On"
                field="createdAt"
                active={sortField}
                dir={sortDir}
                onClick={onToggleSort}
              />

              <SortableHead
                label="Trial Slot"
                field="trialDate"
                active={sortField}
                dir={sortDir}
                onClick={onToggleSort}
              />

              <TableHead className="text-stone-500">Enquiry Remark</TableHead>
              <TableHead className="text-stone-500">Heard About Us</TableHead>
              <TableHead className="text-stone-500">Location</TableHead>
              <TableHead className="text-stone-500">Visit Option</TableHead>
              <TableHead className="text-stone-500">Mode</TableHead>
              <TableHead className="text-stone-500">Trial Status</TableHead>

              {hasShowRows && (
                <TableHead className="text-stone-500">
                  Counsellor Remark
                </TableHead>
              )}

              <TableHead className="text-stone-500">Lead Temp</TableHead>
              <TableHead className="text-stone-500">Next Follow-up</TableHead>
              <TableHead className="text-stone-500">Lead Outcome</TableHead>

              {hasClosedRows && (
                <TableHead className="text-stone-500">Close Remark</TableHead>
              )}

              <TableHead className="text-right text-stone-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {registrations.map((registration) => (
              <DesktopRow
                key={registration.id}
                registration={registration}
                hasShowRows={hasShowRows}
                hasClosedRows={hasClosedRows}
                {...rowHandlers}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
