"use client";

import React, { useEffect, useRef, useState } from "react";
import { Eye, Megaphone, X } from "lucide-react";
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
  trainerView: boolean;
  marketingView: boolean;
  showContact: boolean;
  canAddTrialSlot: boolean;
  openTimelineId: string | null;
  onTimelineToggle: (id: string) => void;
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
  onAddTrialSlot: (registration: TrialRegistration) => void;
  onSendTrialMeetingEmail: (id: string) => Promise<boolean>;
  onEdit: (registration: TrialRegistration) => void;
  onDelete: (registration: TrialRegistration) => void;
};

/* Shared header cell style: small caps-style label, consistent rhythm */
const TH =
  "whitespace-nowrap bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500";

/* Sticky first column: opaque bg + right divider so scrolled content doesn't bleed through */
const STICKY_TH =
  "sticky left-0 z-30 w-[300px] min-w-[300px] max-w-[300px] bg-stone-50 shadow-[1px_0_0_0_theme(colors.stone.200)]";
const NUMBER_TH = `${TH} w-12 min-w-12 text-center`;
const COLUMN_VISIBILITY_STORAGE_KEY = "trial-registrations-hidden-columns";
const TRAINER_COLUMN_VISIBILITY_STORAGE_KEY = "trial-registrations-trainer-hidden-columns";

