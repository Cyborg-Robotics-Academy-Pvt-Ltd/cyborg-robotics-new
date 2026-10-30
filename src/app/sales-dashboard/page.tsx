"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ChevronDown,
  Clock3,
  Download,
  FilePlus2,
  Flame,
  LoaderCircle,
  MessageSquareText,
  Phone,
  Search,
  Users,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useTrialRegistrations } from "@/components/hooks/useTrialRegistrations";
import type { TrialRegistration } from "@/app/enquire-form/types";
import { StudentTimelineStrip } from "@/components/trial-registrations/StudentTimelineStrip";

const TRIAL_STATUSES = [
  { value: "booked", label: "Booked" },
  { value: "show", label: "Attended" },
  { value: "no-show", label: "No show" },
  { value: "reschedule", label: "Reschedule" },
  { value: "cancelled", label: "Cancelled" },
];

/* ---------- Types ---------- */

type QueueTab = "new" | "due" | "all";
type SortKey = "default" | "newest" | "hot" | "followup";

const QUEUE_TABS: { id: QueueTab; label: string }[] = [
  { id: "new", label: "New" },
  { id: "due", label: "Follow-ups due" },
  { id: "all", label: "All leads" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Default order" },
  { value: "newest", label: "Newest first" },
  { value: "hot", label: "Hot leads first" },
  { value: "followup", label: "Follow-up date" },
];

const QUEUE_EMPTY_TEXT: Record<QueueTab, string> = {
  new: "You’re all caught up. New enquiries will appear here.",
  due: "No follow-ups are due right now.",
  all: "No enquiries yet.",
};

const PAGE_SIZES = [10, 25, 50];
const TRIALS_PER_PAGE = 5;

/* ---------- Presentation constants ---------- */
/* Brand: red #A81B1E (primary), neutrals for structure, amber/emerald/orange for status only */

const HEADING_STYLE = {
  fontFamily: "Syne, ui-sans-serif, system-ui, sans-serif",
} as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A81B1E] focus-visible:ring-offset-2";

const FIELD =
  "rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-[#A81B1E] focus:ring-2 focus:ring-[#A81B1E]/20";

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  booked: {
    pill: "bg-[#A81B1E]/10 text-[#A81B1E] ring-[#A81B1E]/25",
    dot: "bg-[#A81B1E]",
  },
  show: {
    pill: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  "no-show": {
    pill: "bg-slate-800/10 text-slate-900 ring-slate-400",
    dot: "bg-slate-800",
  },
  reschedule: {
    pill: "bg-amber-50 text-amber-900 ring-amber-200",
    dot: "bg-amber-500",
  },
  cancelled: {
    pill: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
  },
};

const STAGE_STYLES: Record<string, { bar: string; dot: string }> = {
  New: { bar: "bg-[#A81B1E]", dot: "bg-[#A81B1E]" },
  Contacted: { bar: "bg-slate-500", dot: "bg-slate-500" },
  "Trial booked": { bar: "bg-amber-500", dot: "bg-amber-500" },
  Enrolled: { bar: "bg-emerald-500", dot: "bg-emerald-500" },
  Lost: { bar: "bg-slate-400", dot: "bg-slate-400" },
};

const METRIC_COLORS = {
  red: { chip: "bg-[#A81B1E]/10 text-[#A81B1E]", accent: "bg-[#A81B1E]" },
  amber: { chip: "bg-amber-50 text-amber-700", accent: "bg-amber-500" },
  slate: { chip: "bg-slate-100 text-slate-700", accent: "bg-slate-700" },
  green: { chip: "bg-emerald-50 text-emerald-700", accent: "bg-emerald-500" },
} as const;

/* ---------- Helpers ---------- */

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
}

function formatDate(value: string) {
  if (!value) return "Date not set";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(parsed);
}

function getDateParts(value: string) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    day: new Intl.DateTimeFormat("en-IN", { day: "numeric" }).format(parsed),
    month: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(parsed),
  };
}

function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function getPipelineStage(registration: TrialRegistration) {
  if (registration.leadOutcome === "closed") return "Enrolled";
  if (["no-show", "cancelled"].includes(registration.status)) return "Lost";
  if (["booked", "reschedule"].includes(registration.status))
    return "Trial booked";
  if (registration.followUpHistory.length || registration.remark.trim())
    return "Contacted";
  return "New";
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?"
  );
}

