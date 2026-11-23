"use client";

import React from "react";
import { LocationFilter } from "@/app/enquire-form/types";
import { cn } from "@/lib/utils";

type Props = {
  locationFilter: LocationFilter;
  onChange: (value: LocationFilter) => void;
  counts: { all: number; online: number; offline: number };
};

const OPTIONS: { value: LocationFilter; label: string; count: keyof Props["counts"] }[] = [
  { value: "all", label: "All", count: "all" },
  { value: "online", label: "Online", count: "online" },
  { value: "offline", label: "Offline", count: "offline" },
];

export function LocationTabs({ locationFilter, onChange, counts }: Props) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = OPTIONS.findIndex((option) => option.value === locationFilter);
    let nextIndex = currentIndex;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % OPTIONS.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + OPTIONS.length) % OPTIONS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = OPTIONS.length - 1;
    else return;
    event.preventDefault();
    const next = OPTIONS[nextIndex].value;
    onChange(next);
    document.getElementById(`enquiry-mode-${next}`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Filter enquiries by mode"
      className="inline-flex h-10 shrink-0 items-center rounded-lg border border-stone-200 bg-stone-100 p-1"
    >
      {OPTIONS.map((option) => {
        const selected = locationFilter === option.value;
        return (
          <button
            key={option.value}
            id={`enquiry-mode-${option.value}`}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-1",
              selected
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900",
            )}
          >
            <span>{option.label}</span>
            <span className={cn("tabular-nums", selected ? "text-stone-700" : "text-stone-500")}>
              {counts[option.count]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
