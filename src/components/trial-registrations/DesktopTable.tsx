"use client";

import React, { useEffect, useRef, useState } from "react";
import { Megaphone } from "lucide-react";
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
  canDelete: boolean;
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
  canDelete,
  sortField,
  sortDir,
  onToggleSort,
  ...rowHandlers
}: Props) {
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const pendingSyncRef = useRef<{
    target: "top" | "table";
    scrollLeft: number;
  } | null>(null);
  const [tableWidth, setTableWidth] = useState(1500);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const updateWidth = () => setTableWidth(table.scrollWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(table);
    return () => observer.disconnect();
  }, [registrations.length, hasShowRows, hasClosedRows]);

  const syncScroll = (source: "top" | "table") => {
    const top = topScrollRef.current;
    const table = tableScrollRef.current;
    if (!top || !table) return;

    const pendingSync = pendingSyncRef.current;
    const sourceElement = source === "top" ? top : table;
    if (
      pendingSync?.target === source &&
      Math.abs(sourceElement.scrollLeft - pendingSync.scrollLeft) <= 1
    ) {
      pendingSyncRef.current = null;
      return;
    }

    const targetElement = source === "top" ? table : top;
    const sourceMax = sourceElement.scrollWidth - sourceElement.clientWidth;
    const targetMax = targetElement.scrollWidth - targetElement.clientWidth;
    if (sourceMax <= 0 || targetMax <= 0) return;

    const targetScrollLeft =
      (sourceElement.scrollLeft / sourceMax) * targetMax;
    if (Math.abs(targetElement.scrollLeft - targetScrollLeft) > 1) {
      pendingSyncRef.current = {
        target: source === "top" ? "table" : "top",
        scrollLeft: targetScrollLeft,
      };
      targetElement.scrollLeft = targetScrollLeft;
    }
  };

  return (
    <div className="hidden w-full md:block">
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div
          ref={topScrollRef}
          onScroll={() => syncScroll("top")}
          role="region"
          aria-label="Scroll table horizontally"
          className="h-4 overflow-x-auto overflow-y-hidden border-b border-stone-200 bg-stone-50"
        >
          <div style={{ width: tableWidth, height: 1 }} />
        </div>
        <div
          ref={tableScrollRef}
          onScroll={() => syncScroll("table")}
          className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Table
            ref={tableRef}
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

                <TableHead className="w-[300px] min-w-[300px] max-w-[300px] bg-stone-50 text-stone-500">
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
                <TableHead
                  className="w-10 min-w-10 max-w-10 px-2 text-center text-stone-500"
                  aria-label="Heard About Us"
                  title="Heard About Us"
                >
                  <Megaphone aria-hidden className="mx-auto h-4 w-4" />
                </TableHead>
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

                {canDelete && (
                  <TableHead className="text-right text-stone-500">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {registrations.map((registration) => (
                <DesktopRow
                  key={registration.id}
                  registration={registration}
                  hasShowRows={hasShowRows}
                  hasClosedRows={hasClosedRows}
                  canDelete={canDelete}
                  {...rowHandlers}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
