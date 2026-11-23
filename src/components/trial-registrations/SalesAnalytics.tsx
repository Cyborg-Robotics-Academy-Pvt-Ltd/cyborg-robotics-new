"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { OFFLINE_CENTERS } from "@/app/enquire-form/constants";
import { TrialRegistration } from "@/app/enquire-form/types";
import {
  getLocationType,
  getRegistrationCenter,
  statusLabel,
} from "@/app/enquire-form/utils";

const IST_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "0%");
const normalizeKey = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");

function formatChartDay(value: string, includeYear = false) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(includeYear ? { year: "numeric" as const } : {}),
  });
}

function dateOf(registration: TrialRegistration) {
  if (registration.createdAt) {
    const createdAt = new Date(registration.createdAt);
    if (!Number.isNaN(createdAt.getTime())) return IST_DATE.format(createdAt);
  }
  return registration.dateOfRegistration || "";
}

type BreakdownItem = { name: string; value: number; converted: number };

function Breakdown({
  title,
  data,
}: {
  title: string;
  data: BreakdownItem[];
}) {
  return (
    <div className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-stone-800">{title}</h3>
      {data.length ? (
        <div className="space-y-3">
          {data.map((item) => {
            const lowSample = item.value < 10;
            const conversionRate = item.value
              ? (item.converted / item.value) * 100
              : 0;
            return (
              <div
                key={item.name}
                className={lowSample ? "text-stone-400" : "text-stone-700"}
              >
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate">{item.name}</span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {item.converted} / {item.value}
                  </span>
                </div>
                <div
                  className={`h-1.5 overflow-hidden rounded-full ${lowSample ? "bg-stone-100" : "bg-stone-200"}`}
                  role="img"
                  aria-label={`${item.converted} conversions out of ${item.value} enquiries`}
                >
                  <div
                    className={`h-full rounded-full ${lowSample ? "bg-stone-300" : "bg-red-700"}`}
                    style={{ width: `${Math.min(100, conversionRate)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-stone-500">No enquiries in this selection</p>
      )}
    </div>
  );
}

function FunnelDiagram({
  stages,
  selectedStage,
  onSelect,
}: {
  stages: { name: string; count: number }[];
  selectedStage: string | null;
  onSelect: (stage: string) => void;
}) {
  const total = stages[0]?.count ?? 0;
  if (!total) {
    return (
      <div className="flex min-h-56 items-center justify-center text-sm text-stone-500">
        No enquiries in this selection
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Enquiry conversion funnel"
      className="space-y-1 rounded-lg px-1 py-2 sm:px-3"
    >
      {stages.map((stage, index) => {
        const previousCount = index === 0 ? null : stages[index - 1].count;
        const stepRate =
          previousCount === null
            ? null
            : previousCount
              ? (stage.count / previousCount) * 100
              : 0;
        const dropOff =
          previousCount === null
            ? null
            : Math.max(0, previousCount - stage.count);
        const isSelected = selectedStage === stage.name;
        const barWidth = Math.min(100, (stage.count / total) * 100);
        return (
          <button
            key={stage.name}
            type="button"
            onClick={() => onSelect(stage.name)}
            aria-pressed={isSelected}
            aria-label={`${stage.name}: ${stage.count} enquiries, ${pct(stage.count, total)} of total${stepRate === null ? "" : `, ${Math.round(stepRate)}% conversion from previous stage, ${dropOff} dropped off`}. Show matching names`}
            className={`group block w-full rounded-lg px-3 py-3 text-left outline-none transition-colors hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2 ${isSelected ? "bg-red-50 ring-1 ring-red-200" : ""}`}
          >
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-sm font-semibold text-stone-800">
                {stage.name}
              </span>
              <span className="text-sm font-semibold tabular-nums text-stone-900">
                {stage.count.toLocaleString()}{" "}
                <span className="font-normal text-stone-600">
                  · {pct(stage.count, total)} of total
                </span>
              </span>
            </div>
            <div
              className="h-3 overflow-hidden rounded-full bg-stone-100"
              aria-hidden="true"
            >
              <div
                className={`h-full rounded-full transition-[width,background-color] ${isSelected ? "bg-red-800" : "bg-red-700 group-hover:bg-red-800"}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600">
              {stepRate === null ? (
                <span>Starting enquiries</span>
              ) : (
                <>
                  <span>
                    Step conversion: <strong className="text-stone-800">{pct(stage.count, previousCount ?? 0)}</strong>
                  </span>
                  <span>
                    Drop-off: <strong className="text-stone-800">{dropOff?.toLocaleString()}</strong> ({pct(dropOff ?? 0, previousCount ?? 0)})
                  </span>
                </>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function SalesAnalytics({
  registrations,
}: {
  registrations: TrialRegistration[];
}) {
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<string | null>(
    null,
  );

  const data = useMemo(() => {
    const total = registrations.length;
    const booked = registrations.filter(
      (r) => Boolean(r.trialDate) && r.status !== "cancelled",
    ).length;
    const attended = registrations.filter((r) => r.status === "show").length;
    const converted = registrations.filter(
      (r) => r.leadOutcome === "joined",
    ).length;
    const dayMap = new Map<
      string,
      {
        day: string;
        enquiries: number;
        conversions: number;
        direct: number;
        followUp: number;
      }
    >();
    type GroupCount = { name: string; value: number; converted: number };
    const groups = {
      program: new Map<string, GroupCount>(),
      center: new Map<string, GroupCount>(),
      mode: new Map<string, GroupCount>(),
      temp: new Map<string, GroupCount>(),
    };
    const addGroup = (
      map: Map<string, GroupCount>,
      key: string,
      name: string,
      wasConverted: boolean,
    ) => {
      const entry = map.get(key) || { name, value: 0, converted: 0 };
      entry.value++;
      if (wasConverted) entry.converted++;
      map.set(key, entry);
    };

    for (const registration of registrations) {
      const day = dateOf(registration);
      if (day) {
        const entry = dayMap.get(day) || {
          day,
          enquiries: 0,
          conversions: 0,
          direct: 0,
          followUp: 0,
        };
        entry.enquiries++;
        if (registration.leadOutcome === "joined") entry.conversions++;
        if (registration.trialDate && registration.status !== "cancelled") {
          if (registration.bookingOrigin === "direct") entry.direct++;
          if (registration.bookingOrigin === "follow-up") entry.followUp++;
        }
        dayMap.set(day, entry);
      }

      const wasConverted = registration.leadOutcome === "joined";
      const programName =
        registration.programInterest?.trim().replace(/\s+/g, " ") ||
        "Unspecified";
      addGroup(
        groups.program,
        normalizeKey(programName),
        programName,
        wasConverted,
      );

      const centerId = getRegistrationCenter(registration);
      const centerName =
        registration.trialMode === "online"
          ? "Online"
          : OFFLINE_CENTERS.find((center) => center.id === centerId)?.name ||
            "Unassigned center";
      addGroup(
        groups.center,
        registration.trialMode === "online" ? "online" : centerId || "unassigned",
        centerName,
        wasConverted,
      );

      const modeName =
        getLocationType(registration) === "online" ? "Online" : "Offline";
      addGroup(groups.mode, normalizeKey(modeName), modeName, wasConverted);
      const tempName = registration.leadTemp
        ? registration.leadTemp[0].toUpperCase() +
          registration.leadTemp.slice(1)
        : "Warm";
      addGroup(groups.temp, normalizeKey(tempName), tempName, wasConverted);
    }

    const breakdown = (map: Map<string, GroupCount>) =>
      [...map.values()].sort((a, b) => b.value - a.value);
    return {
      total,
      booked,
      attended,
      converted,
      days: [...dayMap.values()].sort((a, b) => a.day.localeCompare(b.day)),
      program: breakdown(groups.program),
      center: breakdown(groups.center),
      mode: breakdown(groups.mode),
      temp: breakdown(groups.temp),
    };
  }, [registrations]);

  const funnel = [
    { name: "Enquiry", count: data.total },
    { name: "Slot booked", count: data.booked },
    { name: "Show", count: data.attended },
    { name: "Converted", count: data.converted },
  ];
  const selectedRegistrations =
    selectedFunnelStage === "Enquiry"
      ? registrations
      : selectedFunnelStage === "Slot booked"
        ? registrations.filter(
            (r) => Boolean(r.trialDate) && r.status !== "cancelled",
          )
        : selectedFunnelStage === "Show"
          ? registrations.filter((r) => r.status === "show")
          : selectedFunnelStage === "Converted"
            ? registrations.filter((r) => r.leadOutcome === "joined")
            : [];

  return (
    <section
      aria-labelledby="sales-analytics-heading"
      className="w-full min-w-0 space-y-4"
    >
      <h2 id="sales-analytics-heading" className="text-lg font-semibold text-stone-900">
        Sales analytics
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total enquiries", data.total, "All records in current filters"],
          ["Slot booked", pct(data.booked, data.total), `${data.booked} of ${data.total} enquiries`],
          ["Show", pct(data.attended, data.booked), `${data.attended} of ${data.booked} booked slots`],
          ["Conversion", pct(data.converted, data.total), `${data.converted} joined enquiries`],
        ].map(([label, value, hint]) => (
          <div key={String(label)} className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-stone-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
            <p className="mt-1 text-xs text-stone-500">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="mb-1 text-sm font-semibold text-stone-800">Enquiry to conversion funnel</h3>
          <p className="mb-2 text-xs text-stone-600">Choose a stage to view matching enquiry names.</p>
          <FunnelDiagram
            stages={funnel}
            selectedStage={selectedFunnelStage}
            onSelect={setSelectedFunnelStage}
          />
          {selectedFunnelStage && (
            <div className="mt-3 border-t border-stone-100 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-stone-800">
                  {selectedFunnelStage} ({selectedRegistrations.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedFunnelStage(null)}
                  className="text-xs font-medium text-red-700 hover:text-red-800"
                >
                  Close
                </button>
              </div>
              <ul className="max-h-64 divide-y divide-stone-100 overflow-auto">
                {selectedRegistrations.map((registration) => (
                  <li
                    key={registration.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2 text-sm"
                  >
                    <span className="font-medium text-stone-800">
                      {registration.studentName || "Unnamed enquiry"}
                    </span>
                    <span className="text-xs text-stone-600">
                      {registration.contactNumber || "No contact"} · {statusLabel(registration.status)}
                    </span>
                  </li>
                ))}
              </ul>
              {selectedRegistrations.length === 0 && (
                <p className="py-2 text-xs text-stone-500">No matching enquiries.</p>
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-stone-800">Daily enquiries and conversions (IST)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.days} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={(day) => formatChartDay(String(day))} />
                <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(day) => formatChartDay(String(day), true)} />
                <Legend verticalAlign="bottom" height={30} />
                <Bar yAxisId="left" dataKey="enquiries" name="Enquiries" fill="#b91c1c" radius={[3, 3, 0, 0]} />
                <Line yAxisId="right" dataKey="conversions" name="Conversions" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 4, fill: "#1d4ed8", strokeWidth: 1 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-stone-800">Direct bookings vs booked after follow-up</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data.days} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={(day) => formatChartDay(String(day))} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(day) => formatChartDay(String(day), true)} />
                <Legend verticalAlign="bottom" height={30} />
                <Bar dataKey="direct" name="Direct bookings" stackId="bookings" fill="#b91c1c" />
                <Bar dataKey="followUp" name="Booked after follow-up" stackId="bookings" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 items-start gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Breakdown title="Conversion by program" data={data.program} />
        <Breakdown title="Conversion by center" data={data.center} />
        <Breakdown title="Conversion by mode" data={data.mode} />
        <Breakdown title="Conversion by lead temperature" data={data.temp} />
      </div>
    </section>
  );
}