export function DesktopTable({
  registrations,
  hasShowRows,
  hasClosedRows,
  canModify,
  trainerView,
  marketingView,
  showContact,  
  canAddTrialSlot,
  openTimelineId,
  onTimelineToggle,
  canDelete,
  sortField,
  sortDir,
  onToggleSort,
  ...rowHandlers
}: Props) {
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const columnsMenuRef = useRef<HTMLDetailsElement>(null);
  const pendingSyncRef = useRef<{
    target: "top" | "table";
    scrollLeft: number;
  } | null>(null);
  const [tableWidth, setTableWidth] = useState(1500);
  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>({});
  const columnsHydratedRef = useRef(false);
  const columnVisibilityStorageKey = trainerView
    ? TRAINER_COLUMN_VISIBILITY_STORAGE_KEY
    : COLUMN_VISIBILITY_STORAGE_KEY;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(columnVisibilityStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        setHiddenColumns(
          Object.fromEntries(
            Object.entries(parsed).filter(([, isHidden]) => isHidden === true),
          ) as Record<string, boolean>,
        );
      } else {
        setHiddenColumns({});
      }
    } catch (error) {
      console.warn("Unable to restore trial table column choices:", error);
    }
  }, [columnVisibilityStorageKey]);

  useEffect(() => {
    if (!columnsHydratedRef.current) {
      columnsHydratedRef.current = true;
      return;
    }

    try {
      window.localStorage.setItem(
        columnVisibilityStorageKey,
        JSON.stringify(hiddenColumns),
      );
    } catch (error) {
      console.warn("Unable to save trial table column choices:", error);
    }
  }, [hiddenColumns, columnVisibilityStorageKey]);

  const columns = [
        "number",
        "student",
        ...(showContact ? ["contact"] : []),
        "program",
        "trialSlot",
        "enquiryRemark",
        "referralSource",
        "location",
        "visitOption",
        "mode",
        "trialStatus",
        ...(hasShowRows ? ["counsellorRemark"] : []),
        "leadTemp",
        "nextFollowUp",
        "leadOutcome",
        ...(hasClosedRows ? ["closeRemark"] : []),
        ...(!trainerView && !marketingView && (canModify || canDelete) ? ["actions"] : []),
      ];
  const columnLabels: Record<string, string> = {
    contact: "Contact",
    program: "Program of interest",
    trialSlot: "Trial Slot",
    enquiryRemark: "Enquiry Remark",
    referralSource: "Heard About Us",
    location: "Location",
    visitOption: "Visit Option",
    mode: "Mode",
    trialStatus: "Trial Status",
    counsellorRemark: "Counsellor Remark",
    leadTemp: "Lead Temp",
    nextFollowUp: "Next Follow-up",
    leadOutcome: "Lead Outcome",
    closeRemark: "Close Remark",
  };
  const fixedColumns = new Set(["number", "student", "actions"]);
  const visibleColumnCount = columns.filter((column) => !hiddenColumns[column]).length;
  const hiddenColumnStyles = columns
    .map((column, index) =>
      hiddenColumns[column]
        ? `.trial-registrations-table > thead > tr > :nth-child(${index + 1}), .trial-registrations-table > tbody > tr:not(.timeline-row) > :nth-child(${index + 1}) { display: none !important; }`
        : "",
    )
    .join("\n");

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const updateWidth = () => setTableWidth(table.scrollWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(table);
    return () => observer.disconnect();
  }, [registrations.length, hasShowRows, hasClosedRows, hiddenColumns]);

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
      <details ref={columnsMenuRef} className="relative mb-2 flex justify-end">
          <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-xs font-medium text-stone-600 shadow-sm hover:border-stone-300 hover:text-red-700">
            <Eye aria-hidden className="h-4 w-4" />
            Columns
          </summary>
          <div className="absolute right-0 top-10 z-40 max-h-80 w-60 overflow-y-auto rounded-xl border border-stone-200 bg-white p-2 shadow-xl">
            <div className="mb-1 flex items-center justify-between border-b border-stone-100 px-2 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">Show columns</span>
              <button
                type="button"
                onClick={() => {
                  if (columnsMenuRef.current) columnsMenuRef.current.open = false;
                }}
                aria-label="Close columns menu"
                className="rounded-md p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </div>
            {columns.filter((column) => !fixedColumns.has(column)).map((column) => (
              <label key={column} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-stone-700 hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={!hiddenColumns[column]}
                  onChange={() => setHiddenColumns((current) => ({ ...current, [column]: !current[column] }))}
                  className="accent-red-700"
                />
                {columnLabels[column] || column}
              </label>
            ))}
          </div>
      </details>
      {hiddenColumnStyles && <style>{hiddenColumnStyles}</style>}
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
            className={`trial-registrations-table ${trainerView ? "min-w-[780px]" : marketingView ? "min-w-[1050px]" : "min-w-[1380px]"} text-sm [&_td]:px-3 [&_td]:py-3 [&_td]:align-middle [&_td]:text-sm [&_td_*]:text-sm [&_th]:h-11 [&_th]:px-3 [&_tbody_tr]:border-stone-100 [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-stone-50/80`}
          >
            <TableHeader className="bg-stone-50 [&_tr]:border-b [&_tr]:border-stone-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className={NUMBER_TH}>#</TableHead>
                <>
                    <SortableHead
                      label="Student"
                      field="studentName"
                      active={sortField}
                      dir={sortDir}
                      onClick={onToggleSort}
                      className={STICKY_TH}
                    />

                    {showContact && (
                  <TableHead className={`${TH} w-[300px] min-w-[300px] max-w-[300px]`}>
                    Contact
                  </TableHead>
                    )}

                    <TableHead className={TH}>Program of interest</TableHead>

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

                    {!trainerView && !marketingView && (canModify || canDelete) && (
                      <TableHead className={`${TH} text-right`}>Actions</TableHead>
                    )}
                </>
              </TableRow>
            </TableHeader>

            <TableBody>
              {registrations.map((registration, index) => (
                <DesktopRow
                  key={registration.id}
                  registration={registration}
                  rowNumber={index + 1}
                  hasShowRows={hasShowRows}
                  hasClosedRows={hasClosedRows}
                  canModify={canModify}
                  trainerView={trainerView}
                  marketingView={marketingView}
                  showContact={showContact}
                  canAddTrialSlot={canAddTrialSlot}
                  openTimelineId={openTimelineId}
                  onTimelineToggle={onTimelineToggle}
                  canDelete={canDelete}
                  visibleColumnCount={visibleColumnCount}
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
