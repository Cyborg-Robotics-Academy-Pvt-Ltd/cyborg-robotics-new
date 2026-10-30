export type TimelineTone =
  | "blue"
  | "indigo"
  | "amber"
  | "orange"
  | "emerald"
  | "violet"
  | "red"
  | "slate";

export const TIMELINE_TONES: Record<
  TimelineTone,
  { marker: string; title: string }
> = {
  blue: {
    marker: "border-blue-200 bg-blue-50 text-blue-700",
    title: "text-blue-800",
  },
  indigo: {
    marker: "border-indigo-200 bg-indigo-50 text-indigo-700",
    title: "text-indigo-800",
  },
  amber: {
    marker: "border-amber-200 bg-amber-50 text-amber-700",
    title: "text-amber-800",
  },
  orange: {
    marker: "border-orange-200 bg-orange-50 text-orange-700",
    title: "text-orange-800",
  },
  emerald: {
    marker: "border-emerald-200 bg-emerald-50 text-emerald-700",
    title: "text-emerald-800",
  },
  violet: {
    marker: "border-violet-200 bg-violet-50 text-violet-700",
    title: "text-violet-800",
  },
  red: {
    marker: "border-red-200 bg-red-50 text-red-700",
    title: "text-red-800",
  },
  slate: {
    marker: "border-slate-200 bg-slate-100 text-slate-600",
    title: "text-slate-700",
  },
};

export function getLeadOutcomeTone(outcome?: string): TimelineTone {
  switch (outcome) {
    case "opened":
      return "blue";
    case "closed":
      return "red";
    case "joined":
      return "emerald";
    case "nurture":
      return "violet";
    case "later":
      return "slate";
    default:
      return "orange";
  }
}
