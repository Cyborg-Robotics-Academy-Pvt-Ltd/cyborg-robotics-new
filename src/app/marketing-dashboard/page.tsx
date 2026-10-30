"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  Fragment,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Download,
  Globe2,
  Lightbulb,
  Minus,
  MousePointerClick,
  Radio,
  Search,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import DashboardLayout from "@/components/DashboardLayout";
import { useTrialRegistrations } from "@/components/hooks/useTrialRegistrations";
import { useAuth } from "@/lib/auth-context";
import type { TrialRegistration } from "@/app/enquire-form/types";
import {
  LEAD_OUTCOME_OPTIONS,
  LEAD_OUTCOME_STYLES,
} from "@/app/enquire-form/constants";
import { StudentTimelineStrip } from "@/components/trial-registrations/StudentTimelineStrip";

/* ---------- Types & constants ---------- */

type Period = "7" | "30" | "90" | "all";
type SourceSort = "enquiries" | "trialRate" | "closeRate" | "name";
type TableSort = "newest" | "oldest";
type LeadSegment = "all" | "hot" | "warm" | "cold";
type LeadOutcomeFilter = "all" | "opened" | "joined" | "closed" | "nurture";

const PERIODS: Array<{ value: Period; label: string; phrase: string }> = [
  { value: "7", label: "7 days", phrase: "last 7 days" },
  { value: "30", label: "30 days", phrase: "last 30 days" },
  { value: "90", label: "90 days", phrase: "last 90 days" },
  { value: "all", label: "All time", phrase: "all time" },
];

const SOURCE_SORTS: Array<{ value: SourceSort; label: string }> = [
  { value: "enquiries", label: "Most enquiries" },
  { value: "trialRate", label: "Best trial rate" },
  { value: "closeRate", label: "Best close rate" },
  { value: "name", label: "A to Z" },
];

const TRIAL_STATUS_LABELS: Record<string, string> = {
  booked: "Booked",
  show: "Attended",
  "no-show": "No show",
  reschedule: "Reschedule",
  cancelled: "Cancelled",
};

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

const LEAD_OUTCOME_BADGE_STYLES: Record<string, string> = {
  opened: "bg-blue-50 text-blue-700 ring-blue-200",
  joined: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-red-50 text-red-700 ring-red-200",
  nurture: "bg-violet-50 text-violet-700 ring-violet-200",
  later: "bg-slate-100 text-slate-700 ring-slate-200",
};

const SOURCE_COLORS = [
  "bg-[#A81B1E]",
  "bg-slate-800",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-slate-400",
  "bg-rose-400",
  "bg-stone-500",
];

const TONES = {
  red: "bg-[#A81B1E]/10 text-[#A81B1E]",
  slate: "bg-slate-100 text-slate-700",
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
} as const;

const SOURCE_PAGE_SIZE = 6;
const TABLE_PAGE_SIZES = [10, 25, 50];
const UNSPECIFIED = "Not specified";
const UNSPECIFIED_KEY = UNSPECIFIED.toLocaleLowerCase();

/* Brand: red #A81B1E (primary), neutrals for structure, amber/emerald/orange for status only */
const HEADING_STYLE = {
  fontFamily: "Syne, ui-sans-serif, system-ui, sans-serif",
} as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A81B1E] focus-visible:ring-offset-2";

const FIELD =
  "rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-[#A81B1E] focus:ring-2 focus:ring-[#A81B1E]/20";

const CARD =
  "rounded-xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06)]";

/* ---------- Helpers ---------- */