/** Normalises Indian numbers for wa.me; returns "" when the number looks unusable. */
function toWhatsAppNumber(raw: string) {
  const digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0"))
    return `91${digits.slice(1)}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return "";
}

function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  // Neutralise spreadsheet formula injection, but keep phone-like values intact.
  const looksNumeric = /^[+-]?[\d\s()-]+$/.test(text);
  if (/^[=@\t\r]/.test(text) || (/^[+-]/.test(text) && !looksNumeric))
    text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function exportLeadsCsv(rows: TrialRegistration[], filename: string) {
  const header = [
    "Student",
    "Phone",
    "Status",
    "Lead temperature",
    "Next follow-up",
    "Trial date",
    "Trial time",
    "Created",
  ];
  const lines = rows.map((row) => {
    const created = Number.isFinite(row.createdAt)
      ? new Date(row.createdAt).toISOString().slice(0, 10)
      : "";
    return [
      row.studentName,
      row.contactNumber,
      row.status,
      row.leadTemp,
      row.nextFollowUpDate,
      row.trialDate,
      row.trialTime,
      created,
    ]
      .map(csvCell)
      .join(",");
  });
  const blob = new Blob(
    [`\uFEFF${[header.map(csvCell).join(","), ...lines].join("\r\n")}`],
    {
      type: "text/csv;charset=utf-8",
    },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function getPageItems(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < totalPages - 1) items.push("…");
  items.push(totalPages);
  return items;
}

/* ---------- Page ---------- */

export default function SalesDashboardPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    registrations,
    loading: registrationsLoading,
    error,
    updateStatus,
    addFollowUp,
  } = useTrialRegistrations();

  // Follow-up modal
  const [followUpTarget, setFollowUpTarget] =
    useState<TrialRegistration | null>(null);
  const [expandedQueueTimelineId, setExpandedQueueTimelineId] = useState<string | null>(null);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  // Lead queue controls
  const [tab, setTab] = useState<QueueTab>("new");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [statusFilter, setStatusFilter] = useState("all");
  const [hotOnly, setHotOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("default");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [trialPage, setTrialPage] = useState(1);

  // Row-level status updates
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "sales"))
      router.replace("/login");
  }, [authLoading, router, user, userRole]);

  const today = getLocalDateKey();
  const { newEnquiries, dueFollowUps, upcomingTrials, allLeads, pipeline } =
    useMemo(() => {
      const active = registrations.filter(
        (item) => item.leadOutcome !== "closed" && item.status !== "cancelled",
      );
      const newItems = active
        .filter(
          (item) =>
            !["no-show", "cancelled"].includes(item.status) &&
            item.followUpHistory.length === 0 &&
            !item.remark.trim(),
        )
        .sort((a, b) => b.createdAt - a.createdAt);
      const dueItems = registrations
        .filter(
          (item) =>
            item.nextFollowUpDate &&
            item.nextFollowUpDate <= today &&
            item.leadOutcome !== "closed",
        )
        .sort((a, b) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate));
      const trialItems = registrations
        .filter(
          (item) =>
            item.trialDate >= today &&
            ["booked", "reschedule"].includes(item.status),
        )
        .sort((a, b) =>
          `${a.trialDate} ${a.trialTime}`.localeCompare(
            `${b.trialDate} ${b.trialTime}`,
          ),
        );
      const everyone = [...registrations].sort(
        (a, b) => b.createdAt - a.createdAt,
      );
      const stages = ["New", "Contacted", "Trial booked", "Enrolled", "Lost"];
      const stageCounts = stages.map((stage) => ({
        label: stage,
        count: registrations.filter((item) => getPipelineStage(item) === stage)
          .length,
      }));

      return {
        newEnquiries: newItems,
        dueFollowUps: dueItems,
        upcomingTrials: trialItems,
        allLeads: everyone,
        pipeline: stageCounts,
      };
    }, [registrations, today]);

  const tabCounts: Record<QueueTab, number> = {
    new: newEnquiries.length,
    due: dueFollowUps.length,
    all: allLeads.length,
  };

  const filteredQueue = useMemo(() => {
    const base =
      tab === "new" ? newEnquiries : tab === "due" ? dueFollowUps : allLeads;
    const q = deferredQuery.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");

    const list = base.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (hotOnly && item.leadTemp !== "hot") return false;
      if (!q) return true;
      const haystack =
        `${item.studentName || ""} ${item.locationName || ""} ${item.location || ""}`.toLowerCase();
      const phone = (item.contactNumber || "").replace(/\D/g, "");
      return (
        haystack.includes(q) || (qDigits.length > 0 && phone.includes(qDigits))
      );
    });

    if (sortBy === "newest") list.sort((a, b) => b.createdAt - a.createdAt);
    if (sortBy === "hot")
      list.sort(
        (a, b) =>
          Number(b.leadTemp === "hot") - Number(a.leadTemp === "hot") ||
          b.createdAt - a.createdAt,
      );
    if (sortBy === "followup")
      list.sort((a, b) =>
        (a.nextFollowUpDate || "9999-12-31").localeCompare(
          b.nextFollowUpDate || "9999-12-31",
        ),
      );
    return list;
  }, [
    tab,
    newEnquiries,
    dueFollowUps,
    allLeads,
    deferredQuery,
    statusFilter,
    hotOnly,
    sortBy,
  ]);

  const hasActiveFilters =
    query.trim() !== "" || statusFilter !== "all" || hotOnly;

  const queuePages = Math.max(1, Math.ceil(filteredQueue.length / pageSize));
  const safePage = Math.min(page, queuePages);
  const pagedQueue = filteredQueue.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const trialPages = Math.max(
    1,
    Math.ceil(upcomingTrials.length / TRIALS_PER_PAGE),
  );
  const safeTrialPage = Math.min(trialPage, trialPages);
  const pagedTrials = upcomingTrials.slice(
    (safeTrialPage - 1) * TRIALS_PER_PAGE,
    safeTrialPage * TRIALS_PER_PAGE,
  );

  const selectTab = useCallback((next: QueueTab) => {
    setTab(next);
    setPage(1);
  }, []);

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setHotOnly(false);
    setSortBy("default");
    setPage(1);
  };

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const index = QUEUE_TABS.findIndex((item) => item.id === tab);
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % QUEUE_TABS.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + QUEUE_TABS.length) % QUEUE_TABS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = QUEUE_TABS.length - 1;
    else return;
    event.preventDefault();
    const next = QUEUE_TABS[nextIndex].id;
    selectTab(next);
    requestAnimationFrame(() =>
      document.getElementById(`queue-tab-${next}`)?.focus(),
    );
  };

  const handleStatusChange = useCallback(
    async (id: string, status: string) => {
      setActionError("");
      setPendingIds((prev) => new Set(prev).add(id));
      try {
        await updateStatus(id, status);
      } catch {
        setActionError(
          "Couldn’t update the trial status. Check your connection and try again.",
        );
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [updateStatus],
  );

  const openFollowUp = useCallback((registration: TrialRegistration) => {
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    setFollowUpDate("");
    setFollowUpNote("");
    setFollowUpTarget(registration);
  }, []);

  const closeFollowUp = useCallback(() => {
    setFollowUpTarget(null);
    lastFocusRef.current?.focus();
  }, []);

  // Modal: focus the date field on open, close on Escape
  useEffect(() => {
    if (followUpTarget) dateInputRef.current?.focus();
  }, [followUpTarget]);

  useEffect(() => {
    if (!followUpTarget) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !savingFollowUp) closeFollowUp();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [followUpTarget, savingFollowUp, closeFollowUp]);

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href]",
    );
    if (!nodes || nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleSaveFollowUp = async () => {
    if (!followUpTarget || !followUpDate || !user) return;
    setSavingFollowUp(true);
    const updated = await addFollowUp(followUpTarget, {
      date: followUpDate,
      createdAt: new Date().toISOString(),
      updatedBy: user.displayName || user.email?.split("@")[0] || "Sales team",
      updatedByEmail: user.email || "",
      remark: followUpNote.trim(),
      status: followUpTarget.status,
      leadTemp: followUpTarget.leadTemp,
      leadOutcome: followUpTarget.leadOutcome,
      counsellorRemark: followUpTarget.counsellorRemark,
      closeRemark: followUpTarget.closeRemark,
    });
    setSavingFollowUp(false);
    if (updated) {
      setFollowUpDate("");
      setFollowUpNote("");
      closeFollowUp();
    }
  };

  if (authLoading || !user || userRole !== "sales")
    return <AuthLoadingSpinner />;

  const displayName = user.displayName || user.email?.split("@")[0] || "Sales";
  const enrolledCount =
    pipeline.find((item) => item.label === "Enrolled")?.count ?? 0;
  const totalLeads = registrations.length;
  const followUpPresets = [
    { label: "Tomorrow", value: addDays(today, 1) },
    { label: "In 3 days", value: addDays(today, 3) },
    { label: "Next week", value: addDays(today, 7) },
  ];
  const recentHistory = followUpTarget
    ? followUpTarget.followUpHistory.slice(-3).reverse()
    : [];

  return (
    <DashboardLayout role="sales" name={displayName}>
      <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <header className="flex flex-col justify-between gap-5 rounded-xl border-b-4 border-slate-900 bg-[#A81B1E] p-6 text-white sm:flex-row sm:items-end sm:p-8">
            <div>
              <p className="text-sm text-red-100">{formatLongDate()}</p>
              <h1
                style={HEADING_STYLE}
                className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Welcome back, {displayName.split(/[ .]/)[0]}
              </h1>
              <p
                className="mt-3 max-w-xl text-sm leading-relaxed text-white"
                aria-live="polite"
              >
                {registrationsLoading ? (
                  "Loading your day…"
                ) : (
                  <>
                    You have{" "}
                    <span className="font-semibold text-white underline decoration-white/40 underline-offset-4">
                      {plural(dueFollowUps.length, "follow-up")} due
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-white underline decoration-white/40 underline-offset-4">
                      {plural(
                        newEnquiries.length,
                        "new enquiry",
                        "new enquiries",
                      )}
                    </span>{" "}
                    waiting for a first reply.
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                className={`bg-white text-[#A81B1E] hover:bg-red-50 ${FOCUS_RING}`}
              >
                <Link href="/enquire-form">
                  <FilePlus2 className="mr-2 h-4 w-4" aria-hidden="true" /> Open
                  enquiries
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={`border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white ${FOCUS_RING}`}
              >
                <Link href="/admin-dashboard/trial-availability">
                  <CalendarDays className="mr-2 h-4 w-4" aria-hidden="true" />{" "}
                  Trial slots
                </Link>
              </Button>
            </div>
          </header>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <CircleAlert
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                Couldn’t load enquiry data. Check access to trial registrations
                and refresh.
              </p>
            </div>
          )}

          {actionError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <CircleAlert
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <p className="flex-1">{actionError}</p>
              <button
                type="button"
                onClick={() => setActionError("")}
                aria-label="Dismiss"
                className={`rounded p-0.5 hover:bg-red-100 ${FOCUS_RING}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Metrics */}
          <section
            aria-label="Key numbers"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <MetricCard
              title="New enquiries"
              value={newEnquiries.length}
              detail="Waiting for first follow-up"
              icon={<Users className="h-5 w-5" />}
              color="red"
              loading={registrationsLoading}
              onSelect={() => selectTab("new")}
              active={tab === "new"}
            />
            <MetricCard
              title="Follow-ups due"
              value={dueFollowUps.length}
              detail="Due today or overdue"
              icon={<Clock3 className="h-5 w-5" />}
              color="amber"
              loading={registrationsLoading}
              onSelect={() => selectTab("due")}
              active={tab === "due"}
            />
            <MetricCard
              title="Upcoming trials"
              value={upcomingTrials.length}
              detail="Booked from today onward"
              icon={<CalendarClock className="h-5 w-5" />}
              color="slate"
              loading={registrationsLoading}
            />
            <MetricCard
              title="Enrolled"
              value={enrolledCount}
              detail="Closed successfully"
              icon={<CheckCircle2 className="h-5 w-5" />}
              color="green"
              loading={registrationsLoading}
            />
          </section>

          {/* Pipeline */}
          <section
            aria-labelledby="pipeline-title"
            className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2
                  style={HEADING_STYLE}
                  id="pipeline-title"
                  className="text-base font-semibold text-slate-900"
                >
                  Lead pipeline
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Current stage for every enquiry
                </p>
              </div>
              <Link
                href="/enquire-form"
                className={`inline-flex items-center gap-1 rounded text-sm font-medium text-[#A81B1E] hover:text-[#7F1416] ${FOCUS_RING}`}
              >
                View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div
              role="img"
              aria-label={`Pipeline: ${pipeline.map((stage) => `${stage.label} ${stage.count}`).join(", ")}`}
              className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100"
            >
              {!registrationsLoading &&
                totalLeads > 0 &&
                pipeline
                  .filter((stage) => stage.count > 0)
                  .map((stage) => (
                    <div
                      key={stage.label}
                      className={`h-full ${STAGE_STYLES[stage.label].bar}`}
                      style={{ width: `${(stage.count / totalLeads) * 100}%` }}
                    />
                  ))}
            </div>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {pipeline.map((stage) => (
                <li
                  key={stage.label}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <span
                        className={`h-2 w-2 rounded-full ${STAGE_STYLES[stage.label].dot}`}
                        aria-hidden="true"
                      />
                      {stage.label}
                    </span>
                    {stage.label === "New" &&
                      stage.count > 0 &&
                      !registrationsLoading && (
                        <Flame
                          className="h-4 w-4 text-orange-500"
                          aria-hidden="true"
                        />
                      )}
                  </div>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tabular-nums text-slate-900">
                      {registrationsLoading ? "—" : stage.count}
                    </span>
                    {!registrationsLoading && totalLeads > 0 && (
                      <span className="text-xs tabular-nums text-slate-500">
                        {Math.round((stage.count / totalLeads) * 100)}%
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Lead queue */}
          <section
            aria-labelledby="queue-title"
            className="rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex flex-col gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2
                    style={HEADING_STYLE}
                    id="queue-title"
                    className="text-base font-semibold text-slate-900"
                  >
                    Lead queue
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Search, filter and work through your enquiries
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={registrationsLoading || filteredQueue.length === 0}
                  onClick={() =>
                    exportLeadsCsv(filteredQueue, `leads-${tab}-${today}.csv`)
                  }
                  className={FOCUS_RING}
                >
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  Export CSV
                </Button>
              </div>

              <div
                role="tablist"
                aria-label="Lead queues"
                onKeyDown={handleTabKeyDown}
                className="-mb-px flex gap-1 overflow-x-auto border-b border-slate-200"
              >
                {QUEUE_TABS.map((item) => {
                  const selected = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`queue-tab-${item.id}`}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-controls="queue-panel"
                      tabIndex={selected ? 0 : -1}
                      onClick={() => selectTab(item.id)}
                      className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${FOCUS_RING} ${
                        selected
                          ? "border-[#A81B1E] text-[#A81B1E]"
                          : "border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      {item.label}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                          selected
                            ? "bg-[#A81B1E]/10 text-[#A81B1E]"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {registrationsLoading ? "–" : tabCounts[item.id]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 px-5 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-6">
              <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
                <label htmlFor="queue-search" className="sr-only">
                  Search by name, phone or centre
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="queue-search"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, phone or centre"
                  className={`${FIELD} w-full py-2 pl-9 pr-3`}
                />
              </div>
              <label className="sr-only" htmlFor="queue-status">
                Filter by trial status
              </label>
              <select
                id="queue-status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className={`${FIELD} px-3 py-2`}
              >
                <option value="all">All statuses</option>
                {TRIAL_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="queue-sort">
                Sort leads
              </label>
              <select
                id="queue-sort"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as SortKey);
                  setPage(1);
                }}
                className={`${FIELD} px-3 py-2`}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-pressed={hotOnly}
                onClick={() => {
                  setHotOnly((value) => !value);
                  setPage(1);
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${FOCUS_RING} ${
                  hotOnly
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                }`}
              >
                <Flame className="h-4 w-4" aria-hidden="true" /> Hot only
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className={`rounded text-sm font-medium text-[#A81B1E] underline-offset-4 hover:underline ${FOCUS_RING}`}
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* List */}
            <div
              id="queue-panel"
              role="tabpanel"
              aria-labelledby={`queue-tab-${tab}`}
              className="px-5 pb-2 pt-4 sm:px-6"
            >
              {registrationsLoading ? (
                <LoadingRows />
              ) : pagedQueue.length ? (
                <ul className="divide-y divide-slate-100">
                  {pagedQueue.map((registration) => (
                    <LeadRow
                      key={registration.id}
                      registration={registration}
                      today={today}
                      pending={pendingIds.has(registration.id)}
                      onFollowUp={openFollowUp}
                      timelineExpanded={expandedQueueTimelineId === registration.id}
                      onTimelineToggle={() => setExpandedQueueTimelineId((current) => current === registration.id ? null : registration.id)}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </ul>
              ) : hasActiveFilters ? (
                <EmptyState
                  text="No leads match your search or filters."
                  action={
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={`mt-3 rounded text-sm font-medium text-[#A81B1E] underline-offset-4 hover:underline ${FOCUS_RING}`}
                    >
                      Clear filters
                    </button>
                  }
                />
              ) : (
                <EmptyState text={QUEUE_EMPTY_TEXT[tab]} />
              )}
            </div>

            {!registrationsLoading && filteredQueue.length > 0 && (
              <Pagination
                label="Lead queue pagination"
                page={safePage}
                pageSize={pageSize}
                total={filteredQueue.length}
                onPage={setPage}
                pageSizeOptions={PAGE_SIZES}
                onPageSize={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            )}
          </section>

          {/* Upcoming trials */}
          <section
            aria-labelledby="trials-title"
            className="rounded-xl border border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between gap-3 p-5 pb-4 sm:p-6 sm:pb-4">
              <div>
                <h2
                  style={HEADING_STYLE}
                  id="trials-title"
                  className="text-base font-semibold text-slate-900"
                >
                  Upcoming trial bookings
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Prepare for the next scheduled sessions
                </p>
              </div>
              <Link
                href="/enquire-form"
                className={`inline-flex items-center gap-1 rounded text-sm font-medium text-[#A81B1E] hover:text-[#7F1416] ${FOCUS_RING}`}
              >
                Manage trials{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="px-5 pb-2 sm:px-6">
              {registrationsLoading ? (
                <LoadingRows />
              ) : pagedTrials.length ? (
                <ul className="divide-y divide-slate-100">
                  {pagedTrials.map((registration) => {
                    const parts = getDateParts(registration.trialDate);
                    const statusStyle =
                      STATUS_STYLES[registration.status] ??
                      STATUS_STYLES.booked;
                    const statusLabel =
                      TRIAL_STATUSES.find(
                        (status) => status.value === registration.status,
                      )?.label ?? registration.status;
                    const isToday = registration.trialDate === today;
                    return (
                      <li
                        key={registration.id}
                        className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border text-center leading-none ${
                              isToday
                                ? "border-[#A81B1E]/30 bg-[#A81B1E]/10 text-[#A81B1E]"
                                : "border-slate-200 bg-slate-50 text-slate-700"
                            }`}
                            aria-hidden="true"
                          >
                            <span className="text-lg font-semibold tabular-nums">
                              {parts?.day ?? "—"}
                            </span>
                            <span className="mt-1 text-[11px] font-medium">
                              {parts?.month ?? ""}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {registration.studentName || "New enquiry"}
                            </p>
                            <p className="truncate text-xs text-slate-600">
                              {registration.locationName ||
                                registration.location ||
                                (registration.trialMode === "online"
                                  ? "Online"
                                  : "Center not set")}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-16 text-xs text-slate-700 sm:justify-end sm:pl-0">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays
                              className="h-3.5 w-3.5 text-slate-400"
                              aria-hidden="true"
                            />
                            {isToday
                              ? "Today"
                              : formatDate(registration.trialDate)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3
                              className="h-3.5 w-3.5 text-slate-400"
                              aria-hidden="true"
                            />
                            {registration.trialTime || "Time TBD"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ring-1 ring-inset ${statusStyle.pill}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                              aria-hidden="true"
                            />
                            {statusLabel}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState text="No upcoming trial bookings." />
              )}
            </div>
            {!registrationsLoading &&
              upcomingTrials.length > TRIALS_PER_PAGE && (
                <Pagination
                  label="Trial bookings pagination"
                  page={safeTrialPage}
                  pageSize={TRIALS_PER_PAGE}
                  total={upcomingTrials.length}
                  onPage={setTrialPage}
                />
              )}
            {(registrationsLoading ||
              upcomingTrials.length <= TRIALS_PER_PAGE) && (
              <div className="pb-3" />
            )}
          </section>
        </div>
      </main>

      {followUpTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            !savingFollowUp &&
            closeFollowUp()
          }
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="follow-up-title"
            onKeyDown={handleDialogKeyDown}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={followUpTarget.studentName} />
                <div className="min-w-0">
                  <h2
                    style={HEADING_STYLE}
                    id="follow-up-title"
                    className="text-lg font-semibold text-slate-900"
                  >
                    Schedule a follow-up
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-slate-600">
                    {followUpTarget.studentName || "New enquiry"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeFollowUp}
                disabled={savingFollowUp}
                aria-label="Close"
                className={`rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 ${FOCUS_RING}`}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {recentHistory.length > 0 && (
              <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-700">
                  Previous follow-ups
                </p>
                <ul className="mt-2 space-y-2">
                  {recentHistory.map((entry, index) => (
                    <li
                      key={`${entry.createdAt}-${index}`}
                      className="text-xs text-slate-600"
                    >
                      <span className="font-medium text-slate-800">
                        {formatDate(entry.date)}
                      </span>
                      {entry.updatedBy ? ` by ${entry.updatedBy}` : ""}
                      {entry.remark ? (
                        <span className="mt-0.5 line-clamp-2 block">
                          {entry.remark}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="follow-up-date"
                  className="block text-sm font-medium text-slate-800"
                >
                  Follow-up date
                </label>
                <input
                  id="follow-up-date"
                  ref={dateInputRef}
                  type="date"
                  min={today}
                  value={followUpDate}
                  onChange={(event) => setFollowUpDate(event.target.value)}
                  className={`${FIELD} mt-1.5 block w-full px-3 py-2.5`}
                />
                <div
                  className="mt-2 flex flex-wrap gap-2"
                  role="group"
                  aria-label="Quick dates"
                >
                  {followUpPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      aria-pressed={followUpDate === preset.value}
                      onClick={() => setFollowUpDate(preset.value)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${FOCUS_RING} ${
                        followUpDate === preset.value
                          ? "border-[#A81B1E] bg-[#A81B1E]/10 text-[#A81B1E]"
                          : "border-slate-300 text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="follow-up-note"
                  className="block text-sm font-medium text-slate-800"
                >
                  Note
                </label>
                <textarea
                  id="follow-up-note"
                  value={followUpNote}
                  onChange={(event) => setFollowUpNote(event.target.value)}
                  rows={3}
                  placeholder="What did you discuss? What happens next?"
                  className={`${FIELD} mt-1.5 block w-full resize-y px-3 py-2.5`}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                variant="outline"
                onClick={closeFollowUp}
                disabled={savingFollowUp}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFollowUp}
                disabled={!followUpDate || savingFollowUp}
                className="bg-[#A81B1E] text-white hover:bg-[#8C1518]"
              >
                {savingFollowUp && (
                  <LoaderCircle
                    className="mr-2 h-4 w-4 motion-safe:animate-spin"
                    aria-hidden="true"
                  />
                )}
                Save follow-up
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

/* ---------- Components ---------- */

function MetricCard({
  title,
  value,
  detail,
  icon,
  color,
  loading,
  onSelect,
  active = false,
}: {
  title: string;
  value: number;
  detail: string;
  icon: ReactNode;
  color: "red" | "amber" | "slate" | "green";
  loading: boolean;
  onSelect?: () => void;
  active?: boolean;
}) {
  const palette = METRIC_COLORS[color];
  const base =
    "relative block w-full overflow-hidden rounded-xl border bg-white p-5 text-left";
  const body = (
    <>
      <span
        className={`absolute inset-y-0 left-0 w-1 ${palette.accent}`}
        aria-hidden="true"
      />
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-sm font-medium text-slate-600">
            {title}
          </span>
          <span className="mt-2 block text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
            {loading ? "—" : value}
          </span>
        </span>
        <span className={`rounded-lg p-2.5 ${palette.chip}`} aria-hidden="true">
          {icon}
        </span>
      </span>
      <span className="mt-3 block text-xs text-slate-600">{detail}</span>
    </>
  );

  if (!onSelect)
    return <div className={`${base} border-slate-200`}>{body}</div>;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={`${title}: ${loading ? "loading" : value}. Show in lead queue`}
      className={`${base} transition-colors hover:border-slate-300 ${FOCUS_RING} ${
        active ? "border-[#A81B1E] ring-1 ring-[#A81B1E]" : "border-slate-200"
      }`}
    >
      {body}
    </button>
  );
}

function LeadRow({
  registration,
  today,
  pending,
  onFollowUp,
  timelineExpanded,
  onTimelineToggle,
  onStatusChange,
}: {
  registration: TrialRegistration;
  today: string;
  pending: boolean;
  onFollowUp: (registration: TrialRegistration) => void;
  timelineExpanded: boolean;
  onTimelineToggle: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const due = registration.nextFollowUpDate;
  const isOverdue = Boolean(due) && due < today;
  const isDueToday = Boolean(due) && due === today;
  const statusStyle =
    STATUS_STYLES[registration.status] ?? STATUS_STYLES.booked;
  const whatsapp = toWhatsAppNumber(registration.contactNumber);
  const name = registration.studentName || "New enquiry";

  return (
    <li className="py-3">
      <div className="flex items-start gap-3">
        <Avatar name={registration.studentName} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {name}
            </p>
            {registration.leadTemp === "hot" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-200">
                <Flame className="h-3 w-3" aria-hidden="true" /> Hot
              </span>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            {registration.contactNumber && (
              <a
                href={`tel:${registration.contactNumber}`}
                className={`inline-flex items-center gap-1 rounded hover:text-[#A81B1E] hover:underline ${FOCUS_RING}`}
              >
                <Phone className="h-3 w-3" aria-hidden="true" />
                {registration.contactNumber}
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${name} (opens in a new tab)`}
                className={`inline-flex items-center gap-1 rounded hover:text-emerald-700 hover:underline ${FOCUS_RING}`}
              >
                <Image
                  src="/assets/social-icons/whatsapp.png"
                  alt=""
                  width={14}
                  height={14}
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
                WhatsApp
              </a>
            )}
            {due && (
              <span
                className={`inline-flex items-center gap-1 ${
                  isOverdue
                    ? "font-semibold text-[#A81B1E]"
                    : isDueToday
                      ? "font-semibold text-amber-700"
                      : ""
                }`}
              >
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                {isOverdue ? "Overdue" : "Due"}{" "}
                {isDueToday ? "today" : formatDate(due)}
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={onTimelineToggle}
            className={`mt-2 inline-flex items-center gap-1 rounded text-xs font-medium text-[#A81B1E] hover:underline ${FOCUS_RING}`}
            aria-expanded={timelineExpanded}
            aria-controls={`queue-timeline-${registration.id}`}
            aria-label={`${timelineExpanded ? "Hide" : "View"} timeline for ${name}`}
          >
            <ChevronDown className={`h-4 w-4 motion-safe:transition-transform ${timelineExpanded ? "rotate-180" : ""}`} aria-hidden="true" />
            {timelineExpanded ? "Hide timeline" : "Timeline"}
          </button>
        </div>
      </div>
      {timelineExpanded && (
        <div id={`queue-timeline-${registration.id}`} className="mt-3 pl-[3.25rem]">
          <StudentTimelineStrip registration={registration} />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pl-[3.25rem]">
        <div className="relative">
          <span
            className={`pointer-events-none absolute left-2.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${statusStyle.dot}`}
            aria-hidden="true"
          />
          <select
            aria-label={`Update trial status for ${name}`}
            value={registration.status}
            disabled={pending}
            aria-busy={pending}
            onChange={(event) =>
              void onStatusChange(registration.id, event.target.value)
            }
            className={`${FIELD} max-w-[160px] py-1.5 pl-7 pr-2.5 text-xs font-medium disabled:cursor-wait disabled:opacity-60`}
          >
            {TRIAL_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => onFollowUp(registration)}
          className={`inline-flex items-center gap-1.5 rounded-lg bg-[#A81B1E] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#8C1518] ${FOCUS_RING}`}
        >
          <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />{" "}
          Follow up
        </button>
      </div>
    </li>
  );
}

function Pagination({
  label,
  page,
  pageSize,
  total,
  onPage,
  pageSizeOptions,
  onPageSize,
}: {
  label: string;
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSize?: (size: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const buttonBase = `inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors ${FOCUS_RING}`;

  return (
    <nav
      aria-label={label}
      className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <p aria-live="polite">
          Showing{" "}
          <span className="font-medium tabular-nums text-slate-900">
            {from}–{to}
          </span>{" "}
          of{" "}
          <span className="font-medium tabular-nums text-slate-900">
            {total}
          </span>
        </p>
        {pageSizeOptions && onPageSize && (
          <label className="inline-flex items-center gap-2">
            <span className="text-xs">Rows</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSize(Number(event.target.value))}
              className={`${FIELD} py-1.5 pl-2.5 pr-7 text-xs`}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`${buttonBase} border-slate-300 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="px-2 text-sm text-slate-600 sm:hidden">
          Page{" "}
          <span className="font-medium tabular-nums text-slate-900">
            {page}
          </span>{" "}
          of {totalPages}
        </p>
        <div className="hidden items-center gap-1 sm:flex">
          {getPageItems(page, totalPages).map((item, index) =>
            item === "…" ? (
              <span
                key={`gap-${index}`}
                className="px-1 text-slate-400"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPage(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={`${buttonBase} tabular-nums ${
                  item === page
                    ? "border-[#A81B1E] bg-[#A81B1E] text-white"
                    : "border-transparent text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className={`${buttonBase} border-slate-300 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#A81B1E]/10 text-xs font-semibold text-[#A81B1E] ring-1 ring-inset ring-[#A81B1E]/20"
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}

function EmptyState({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
      <p>{text}</p>
      {action}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3 py-1" role="status" aria-label="Loading">
      {[1, 2, 3].map((row) => (
        <div
          key={row}
          className="h-12 rounded-lg bg-slate-100 motion-safe:animate-pulse"
        />
      ))}
    </div>
  );
}
