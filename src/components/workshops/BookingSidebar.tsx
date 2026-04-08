"use client";

import type { ChangeEvent, ChangeEventHandler, FormEventHandler } from "react";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  Sparkles,
  X,
  ShieldCheck,
  Users,
} from "lucide-react";
import { REGISTRATION_FIELDS } from "./constants";
import type {
  AgeGroup,
  CampLocation,
  LocationId,
  RegistrationFormData,
} from "./types";

type RegistrationFieldId = keyof RegistrationFormData;

interface Props {
  formId?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  locations: CampLocation[];
  activeLocation: CampLocation;
  activeLocationId: LocationId;
  onLocationChange: (id: LocationId) => void;
  selectedAge: AgeGroup;
  formData: RegistrationFormData;
  formError: string;
  formSuccess: string;
  isSubmitting: boolean;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  slotsLeft?: number;
  recentBookings?: number;
}

const inputBase =
  "w-full rounded-lg px-3 py-2 text-[12px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#bbb]";

const inputOk = `${inputBase} border border-[rgba(141,15,17,0.18)] focus:border-[#8D0F11] focus:shadow-[0_0_0_4px_rgba(141,15,17,0.08)]`;
const inputErr = `${inputBase} border border-red-400 bg-red-50/40 focus:border-red-500 focus:shadow-[0_0_0_4px_rgba(239,68,68,0.08)]`;

const validateField = (id: RegistrationFieldId, value: string): string => {
  if (!value.trim()) return "Required";
  if (id === "contactNumber" && !/^[6-9]\d{9}$/.test(value.trim()))
    return "Enter a valid 10-digit mobile number";
  if (id === "age") {
    const n = Number(value);
    if (n < 4 || n > 16) return "Age must be between 4 and 16";
  }
  return "";
};