function getRegistrationTime(registration: TrialRegistration) {
  if (registration.createdAt) return registration.createdAt;
  if (registration.dateOfRegistration) {
    const parsed = new Date(registration.dateOfRegistration).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string | number) {
  if (!value) return "—";
  const date =
    typeof value === "number" ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function isTrialBooked(registration: TrialRegistration) {
  return ["booked", "reschedule", "show"].includes(registration.status);
}

function isClosed(registration: TrialRegistration) {
  return registration.leadOutcome === "closed";
}

function isJoined(registration: TrialRegistration) {
  return registration.leadOutcome === "joined";
}

function displaySource(source: string) {
  return (source || "").trim() || UNSPECIFIED;
}

function SourceIcon({ source }: { source: string }) {
  const normalized = source.trim().toLocaleLowerCase();
  const imageSource = normalized.includes("instagram")
    ? "/assets/social-icons/instagram.webp"
    : normalized.includes("facebook") || normalized === "fb"
      ? "/assets/social-icons/Facebook.webp"
      : normalized.includes("whatsapp")
        ? "/assets/social-icons/whatsapp.png"
        : normalized.includes("linkedin")
          ? "/assets/social-icons/Linkedin.png"
          : normalized.includes("youtube")
            ? "/assets/social-icons/youtube.png"
            : normalized.includes("google")
              ? "/assets/social-icons/google.png"
              : null;

  if (imageSource) {
    return (
      <Image
        src={imageSource}
        alt=""
        width={18}
        height={18}
        className="h-[24px] w-[24px] shrink-0 rounded-sm object-contain"
        aria-hidden="true"
      />
    );
  }

  const Icon = /website|web|site/.test(normalized)
    ? Globe2
    : /referral|friend|family|word.of.mouth/.test(normalized)
      ? Users
      : Radio;

  return (
    <Icon
      className="h-[18px] w-[18px] shrink-0 text-slate-500"
      aria-hidden="true"
    />
  );
}

function percent(part: number, whole: number) {
  return whole ? Math.round((part / whole) * 100) : 0;
}

function pctChange(current: number, previous: number) {
  return previous ? Math.round(((current - previous) / previous) * 100) : null;
}

function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  // Neutralise spreadsheet formula injection, but keep number-like values intact.
  const looksNumeric = /^[+-]?[\d\s()-]+$/.test(text);
  if (/^[=@\t\r]/.test(text) || (/^[+-]/.test(text) && !looksNumeric))
    text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(header: string[], rows: unknown[][], filename: string) {
  const body = [header, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
  const blob = new Blob([`\uFEFF${body}`], { type: "text/csv;charset=utf-8" });
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

type TrendBucket = { label: string; enquiries: number; trials: number };

function buildTrend(
  records: TrialRegistration[],
  period: Period,
): TrendBucket[] {
  const fmtDay = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  });
  const fmtMonth = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "2-digit",
  });
  const monthKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  if (period === "all") {
    const counts = new Map<string, { e: number; t: number }>();
    let earliest = Infinity;
    records.forEach((record) => {
      const time = getRegistrationTime(record);
      if (!time) return;
      earliest = Math.min(earliest, time);
      const key = monthKey(new Date(time));
      const entry = counts.get(key) ?? { e: 0, t: 0 };
      entry.e += 1;
      if (isTrialBooked(record)) entry.t += 1;
      counts.set(key, entry);
    });
    if (!Number.isFinite(earliest)) return [];
    const first = new Date(earliest);
    const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
    const now = new Date();
    const buckets: TrendBucket[] = [];
    while (cursor <= now) {
      const entry = counts.get(monthKey(cursor)) ?? { e: 0, t: 0 };
      buckets.push({
        label: fmtMonth.format(cursor),
        enquiries: entry.e,
        trials: entry.t,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return buckets.slice(-18);
  }

  const days = Number(period);
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  const indexByKey = new Map(dates.map((d, i) => [getLocalDateKey(d), i]));
  const perDay = dates.map(() => ({ e: 0, t: 0 }));
  records.forEach((record) => {
    const time = getRegistrationTime(record);
    if (!time) return;
    const index = indexByKey.get(getLocalDateKey(new Date(time)));
    if (index === undefined) return;
    perDay[index].e += 1;
    if (isTrialBooked(record)) perDay[index].t += 1;
  });

  const size = days > 30 ? 7 : 1;
  const buckets: TrendBucket[] = [];
  for (let i = 0; i < days; i += size) {
    const slice = perDay.slice(i, i + size);
    const last = Math.min(i + size - 1, days - 1);
    buckets.push({
      label:
        size === 1
          ? fmtDay.format(dates[i])
          : `${fmtDay.format(dates[i])} to ${fmtDay.format(dates[last])}`,
      enquiries: slice.reduce((sum, item) => sum + item.e, 0),
      trials: slice.reduce((sum, item) => sum + item.t, 0),
    });
  }
  return buckets;
}

/* ---------- Page ---------- */

export default function MarketingDashboardPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const { registrations, loading, error } = useTrialRegistrations();

  const [period, setPeriod] = useState<Period>("30");
  const [sourceSort, setSourceSort] = useState<SourceSort>("enquiries");
  const [sourcePage, setSourcePage] = useState(1);

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [leadOutcomeFilter, setLeadOutcomeFilter] =
    useState<LeadOutcomeFilter>("all");
  const [leadSegment, setLeadSegment] = useState<LeadSegment>("all");
  const [tableSort, setTableSort] = useState<TableSort>("newest");
  const [tablePage, setTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(TABLE_PAGE_SIZES[0]);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || userRole !== "marketing")) {
      router.replace("/login");
    }
  }, [authLoading, router, user, userRole]);

  const {
    records,
    sourceStats,
    attributedCount,
    totalTrials,
    totalClosed,
    totalJoined,
    previous,
  } = useMemo(() => {
    const start = new Date();
    let startTime = 0;
    let prevStartTime = 0;
    if (period !== "all") {
      const days = Number(period);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - days + 1);
      startTime = start.getTime();
      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - days);
      prevStartTime = prevStart.getTime();
    }

    const currentRecords = registrations.filter(
      (registration) => getRegistrationTime(registration) >= startTime,
    );
    const previousRecords =
      period === "all"
        ? []
        : registrations.filter((registration) => {
            const time = getRegistrationTime(registration);
            return time >= prevStartTime && time < startTime;
          });

    const grouped = new Map<
      string,
      { name: string; enquiries: number; trials: number; closed: number }
    >();
    currentRecords.forEach((registration) => {
      const name = displaySource(registration.referralSource);
      const key = name.toLocaleLowerCase();
      const current = grouped.get(key) ?? {
        name,
        enquiries: 0,
        trials: 0,
        closed: 0,
      };
      current.enquiries += 1;
      if (isTrialBooked(registration)) current.trials += 1;
      if (isClosed(registration)) current.closed += 1;
      grouped.set(key, current);
    });

    // Colour is assigned from the default (most-enquiries) order so it stays stable when re-sorting.
    const stats = [...grouped.values()]
      .sort((a, b) => b.enquiries - a.enquiries)
      .map((item, index) => ({
        ...item,
        key: item.name.toLocaleLowerCase(),
        color: SOURCE_COLORS[index % SOURCE_COLORS.length],
        trialRate: percent(item.trials, item.enquiries),
        closeRate: percent(item.closed, item.enquiries),
      }));

    return {
      records: currentRecords,
      sourceStats: stats,
      attributedCount: currentRecords.filter((registration) =>
        (registration.referralSource || "").trim(),
      ).length,
      totalTrials: currentRecords.filter(isTrialBooked).length,
      totalClosed: currentRecords.filter(isClosed).length,
      totalJoined: currentRecords.filter(isJoined).length,
      previous: {
        enquiries: previousRecords.length,
        trials: previousRecords.filter(isTrialBooked).length,
        closed: previousRecords.filter(isClosed).length,
      },
    };
  }, [period, registrations]);

  const trend = useMemo(() => buildTrend(records, period), [records, period]);

  const sortedSources = useMemo(() => {
    const list = [...sourceStats];
    if (sourceSort === "trialRate")
      list.sort(
        (a, b) => b.trialRate - a.trialRate || b.enquiries - a.enquiries,
      );
    if (sourceSort === "closeRate")
      list.sort(
        (a, b) => b.closeRate - a.closeRate || b.enquiries - a.enquiries,
      );
    if (sourceSort === "name")
      list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [sourceStats, sourceSort]);

  const sourcePages = Math.max(
    1,
    Math.ceil(sortedSources.length / SOURCE_PAGE_SIZE),
  );
  const safeSourcePage = Math.min(sourcePage, sourcePages);
  const pagedSources = sortedSources.slice(
    (safeSourcePage - 1) * SOURCE_PAGE_SIZE,
    safeSourcePage * SOURCE_PAGE_SIZE,
  );

  const activeSourceKey = sourceStats.some((item) => item.key === sourceFilter)
    ? sourceFilter
    : "all";

  const filteredRecords = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const list = records.filter((record) => {
      if (
        activeSourceKey !== "all" &&
        displaySource(record.referralSource).toLocaleLowerCase() !==
          activeSourceKey
      )
        return false;
      if (
        leadOutcomeFilter !== "all" &&
        record.leadOutcome !== leadOutcomeFilter
      )
        return false;
      if (leadSegment !== "all" && record.leadTemp !== leadSegment)
        return false;
      if (!q) return true;
      return `${record.studentName || ""} ${record.referralSource || ""}`
        .toLowerCase()
        .includes(q);
    });
    list.sort((a, b) =>
      tableSort === "newest"
        ? getRegistrationTime(b) - getRegistrationTime(a)
        : getRegistrationTime(a) - getRegistrationTime(b),
    );
    return list;
  }, [
    records,
    deferredQuery,
    activeSourceKey,
    leadOutcomeFilter,
    leadSegment,
    tableSort,
  ]);

  const tablePages = Math.max(
    1,
    Math.ceil(filteredRecords.length / tablePageSize),
  );
  const safeTablePage = Math.min(tablePage, tablePages);
  const pagedRecords = filteredRecords.slice(
    (safeTablePage - 1) * tablePageSize,
    safeTablePage * tablePageSize,
  );

  const activeFilterCount = [
    query.trim() !== "",
    activeSourceKey !== "all",
    leadOutcomeFilter !== "all",
    leadSegment !== "all",
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const clearFilters = () => {
    setQuery("");
    setSourceFilter("all");
    setLeadOutcomeFilter("all");
    setLeadSegment("all");
    setTablePage(1);
  };

  const showSourceEnquiries = (key: string) => {
    setSourceFilter(key);
    setTablePage(1);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById("enquiries-section")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  if (authLoading || !user || userRole !== "marketing") {
    return <AuthLoadingSpinner />;
  }

  const displayName =
    user.displayName || user.email?.split("@")[0] || "Marketing";
  const periodMeta =
    PERIODS.find((item) => item.value === period) ?? PERIODS[1];
  const attributionRate = percent(attributedCount, records.length);
  const showDelta = period !== "all";
  const deltaLabel = `vs previous ${periodMeta.label.toLowerCase()}`;

  const topSource = sourceStats[0];
  const unspecified = sourceStats.find((item) => item.key === UNSPECIFIED_KEY);
  const bestTrialSource = [...sourceStats]
    .filter(
      (item) =>
        item.key !== UNSPECIFIED_KEY && item.enquiries >= 3 && item.trials > 0,
    )
    .sort((a, b) => b.trialRate - a.trialRate || b.enquiries - a.enquiries)[0];

  return (
    <DashboardLayout role="marketing" name={displayName}>
      <main className="min-h-screen bg-[#f6f7fb] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-7xl space-y-5">
          {/* Header */}
          <header className="relative isolate flex flex-col justify-between gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#771218] via-[#A71920] to-[#be3038] p-6 text-white shadow-[0_14px_35px_-22px_rgba(110,18,24,0.8)] sm:flex-row sm:items-end sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] md:block"
            >
              <svg
                viewBox="0 0 520 220"
                fill="none"
                className="absolute inset-0 h-full w-full opacity-35"
                preserveAspectRatio="xMidYMid slice"
              >
                <path d="M30 184H510M30 134H510M30 84H510M30 34H510" stroke="white" strokeOpacity=".2" />
                <path d="M36 182C95 170 112 123 166 139S236 169 287 109 356 119 401 71 457 65 504 31" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <path d="M36 182C95 170 112 123 166 139S236 169 287 109 356 119 401 71 457 65 504 31V220H36V182Z" fill="url(#marketing-chart-fill)" />
                <circle cx="287" cy="109" r="6" fill="white" />
                <circle cx="401" cy="71" r="6" fill="white" />
                <circle cx="504" cy="31" r="6" fill="white" />
                <defs>
                  <linearGradient id="marketing-chart-fill" x1="270" y1="31" x2="270" y2="220" gradientUnits="userSpaceOnUse">
                    <stop stopColor="white" stopOpacity=".22" />
                    <stop offset="1" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-[#8c171e] via-[#8c171e]/35 to-transparent" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-100">
                Marketing overview
              </p>
              <h1
                style={HEADING_STYLE}
                className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl"
              >
                See what brings families in
              </h1>
              <p
                className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base"
                aria-live="polite"
              >
                {loading ? (
                  "Loading your numbers…"
                ) : records.length === 0 ? (
                  `No enquiries in the ${periodMeta.phrase}.`
                ) : (
                  <>
                    {records.length}{" "}
                    {records.length === 1 ? "enquiry" : "enquiries"} in the{" "}
                    {periodMeta.phrase}
                    {topSource && (
                      <>
                        .{" "}
                        <span className="font-semibold underline decoration-white/40 underline-offset-4">
                          {topSource.name}
                        </span>{" "}
                        brought in the most (
                        {percent(topSource.enquiries, records.length)}%).
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
            <Link
              href="/enquire-form"
              className={`relative z-10 inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-[#A81B1E] shadow-sm transition duration-150 hover:-translate-y-0.5 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#A81B1E]`}
            >
              View enquiries{" "}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </header>

          {/* Period */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2 font-medium">
                <CalendarDays
                  className="h-4 w-4 text-slate-500"
                  aria-hidden="true"
                />
                Reporting period
              </span>
              <span className="text-xs text-slate-500">
                Based on enquiry submission date
              </span>
            </div>
            <div
              role="group"
              aria-label="Reporting period"
              className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-fit"
            >
              {PERIODS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setPeriod(option.value);
                    setSourcePage(1);
                    setTablePage(1);
                  }}
                  aria-pressed={period === option.value}
                  className={`flex-1 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors sm:flex-none ${FOCUS_RING} ${
                    period === option.value
                      ? "bg-[#A81B1E] text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

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
                Couldn’t load enquiry data. Check access and refresh the page.
              </p>
            </div>
          )}

          {/* Metrics */}
          <section
            aria-label="Key numbers"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <MetricCard
              title="Enquiries"
              value={records.length}
              detail="Free-trial enquiries in this period"
              icon={<Users className="h-5 w-5" />}
              tone="red"
              loading={loading}
              delta={
                showDelta
                  ? {
                      pct: pctChange(records.length, previous.enquiries),
                      label: deltaLabel,
                    }
                  : undefined
              }
            />
            <MetricCard
              title="Trial bookings"
              value={totalTrials}
              detail={
                records.length
                  ? `${percent(totalTrials, records.length)}% of enquiries`
                  : "No enquiries yet"
              }
              icon={<MousePointerClick className="h-5 w-5" />}
              tone="slate"
              loading={loading}
              delta={
                showDelta
                  ? {
                      pct: pctChange(totalTrials, previous.trials),
                      label: deltaLabel,
                    }
                  : undefined
              }
            />
            <MetricCard
              title="Closed leads"
              value={totalClosed}
              detail={
                records.length
                  ? `${percent(totalClosed, records.length)}% marked closed`
                  : "No enquiries yet"
              }
              icon={<CheckCircle2 className="h-5 w-5" />}
              tone="green"
              loading={loading}
              delta={
                showDelta
                  ? {
                      pct: pctChange(totalClosed, previous.closed),
                      label: deltaLabel,
                    }
                  : undefined
              }
            />
            <MetricCard
              title="Source coverage"
              value={`${attributionRate}%`}
              detail={`${attributedCount} of ${records.length} enquiries have a source`}
              icon={<Radio className="h-5 w-5" />}
              tone="amber"
              loading={loading}
            />
          </section>

          {/* Trend */}
          <section
            aria-labelledby="trend-title"
            className={`${CARD} p-4 sm:p-5`}
          >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2
                  style={HEADING_STYLE}
                  id="trend-title"
                  className="text-base font-semibold text-slate-900 sm:text-lg"
                >
                  Enquiries over time
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {period === "90"
                    ? "Weekly"
                    : period === "all"
                      ? "Monthly"
                      : "Daily"}{" "}
                  enquiries, with trial bookings shaded darker
                </p>
              </div>
              <ul className="flex items-center gap-4 text-xs text-slate-600">
                <li className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-sm bg-[#A81B1E]/25"
                    aria-hidden="true"
                  />{" "}
                  Enquiries
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-sm bg-[#A81B1E]"
                    aria-hidden="true"
                  />{" "}
                  Trial booked 
                </li>
              </ul>
            </div>
            {loading ? (
              <LoadingRows tall />
            ) : (
              <TrendChart buckets={trend} periodPhrase={periodMeta.phrase} />
            )}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            {/* Sources */}
            <section
              aria-labelledby="sources-title"
              className={`${CARD} self-start`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 p-4 pb-3 sm:p-5 sm:pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3
                      className="h-5 w-5 text-[#A81B1E]"
                      aria-hidden="true"
                    />
                    <h2
                      style={HEADING_STYLE}
                      id="sources-title"
                      className="text-base font-semibold text-slate-900 sm:text-lg"
                    >
                      Referral source performance
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Enquiries, trial bookings and closed leads by source
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-700">
                    {sourceStats.length}{" "}
                    {sourceStats.length === 1 ? "source" : "sources"}
                  </span>
                  <label className="sr-only" htmlFor="source-sort">
                    Sort sources
                  </label>
                  <select
                    id="source-sort"
                    value={sourceSort}
                    onChange={(event) => {
                      setSourceSort(event.target.value as SourceSort);
                      setSourcePage(1);
                    }}
                    className={`${FIELD} px-2.5 py-1.5 text-xs`}
                  >
                    {SOURCE_SORTS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={loading || sourceStats.length === 0}
                    onClick={() =>
                      downloadCsv(
                        [
                          "Source",
                          "Enquiries",
                          "Trials",
                          "Trial rate %",
                          "Closed",
                          "Close rate %",
                        ],
                        sortedSources.map((item) => [
                          item.name,
                          item.enquiries,
                          item.trials,
                          item.trialRate,
                          item.closed,
                          item.closeRate,
                        ]),
                        `sources-${period}-${getLocalDateKey()}.csv`,
                      )
                    }
                    className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="px-4 pb-2 sm:px-5">
                {loading ? (
                  <LoadingRows />
                ) : pagedSources.length ? (
                  <ul className="divide-y divide-slate-100">
                    {pagedSources.map((source) => (
                      <li
                        key={source.key}
                        className="-mx-2 rounded-lg px-2 py-3.5 transition-colors first:mt-1 hover:bg-slate-50"
                      >
                        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <SourceIcon source={source.name} />
                            <button
                              type="button"
                              onClick={() => showSourceEnquiries(source.key)}
                              title="Show these enquiries"
                              className={`truncate rounded text-left text-sm font-semibold text-slate-900 hover:text-[#A81B1E] hover:underline ${FOCUS_RING}`}
                            >
                              {source.name}
                            </button>
                            <span className="text-xs tabular-nums text-slate-500">
                              {percent(source.enquiries, records.length)}% of
                              enquiries
                            </span>
                          </div>
                          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                            {/* dt first for valid markup; flex-row-reverse keeps number-then-label visually */}
                            <div className="flex flex-row-reverse gap-1">
                              <dt>enquiries</dt>
                              <dd className="font-semibold tabular-nums text-slate-900">
                                {source.enquiries}
                              </dd>
                            </div>
                            <div className="flex flex-row-reverse gap-1">
                              <dt>trials ({source.trialRate}%)</dt>
                              <dd className="font-semibold tabular-nums text-slate-900">
                                {source.trials}
                              </dd>
                            </div>
                            <div className="flex flex-row-reverse gap-1">
                              <dt>closed ({source.closeRate}%)</dt>
                              <dd className="font-semibold tabular-nums text-emerald-700">
                                {source.closed}
                              </dd>
                            </div>
                          </dl>
                        </div>
                        <div
                          className="h-2 overflow-hidden rounded-full bg-slate-100"
                          role="img"
                          aria-label={`${source.name}: ${percent(source.enquiries, records.length)}% of enquiries`}
                        >
                          <div
                            className={`h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500 ${source.color}`}
                            style={{
                              width: `${records.length ? Math.max(2, (source.enquiries / records.length) * 100) : 0}%`,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState text="Referral source results will appear when enquiries arrive." />
                )}
              </div>

              {!loading && sortedSources.length > SOURCE_PAGE_SIZE && (
                <Pagination
                  label="Referral sources pagination"
                  page={safeSourcePage}
                  pageSize={SOURCE_PAGE_SIZE}
                  total={sortedSources.length}
                  onPage={setSourcePage}
                />
              )}
              {(loading || sortedSources.length <= SOURCE_PAGE_SIZE) && (
                <div className="pb-3" />
              )}
            </section>

            {/* Funnel + insights */}
            <section
              aria-labelledby="funnel-title"
              className={`${CARD} self-start p-4 sm:p-5`}
            >
              <div className="mb-5 flex items-start gap-2">
                <ArrowDownRight
                  className="mt-0.5 h-5 w-5 text-[#A81B1E]"
                  aria-hidden="true"
                />
                <div>
                  <h2
                    style={HEADING_STYLE}
                    id="funnel-title"
                    className="text-base font-semibold text-slate-900 sm:text-lg"
                  >
                    Enquiry funnel
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Progress in the selected period
                  </p>
                </div>
              </div>
              <ol className="space-y-3">
                <FunnelStep
                  label="Enquiries"
                  value={records.length}
                  total={records.length}
                  color="bg-[#A81B1E]"
                  loading={loading}
                />
                <FunnelStep
                  label="Trial booked"
                  value={totalTrials}
                  total={records.length}
                  previousValue={records.length}
                  color="bg-slate-700"
                  loading={loading}
                />
                <FunnelStep
                  label="Closed leads"
                  value={totalClosed}
                  total={records.length}
                  previousValue={totalTrials}
                  color="bg-red-500"
                  loading={loading}
                />
                <FunnelStep
                  label="Joined"
                  value={totalJoined}
                  total={records.length}
                  previousValue={totalTrials}
                  color="bg-emerald-500"
                  loading={loading}
                />
              </ol>

              <div className="mt-5 rounded-lg border border-slate-200 border-l-4 border-l-[#A81B1E] bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#A81B1E]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 space-y-2 text-sm leading-relaxed text-slate-700">
                    <h3 className="font-semibold text-slate-900">
                      What stands out
                    </h3>
                    {loading ? (
                      <p>Loading…</p>
                    ) : records.length === 0 ? (
                      <p>
                        Insights will appear once enquiries arrive in this
                        period.
                      </p>
                    ) : (
                      <>
                        {topSource && (
                          <div className="flex items-start gap-2">
                            <TrendingUp
                              className="mt-0.5 h-4 w-4 shrink-0 text-[#A81B1E]"
                              aria-hidden="true"
                            />
                            <p>
                              <span className="font-semibold text-slate-900">
                                {topSource.name}
                              </span>{" "}
                              is your largest source with {topSource.enquiries}{" "}
                              {topSource.enquiries === 1
                                ? "enquiry"
                                : "enquiries"}
                              .
                            </p>
                          </div>
                        )}
                        {bestTrialSource && (
                          <div className="flex items-start gap-2">
                            <MousePointerClick
                              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                              aria-hidden="true"
                            />
                            <p>
                              <span className="font-semibold text-slate-900">
                                {bestTrialSource.name}
                              </span>{" "}
                              converts best to trials at{" "}
                              {bestTrialSource.trialRate}% (sources with 3 or more
                              enquiries).
                            </p>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <Globe2
                            className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
                            aria-hidden="true"
                          />
                          <p>
                            {attributionRate}% of enquiries have a source.
                            {unspecified && unspecified.enquiries > 0 && (
                              <>
                                {" "}
                                <button
                                  type="button"
                                  onClick={() =>
                                    showSourceEnquiries(UNSPECIFIED_KEY)
                                  }
                                  className={`rounded font-semibold text-[#A81B1E] underline-offset-4 hover:underline ${FOCUS_RING}`}
                                >
                                  Review {unspecified.enquiries} without a source
                                </button>{" "}
                                and ask families to answer this question.
                              </>
                            )}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </section>

          {/* Enquiries table */}
          <section
            id="enquiries-section"
            aria-labelledby="enquiries-title"
            className={`${CARD} scroll-mt-4`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 p-4 pb-3 sm:p-5 sm:pb-4">
              <div>
                <h2
                  style={HEADING_STYLE}
                  id="enquiries-title"
                  className="text-base font-semibold text-slate-900 sm:text-lg"
                >
                  Enquiries
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Submissions in this period and their reported source
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/enquire-form"
                  className={`inline-flex items-center gap-1 rounded text-sm font-medium text-[#A81B1E] hover:text-[#7F1416] ${FOCUS_RING}`}
                >
                  Open enquiries{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  disabled={loading || filteredRecords.length === 0}
                  onClick={() =>
                    downloadCsv(
                      [
                        "Student",
                        "Source",
                        "Trial status",
                        "Lead outcome",
                        "Closed",
                        "Date",
                      ],
                      filteredRecords.map((record) => {
                        const time = getRegistrationTime(record);
                        return [
                          record.studentName,
                          displaySource(record.referralSource),
                          TRIAL_STATUS_LABELS[record.status] ?? "",
                          LEAD_OUTCOME_OPTIONS.find(
                            (option) => option.value === record.leadOutcome,
                          )?.label ?? "",
                          isClosed(record) ? "Yes" : "No",
                          time ? new Date(time).toISOString().slice(0, 10) : "",
                        ];
                      }),
                      `enquiries-${period}-${getLocalDateKey()}.csv`,
                    )
                  }
                  className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" /> Export
                  CSV
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="mx-4 rounded-xl border border-slate-200/80 bg-white p-3 sm:mx-5 sm:p-4">
              <div className="relative">
                <label htmlFor="enquiry-search" className="sr-only">
                  Search by name or source
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="enquiry-search"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setTablePage(1);
                  }}
                  placeholder="Search name or source"
                  className={`${FIELD} w-full py-2.5 pl-9 pr-3`}
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <FilterField id="enquiry-source" label="Source">
                  <select
                    id="enquiry-source"
                    value={activeSourceKey}
                    onChange={(event) => {
                      setSourceFilter(event.target.value);
                      setTablePage(1);
                    }}
                    className={`${FIELD} w-full px-3 py-2`}
                  >
                    <option value="all">All sources</option>
                    {sourceStats.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </FilterField>
                <FilterField id="enquiry-outcome" label="Lead outcome">
                  <select
                    id="enquiry-outcome"
                    value={leadOutcomeFilter}
                    onChange={(event) => {
                      setLeadOutcomeFilter(
                        event.target.value as LeadOutcomeFilter,
                      );
                      setTablePage(1);
                    }}
                    className={`${FIELD} w-full px-3 py-2`}
                  >
                    <option value="all">All outcomes</option>
                    <option value="opened">Opened</option>
                    <option value="joined">Joined</option>
                    <option value="closed">Closed</option>
                    <option value="nurture">Nurture</option>
                  </select>
                </FilterField>
                <FilterField id="enquiry-segment" label="Lead temperature">
                  <select
                    id="enquiry-segment"
                    value={leadSegment}
                    onChange={(event) => {
                      setLeadSegment(event.target.value as LeadSegment);
                      setTablePage(1);
                    }}
                    className={`${FIELD} w-full px-3 py-2`}
                  >
                    <option value="all">All lead temperatures</option>
                    <option value="hot">Hot leads</option>
                    <option value="warm">Warm leads</option>
                    <option value="cold">Cold leads</option>
                  </select>
                </FilterField>
                <FilterField id="enquiry-sort" label="Sort by date">
                  <select
                    id="enquiry-sort"
                    value={tableSort}
                    onChange={(event) => {
                      setTableSort(event.target.value as TableSort);
                      setTablePage(1);
                    }}
                    className={`${FIELD} w-full px-3 py-2`}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                </FilterField>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="text-slate-600" aria-live="polite">
                  <span className="font-semibold tabular-nums text-slate-900">
                    {loading ? "—" : filteredRecords.length}
                  </span>{" "}
                  {filteredRecords.length === 1 ? "enquiry" : "enquiries"}
                  {hasActiveFilters && (
                    <span className="text-slate-500">
                      {" "}
                      · {activeFilterCount}{" "}
                      {activeFilterCount === 1 ? "filter" : "filters"} applied
                    </span>
                  )}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className={`inline-flex items-center gap-1 rounded px-1 text-sm font-medium text-[#A81B1E] underline-offset-4 hover:underline ${FOCUS_RING}`}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            <div className="px-5 pb-2 pt-4 sm:px-6">
              {loading ? (
                <LoadingRows />
              ) : pagedRecords.length ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <caption className="sr-only">
                      Enquiries with source, trial status and date
                    </caption>
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200 text-xs text-slate-600">
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Enquiry
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Source
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Trial
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pagedRecords.map((record) => {
                        const status = STATUS_STYLES[record.status];
                        const registrationTime = getRegistrationTime(record);
                        const isNewToday =
                          registrationTime > 0 &&
                          getLocalDateKey(new Date(registrationTime)) ===
                            getLocalDateKey();
                        const isExpanded = expandedTimelineId === record.id;
                        const outcomeStyle = record.leadOutcome
                          ? LEAD_OUTCOME_STYLES[record.leadOutcome]
                          : undefined;
                        const outcomeLabel = LEAD_OUTCOME_OPTIONS.find(
                          (option) => option.value === record.leadOutcome,
                        )?.label;
                        const timelineId = `timeline-${record.id}`;
                        return (
                          <Fragment key={record.id}>
                            <tr
                              className={`text-slate-700 transition-colors hover:bg-slate-50 ${
                                isExpanded ? "bg-slate-50" : ""
                              }`}
                            >
                              <th
                                scope="row"
                                className="px-4 py-3 align-top font-medium text-slate-900"
                              >
                                <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  {record.studentName || "New enquiry"}
                                  {isNewToday && (
                                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                      New
                                    </span>
                                  )}
                                </span>
                                {registrationTime > 0 && (
                                  <span className="mt-0.5 block text-xs font-semibold text-[#A71920]">
                                    <span>
                                      Enquired
                                    </span>{" "}
                                    {formatDate(registrationTime)}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedTimelineId(
                                      isExpanded ? null : record.id,
                                    )
                                  }
                                  aria-expanded={isExpanded}
                                  aria-controls={timelineId}
                                  aria-label={`${isExpanded ? "Hide" : "Show"} timeline for ${record.studentName || "student"}`}
                                  className={`mt-1.5 inline-flex items-center gap-1 rounded px-0.5 text-xs font-medium text-[#A81B1E] hover:underline ${FOCUS_RING}`}
                                >
                                  <ChevronDown
                                    className={`h-4 w-4 motion-safe:transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                    aria-hidden="true"
                                  />
                                  {isExpanded ? "Hide timeline" : "Timeline"}
                                </button>
                              </th>
                              <td className="px-4 py-3 align-top text-center">
                                <span
                                  role="img"
                                  aria-label={`Source: ${displaySource(record.referralSource)}`}
                                  title={displaySource(record.referralSource)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50"
                                >
                                  <SourceIcon
                                    source={displaySource(record.referralSource)}
                                  />
                                </span>
                              </td>
                              <td className="px-4 py-3 align-top">
                                {status ? (
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.pill}`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                      aria-hidden="true"
                                    />
                                    {TRIAL_STATUS_LABELS[record.status]}
                                  </span>
                                ) : (
                                  <span
                                    className="text-slate-400"
                                    aria-label="No trial"
                                  >
                                    —
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 align-top">
                                {record.leadOutcome && outcomeStyle ? (
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${LEAD_OUTCOME_BADGE_STYLES[record.leadOutcome] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${outcomeStyle.dot}`}
                                      aria-hidden="true"
                                    />
                                    {outcomeLabel ?? record.leadOutcome}
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">
                                    Not set
                                  </span>
                                )}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr id={timelineId}>
                                <td
                                  colSpan={4}
                                  className="border-l-4 border-l-[#A81B1E] bg-slate-50 px-4 py-4"
                                >
                                  <StudentTimelineStrip registration={record} />
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : hasActiveFilters ? (
                <EmptyState
                  text="No enquiries match your search or filters."
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
                <EmptyState text="No enquiries found for this period." />
              )}
            </div>

            {!loading && filteredRecords.length > 0 && (
              <Pagination
                label="Enquiries pagination"
                page={safeTablePage}
                pageSize={tablePageSize}
                total={filteredRecords.length}
                onPage={setTablePage}
                pageSizeOptions={TABLE_PAGE_SIZES}
                onPageSize={(size) => {
                  setTablePageSize(size);
                  setTablePage(1);
                }}
              />
            )}
          </section>
        </div>
      </main>
    </DashboardLayout>
  );
}

/* ---------- Components ---------- */

function FilterField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-slate-600"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon,
  tone,
  loading,
  delta,
}: {
  title: string;
  value: number | string;
  detail: string;
  icon: ReactNode;
  tone: keyof typeof TONES;
  loading: boolean;
  delta?: { pct: number | null; label: string };
}) {
  const accent = {
    red: "bg-[#A81B1E]",
    slate: "bg-slate-700",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
  }[tone];

  let deltaNode: ReactNode = null;
  if (delta && !loading) {
    if (delta.pct === null) {
      deltaNode = (
        <span className="text-slate-500">No previous data to compare</span>
      );
    } else if (delta.pct === 0) {
      deltaNode = (
        <span className="inline-flex items-center gap-1 text-slate-600">
          <Minus className="h-3.5 w-3.5" aria-hidden="true" /> No change{" "}
          {delta.label}
        </span>
      );
    } else {
      const up = delta.pct > 0;
      deltaNode = (
        <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
              up ? "bg-emerald-50 text-emerald-700" : "bg-[#A81B1E]/10 text-[#A81B1E]"
            }`}
          >
            {up ? (
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="tabular-nums">
              {up ? "+" : ""}
              {delta.pct}%
            </span>
            <span className="sr-only">{up ? "increase" : "decrease"}</span>
          </span>
          <span className="font-normal text-slate-600">{delta.label}</span>
        </span>
      );
    }
  }

  return (
    <div className={`${CARD} relative overflow-hidden p-4 transition-shadow duration-150 hover:shadow-md sm:p-5`}>
      <span
        className={`absolute inset-y-0 left-0 w-1 ${accent}`}
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          {loading ? (
            <div
              className="mt-2.5 h-9 w-20 rounded-md bg-slate-100 motion-safe:animate-pulse"
              role="status"
              aria-label="Loading"
            />
          ) : (
            <p className="mt-1.5 text-3xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-[2.1rem]">
              {value}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${TONES[tone]}`} aria-hidden="true">
          {icon}
        </div>
      </div>
      <p className="mt-2 min-h-8 text-xs leading-relaxed text-slate-600">{detail}</p>
      {deltaNode && <p className="mt-2 text-xs">{deltaNode}</p>}
    </div>
  );
}

function TrendChart({
  buckets,
  periodPhrase,
}: {
  buckets: TrendBucket[];
  periodPhrase: string;
}) {
  const total = buckets.reduce((sum, item) => sum + item.enquiries, 0);
  if (buckets.length === 0 || total === 0) {
    return (
      <EmptyState text={`No enquiries in the ${periodPhrase} to chart yet.`} />
    );
  }
  const max = Math.max(...buckets.map((item) => item.enquiries), 1);
  const peak = buckets.reduce(
    (best, item) => (item.enquiries > best.enquiries ? item : best),
    buckets[0],
  );
  const lastIndex = buckets.length - 1;

  return (
    <div>
                  <div className="flex gap-3">
        {/* Y axis */}
        <div
            className="flex h-52 w-7 shrink-0 flex-col justify-between text-right text-[11px] tabular-nums text-slate-500"
          aria-hidden="true"
        >
          <span className="-translate-y-1.5">{max}</span>
          <span>{Math.round(max / 2)}</span>
          <span className="translate-y-1.5">0</span>
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Gridlines */}
          <div
            className="pointer-events-none absolute inset-0 flex flex-col justify-between"
            aria-hidden="true"
          >
            <div className="border-t border-dashed border-slate-200" />
            <div className="border-t border-dashed border-slate-200" />
            <div className="border-t border-slate-200" />
          </div>

          <div
            role="group"
            aria-label={`${total} enquiries in the ${periodPhrase}. Busiest period: ${peak.label} with ${peak.enquiries}.`}
            className="relative flex h-52 items-end gap-1.5"
          >
            {buckets.map((bucket, index) => {
              const align =
                index < 3
                  ? "left-0"
                  : index > lastIndex - 3
                    ? "right-0"
                    : "left-1/2 -translate-x-1/2";
              return (
                <div
                  key={`${bucket.label}-${index}`}
                  className="group relative flex h-full min-w-0 flex-1 items-end rounded-t-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A81B1E] focus-visible:ring-offset-2"
                  role="img"
                  tabIndex={0}
                  aria-label={`${bucket.label}: ${bucket.enquiries} enquiries and ${bucket.trials} trials`}
                  title={`${bucket.label}: ${bucket.enquiries} enquiries, ${bucket.trials} trials`}
                >
                  {bucket.enquiries === 0 ? (
                    <div className="h-0.5 w-full rounded-full bg-slate-200" />
                  ) : (
                    <div
                      className="relative w-full overflow-hidden rounded-t bg-[#A81B1E]/25 transition-colors group-hover:bg-[#A81B1E]/40"
                      style={{
                        height: `${Math.max(3, (bucket.enquiries / max) * 100)}%`,
                      }}
                    >
                      <div
                        className="absolute inset-x-0 bottom-0 bg-[#A81B1E]"
                        style={{
                          height: `${(bucket.trials / bucket.enquiries) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                  {/* Tooltip */}
                  <div
                    className={`pointer-events-none absolute bottom-full z-10 mb-2 hidden w-max max-w-[200px] rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block group-focus:block ${align}`}
                    aria-hidden="true"
                  >
                    <p className="font-semibold">{bucket.label}</p>
                    <p className="mt-0.5 text-slate-200">
                      {bucket.enquiries}{" "}
                      {bucket.enquiries === 1 ? "enquiry" : "enquiries"} ·{" "}
                      {bucket.trials} {bucket.trials === 1 ? "trial" : "trials"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div
        className="mt-2 flex justify-between pl-9 text-xs text-slate-500"
        aria-hidden="true"
      >
        <span>{buckets[0].label.split(" to ")[0]}</span>
        <span>
          Peak: {peak.enquiries} ({peak.label})
        </span>
        <span>{buckets[buckets.length - 1].label.split(" to ").pop()}</span>
      </div>
      <table className="sr-only">
        <caption>Enquiries and trial bookings per period</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Enquiries</th>
            <th scope="col">Trials</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket, index) => (
            <tr key={`${bucket.label}-${index}`}>
              <th scope="row">{bucket.label}</th>
              <td>{bucket.enquiries}</td>
              <td>{bucket.trials}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FunnelStep({
  label,
  value,
  total,
  previousValue,
  color,
  loading,
}: {
  label: string;
  value: number;
  total: number;
  previousValue?: number;
  color: string;
  loading: boolean;
}) {
  const share = percent(value, total);
  return (
    <li className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-800">{label}</span>
        <span className="text-base font-semibold tabular-nums text-slate-900">
          {loading ? "—" : value}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-200"
        role="img"
        aria-label={`${label}: ${loading ? 0 : share}% of enquiries`}
      >
        <div
          className={`h-full rounded-full motion-safe:transition-[width] motion-safe:duration-500 ${color}`}
          style={{ width: `${loading ? 0 : share}%` }}
        />
      </div>
      <p className="mt-1.5 flex justify-between text-xs tabular-nums text-slate-600">
        <span>{loading ? " " : `${share}% of enquiries`}</span>
        {previousValue !== undefined && !loading && (
          <span>{percent(value, previousValue)}% of previous step</span>
        )}
      </p>
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

function EmptyState({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
      <p>{text}</p>
      {action}
    </div>
  );
}

function LoadingRows({ tall = false }: { tall?: boolean }) {
  return (
    <div className="space-y-3 py-1" role="status" aria-label="Loading">
      {tall ? (
        <div className="h-48 rounded-lg bg-slate-100 motion-safe:animate-pulse" />
      ) : (
        [1, 2, 3].map((row) => (
          <div
            key={row}
            className="h-12 rounded-lg bg-slate-100 motion-safe:animate-pulse"
          />
        )) 
      )}
    </div>
  );
}
