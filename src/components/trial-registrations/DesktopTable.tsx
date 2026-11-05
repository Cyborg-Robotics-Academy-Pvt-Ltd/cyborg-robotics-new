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
  canModify: boolean;
  canDelete: boolean;
  sortField: SortField;
  sortDir: SortDir;
  onToggleSort: (field: SortField) => void;
  onStatusChange: (id: string, status: string) => void;
  onSalesSelectedCenterChange: (id: string, center: string | null) => void;
  onLeadTempChange: (id: string, value: string) => void;
  onLeadOutcomeChange: (id: string, value: string) => void;
  onCounsellorRemarkSave: (id: string, value: string) => void;
  onCloseRemarkSave: (id: string, value: string) => void;
  onFollowUpClick: (registration: TrialRegistration) => void;
  onEdit: (registration: TrialRegistration) => void;
  onDelete: (registration: TrialRegistration) => void;
};

/* Shared header cell style: small caps-style label, consistent rhythm */
const TH =
  "whitespace-nowrap bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500";

/* Sticky first column: opaque bg + right divider so scrolled content doesn't bleed through */
const STICKY_TH =
  "sticky left-0 z-30 w-[300px] min-w-[300px] max-w-[300px] bg-stone-50 shadow-[1px_0_0_0_theme(colors.stone.200)]";

export function DesktopTable({
  registrations,
  hasShowRows,
  hasClosedRows,
  canModify,
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
      <div className="max-h-[70vh] overflow-y-auto overscroll-contain rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_16px_-4px_rgba(0,0,0,0.06)]">
        {/* Top mirrored scrollbar */}
        <div
          ref={topScrollRef}
          onScroll={() => syncScroll("top")}
          role="region"
          aria-label="Scroll table horizontally"
          tabIndex={0}
          className="sticky top-0 z-30 h-5 overflow-x-auto overflow-y-hidden border-b border-red-100 bg-red-50/90 backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#A81B1E]/40 [scrollbar-color:#A81B1E_#FEE2E2] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#A81B1E] [&::-webkit-scrollbar-thumb:hover]:bg-[#861619] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-red-100"
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
            className="min-w-[1500px] text-sm [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td]:text-sm [&_td_*]:text-sm [&_th]:h-11 [&_th]:px-3 [&_tbody_tr]:border-stone-100 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-stone-50/80"
          >
            <TableHeader className="bg-stone-50 [&_tr]:border-b [&_tr]:border-stone-200">
              <TableRow className="hover:bg-transparent">
                <SortableHead
                  label="Student"
                  field="studentName"
                  active={sortField}
                  dir={sortDir}
                  onClick={onToggleSort}
                  className={STICKY_TH}
                />

                <TableHead className={`${TH} w-[300px] min-w-[300px] max-w-[300px]`}>
                  Contact
                </TableHead>

                <TableHead className={TH}>Program of interest</TableHead>

                <SortableHead
                  label="Enquired On"
                  field="createdAt"
                  active={sortField}
                  dir={sortDir}
                  onClick={onToggleSort}
                  className={TH}
                />

                <SortableHead
                  label="Trial Slot"
                  field="trialDate"
                  active={sortField}
                  dir={sortDir}
                  onClick={onToggleSort}
                  className={TH}
                />

                <TableHead className={TH}>Enquiry Remark</TableHead>
                <TableHead
                  className={`${TH} w-10 min-w-10 max-w-10 px-2 text-center`}
                  aria-label="Heard About Us"
                  title="Heard About Us"
                >
                  <Megaphone aria-hidden className="mx-auto h-4 w-4" />
                </TableHead>
                <TableHead className={TH}>Location</TableHead>
                <TableHead className={TH}>Visit Option</TableHead>
                <TableHead className={TH}>Mode</TableHead>
                <TableHead className={TH}>Trial Status</TableHead>

                {hasShowRows && (
                  <TableHead className={TH}>Counsellor Remark</TableHead>
                )}

                <TableHead className={TH}>Lead Temp</TableHead>
                <TableHead className={TH}>Next Follow-up</TableHead>
                <TableHead className={TH}>Lead Outcome</TableHead>

                {hasClosedRows && (
                  <TableHead className={TH}>Close Remark</TableHead>
                )}

                {(canModify || canDelete) && (
                  <TableHead className={`${TH} text-right`}>Actions</TableHead>
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
                  canModify={canModify}
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