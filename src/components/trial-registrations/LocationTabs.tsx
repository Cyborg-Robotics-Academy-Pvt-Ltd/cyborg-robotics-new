"use client";

import React from "react";
import { Globe, Inbox, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocationFilter } from "@/app/enquire-form/types";

type Props = {
  locationFilter: LocationFilter;
  onChange: (value: LocationFilter) => void;
  counts: { all: number; online: number; offline: number };
};

export function LocationTabs({ locationFilter, onChange, counts }: Props) {
  return (
    <div className="mt-6 border-b border-stone-200">
      <div className="flex gap-6">
        <LocationTab
          label="All"
          count={counts.all}
          active={locationFilter === "all"}
          onClick={() => onChange("all")}
          icon={<Inbox className="h-4 w-4" />}
        />

        <LocationTab
          label="Online"
          count={counts.online}
          active={locationFilter === "online"}
          onClick={() => onChange("online")}
          icon={<Globe className="h-4 w-4" />}
        />

        <LocationTab
          label="Offline"
          count={counts.offline}
          active={locationFilter === "offline"}
          onClick={() => onChange("offline")}
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}

function LocationTab({
  label,
  count,
  active,
  onClick,
  icon,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors",
        active ? "text-orange-600" : "text-stone-500 hover:text-stone-800",
      )}
    >
      {icon}

      <span>{label}</span>

      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs",
          active
            ? "bg-orange-50 text-orange-600"
            : "bg-stone-100 text-stone-500",
        )}
      >
        {count}
      </span>

      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-orange-600" />
      )}
    </button>
  );
}
