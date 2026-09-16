import { EditDraft } from "./types";

/* =========================================================
   OFFLINE CENTERS
========================================================= */

export const OFFLINE_CENTERS = [
  {
    id: "kalyani-nagar-pune",
    name: "Kalyani Nagar, Pune",
    keywords: ["kalyani nagar", "kalyani nagar pune", "kalyani"],
  },

  {
    id: "kharadi-pune",
    name: "Kharadi, Pune",
    keywords: ["kharadi", "kharadi pune"],
  },

  {
    id: "magarpatta-pune",
    name: "Magarpatta, Pune",
    keywords: ["magarpatta", "magarpatta pune", "magarpatta city"],
  },
];

/* =========================================================
   TRIAL STATUS
========================================================= */

export const STATUS_OPTIONS = [
  { value: "booked", label: "Booked" },
  { value: "show", label: "Show" },
  { value: "no-show", label: "No Show" },
  { value: "reschedule", label: "Reschedule" },
  { value: "cancelled", label: "Cancelled" },
];

export const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  booked: { dot: "bg-blue-500", text: "text-blue-700" },
  show: { dot: "bg-emerald-500", text: "text-emerald-700" },
  "no-show": { dot: "bg-stone-400", text: "text-stone-500" },
  reschedule: { dot: "bg-amber-500", text: "text-amber-700" },
  cancelled: { dot: "bg-red-500", text: "text-red-700" },
};

/* =========================================================
   LEAD TEMP
========================================================= */

export const LEAD_TEMP_OPTIONS = [
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
];

export const LEAD_TEMP_STYLES: Record<string, { dot: string; text: string }> = {
  hot: { dot: "bg-red-500", text: "text-red-700" },
  warm: { dot: "bg-amber-500", text: "text-amber-700" },
  cold: { dot: "bg-sky-500", text: "text-sky-700" },
};

/* =========================================================
   LEAD OUTCOME
========================================================= */

export const LEAD_OUTCOME_OPTIONS = [
  { value: "opened", label: "Opened" },
  { value: "closed", label: "Closed" },
  { value: "nurture", label: "Nurture" },
  { value: "later", label: "Later" },
];

export const LEAD_OUTCOME_STYLES: Record<string, { dot: string; text: string }> = {
  opened: { dot: "bg-blue-500", text: "text-blue-700" },
  closed: { dot: "bg-emerald-500", text: "text-emerald-700" },
  nurture: { dot: "bg-violet-500", text: "text-violet-700" },
  later: { dot: "bg-stone-400", text: "text-stone-500" },
};

/* =========================================================
   AVATARS
========================================================= */

export const AVATAR_SHADES = [
  "from-orange-500 to-red-600",
  "from-amber-500 to-orange-600",
  "from-red-500 to-rose-600",
  "from-orange-600 to-red-700",
];

/* =========================================================
   EMPTY DRAFT
========================================================= */

export const EMPTY_DRAFT: EditDraft = {
  studentName: "",
  age: "",
  contactNumber: "",
  email: "",
  trialDate: "",
  trialTime: "",
  location: "",
};
