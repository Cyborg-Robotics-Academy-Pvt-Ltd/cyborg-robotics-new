"use client";

import React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SortDir, SortField } from "@/app/enquire-form/types";

type Props = {
  label: string;
  field: SortField;
  active: SortField;
  dir: SortDir;
  onClick: (field: SortField) => void;
};

export function SortableHead({ label, field, active, dir, onClick }: Props) {
  const isActive = active === field;

  const Icon = isActive
    ? dir === "asc"
      ? ArrowUp
      : ArrowDown
    : ChevronsUpDown;

  return (
    <TableHead
      onClick={() => onClick(field)}
      className={cn(
        "cursor-pointer select-none text-stone-500 transition-colors hover:text-stone-900",
        isActive && "text-stone-900",
      )}
    >
      <div className="flex items-center gap-1.5">
        {label}

        <Icon
          className={cn(
            "h-3 w-3",
            isActive ? "text-orange-600" : "text-stone-300",
          )}
        />
      </div>
    </TableHead>
  );
}