const BookingSidebar = ({
  formId,
  showCloseButton = false,
  onClose,
  locations,
  activeLocation,
  activeLocationId,
  onLocationChange,
  selectedAge,
  formData,
  formError,
  formSuccess,
  isSubmitting,
  onInputChange,
  onSubmit,
  slotsLeft,
  recentBookings,
}: Props) => {
  const [touched, setTouched] = useState<
    Partial<Record<RegistrationFieldId, boolean>>
  >({});
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<RegistrationFieldId, string>>
  >({});
  const [slotsPulse, setSlotsPulse] = useState(false);

  // Pulse slots-left badge every 4 s to grab attention
  useEffect(() => {
    const t = setInterval(() => {
      setSlotsPulse(true);
      setTimeout(() => setSlotsPulse(false), 600);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const handleBlur = (id: RegistrationFieldId) => {
    setTouched((p) => ({ ...p, [id]: true }));
    setFieldErrors((p) => ({
      ...p,
      [id]: validateField(id, formData[id] ?? ""),
    }));
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onInputChange(e);
    const fieldId = e.target.name as RegistrationFieldId;

    if (touched[fieldId]) {
      setFieldErrors((p) => ({
        ...p,
        [fieldId]: validateField(fieldId, e.target.value),
      }));
    }
  };

  const handleLocationChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onLocationChange(event.target.value as LocationId);
  };

  const filledCount = REGISTRATION_FIELDS.filter(
    (f) => (formData[f.id] ?? "").trim().length > 0,
  ).length;
  const progressPct = Math.round(
    (filledCount / REGISTRATION_FIELDS.length) * 100,
  );

  return (
    <div
      id={formId}
      className="overflow-hidden rounded-[22px] border border-gray-200/10 bg-white shadow-[0_14px_42px_rgba(141,15,17,0.12)]"
    >
      {/* ── Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-700 to-red-900 p-2.5">
        <div className="absolute -right-8 -top-8 h-[120px] w-[120px] rounded-full bg-[rgba(199,62,29,0.2)] blur-[24px]" />

        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking form"
            className="absolute right-2 top-2 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X size={12} />
          </button>
        )}

        <div className="relative z-10">
          {/* Badge row + slots urgency */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-[2px]">
              <Sparkles size={10} className="text-[#ffb89a]" />
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/70">
                Book Your Slot
              </span>
            </div>
          </div>

          <h3 className="mt-1.5 text-[15px] font-black leading-tight text-white">
            Reserve Your Spot
          </h3>

          {/* Context chips */}
          <div className="mt-1.5 flex flex-wrap gap-1">
            {[
              `📍 ${activeLocation.name}`,
              `👦 Age: ${selectedAge}`,
              `⏱ ${activeLocation.totalHours}`,
            ]
              .filter((item) => !item.includes("Age:"))
              .map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-gray-200/10 bg-white/8 px-[7px] py-[2px] text-[9px] font-normal text-white/90"
                >
                  {item}
                </span>
              ))}
          </div>

          {/* Social proof — only shown when recentBookings is passed */}
          {recentBookings !== undefined && (
            <div className="mt-1.5 flex items-center gap-1">
              <Users size={9} className="shrink-0 text-white/50" />
              <p className="text-[9px] font-normal leading-none text-white/55">
                <span className="font-semibold text-white/80">
                  {recentBookings} parents
                </span>{" "}
                booked this week
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="p-2.5">
        {/* Progress bar */}
        {!formSuccess && (
          <div className="mb-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#aaa]">
                Form completion
              </span>
              <span className="text-[9px] font-semibold text-[#8D0F11]">
                {progressPct}%
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(141,15,17,0.08)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#8D0F11] to-[#B92423] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {formError && (
          <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200/60 bg-red-50/70 px-3 py-2.5 text-[12px] font-medium text-red-700">
            <span className="mt-px shrink-0">⚠</span>
            {formError}
          </div>
        )}

        {formSuccess ? (
          <div className="rounded-[18px] border border-emerald-200/70 bg-emerald-50/90 px-4 py-5 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
            <h4 className="mt-3 text-[15px] font-semibold text-[#18351f]">
              You&apos;re on the list! 🎉
            </h4>
            <p className="mt-1 text-[12px] font-normal leading-[1.5] text-emerald-800">
              {formSuccess}
            </p>

            {/* What happens next — reduces post-submit anxiety */}
            <div className="mt-3 rounded-xl border border-emerald-200/50 bg-white/60 px-3 py-2.5 text-left">
              <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-700/70">
                What happens next
              </p>
              {[
                "Our team reviews your request",
                "You'll get a WhatsApp / call within 24 hrs",
                "Payment & final confirmation follows",
              ].map((step, i) => (
                <div
                  key={step}
                  className="mb-1 flex items-start gap-2 last:mb-0"
                >
                  <span className="mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[8px] font-semibold text-emerald-700">
                    {i + 1}
                  </span>
                  <span className="text-[10px] font-normal leading-[1.4] text-emerald-800">
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-2.5 text-[9px] font-medium uppercase tracking-[0.1em] text-emerald-700/60">
              Form resets shortly
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-1.5">
            <div className="rounded-[16px] border border-[rgba(141,15,17,0.08)] bg-[rgba(141,15,17,0.03)] p-2">
              <div className="mb-1 flex items-center gap-1.5">
                <MapPin size={11} className="text-[#8D0F11]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5d3131]">
                  Choose Location
                </p>
              </div>
              <select
                aria-label="Choose workshop location"
                value={activeLocationId}
                onChange={handleLocationChange}
                className={`${inputOk} py-1.5 pr-8 text-[11px]`}
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} - {location.packageDates} -{" "}
                    {location.totalHours}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[9px] leading-[1.35] text-[#8a7777]">
                Selected:{" "}
                <span className="font-semibold">{activeLocation.name}</span> ·{" "}
                {activeLocation.days}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
              {REGISTRATION_FIELDS.map((field) => {
                const err = touched[field.id] ? fieldErrors[field.id] : "";
                return (
                  <div key={field.id} className="flex flex-col gap-[3px]">
                    <label
                      className="text-[11px] font-medium text-[#444]"
                      htmlFor={field.id}
                    >
                      {field.label}
                      <span className="ml-0.5 text-[#8D0F11]">*</span>
                    </label>
                    <input
                      id={field.id}
                      name={field.id}
                      type={field.type}
                      min={field.id === "age" ? "4" : undefined}
                      max={field.id === "age" ? "16" : undefined}
                      required
                      placeholder={field.placeholder}
                      value={formData[field.id]}
                      onChange={handleChange}
                      onBlur={() => handleBlur(field.id)}
                      className={err ? inputErr : inputOk}
                    />
                    {err && (
                      <span className="mt-0.5 text-[10px] font-normal leading-none text-red-500">
                        {err}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Trust signal */}
            <div className="flex items-center gap-1.5 rounded-lg border border-[rgba(141,15,17,0.08)] bg-[rgba(141,15,17,0.03)] px-2.5 py-2">
              <ShieldCheck size={11} className="shrink-0 text-[#8D0F11]/60" />
              <p className="text-[9px] font-normal leading-[1.4] text-[#888]">
                Your details are safe and only used to confirm your seat.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl border-0 bg-gradient-to-br from-[#8D0F11] to-[#B92423] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_8px_20px_rgba(141,15,17,0.26)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(141,15,17,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Saving your spot…
                </span>
              ) : (
                "Reserve My Spot →"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingSidebar;
