"use client";

import React, { useEffect, useRef, useState } from "react";
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
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [tableWidth, setTableWidth] = useState(0);
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);

  useEffect(() => {
    const tableScroller = tableScrollRef.current;

    if (!tableScroller) return;

    const updateScrollWidth = () => {
      setTableWidth(tableScroller.scrollWidth);
      setHasHorizontalOverflow(
        tableScroller.scrollWidth > tableScroller.clientWidth,
      );
    };

    updateScrollWidth();

    const resizeObserver = new ResizeObserver(updateScrollWidth);
    resizeObserver.observe(tableScroller);

    return () => resizeObserver.disconnect();
  }, [registrations, hasShowRows, hasClosedRows]);

  const syncTopScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const syncTableScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  return (
    <div className="hidden w-[85%] md:block">
      {hasHorizontalOverflow && (
        <div
          ref={topScrollRef}
          onScroll={syncTopScroll}
          className="sticky top-0 z-20 mb-2 overflow-x-auto rounded-md border border-stone-200 bg-white shadow-sm"
          aria-label="Scroll table columns horizontally"
        >
          <div style={{ width: tableWidth, height: 12 }} />
        </div>
      )}

      <div
        ref={tableScrollRef}
        onScroll={syncTableScroll}
        className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Table className="text-xs [&_th]:h-8 [&_th]:px-1.5 [&_th]:text-xs [&_td]:px-1.5 [&_td]:py-1.5 [&_td]:text-xs [&_td_*]:text-xs">
        <TableHeader className="bg-stone-50">
          <TableRow className="border-stone-200 hover:bg-white">
            <SortableHead
              label="Student"
              field="studentName"
              active={sortField}
              dir={sortDir}
              onClick={onToggleSort}
            />

            <TableHead className="text-stone-500">Contact</TableHead>

            <SortableHead
              label="Trial Slot"
              field="trialDate"
              active={sortField}
              dir={sortDir}
              onClick={onToggleSort}
            />

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

            <TableHead className="text-right text-stone-500">Actions</TableHead>
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
