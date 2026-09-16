"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { STATUS_OPTIONS } from "@/app/enquire-form/constants";
import { statusStyle } from "@/app/enquire-form/utils";

type Props = {
  total: number;
  statusFilter: string;
  onChange: (value: string) => void;
  statusCounts: Record<string, number>;
};

export function StatusChips({
  total,
  statusFilter,
  onChange,
  statusCounts,
}: Props) {
  return (
    <div className="mb-6 mt-5 flex flex-wrap gap-2">
      <StatChip
        label="Total"
        count={total}
        active={statusFilter === "all"}
        onClick={() => onChange("all")}
      />

      {STATUS_OPTIONS.map((option) => (
        <StatChip
          key={option.value}
          label={option.label}
          count={statusCounts[option.value] || 0}
          dotClass={statusStyle(option.value).dot}
          active={statusFilter === option.value}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

function StatChip({
  label,
  count,
  active,
  dotClass,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  dotClass?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-orange-300 bg-orange-50 text-orange-700"
          : "border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700",
      )}
    >
      {dotClass && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />
      )}

      {label}

      <span className="tabular-nums text-stone-400">{count}</span>
    </button>
  );
}
