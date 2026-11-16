"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authReady } from "@/lib/firebase";
import { getTrialModeFromCoordinates } from "@/lib/trial-location";
import {
  DEFAULT_OFFLINE_TRIAL_SLOTS,
  DEFAULT_ONLINE_TRIAL_SLOTS,
  type TrialAvailabilityOverrides,
} from "@/lib/trial-availability";
import { formatTrialTime } from "@/app/enquire-form/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type LocationSuggestion = {
  id: string;
  lat: number;
  lng: number;
  displayName: string;
};

const PROGRAM_OPTIONS = [
  "Year Long Course",
  "Regular Classes",
  "Competition",
  "Camp",
  "Workshop",
];

const REFERRAL_OPTIONS = [
  "Facebook",
  "Instagram",
  "Google Search",
  "Friend / Family",
  "walk-in / Signboard",
];

function calculateAge(dateOfBirth: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return null;
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const birthDate = new Date(year, month - 1, day);
  if (
    birthDate.getFullYear() !== year ||
    birthDate.getMonth() + 1 !== month ||
    birthDate.getDate() !== day
  ) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age -= 1;
  }
  if (age < 0) return null;
  return age;
}

function getTodayDateInput() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

function getTomorrowDateInput() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
  return `${tomorrow.getFullYear()}-${month}-${day}`;
}

function getManualBookingTimes(
  mode: "online" | "offline",
  date: string,
  configured?: string[],
) {
  if (new Date(`${date}T00:00:00.000Z`).getUTCDay() === 2) return [];
  if (configured?.length) return configured;
  return mode === "offline"
    ? DEFAULT_OFFLINE_TRIAL_SLOTS
    : DEFAULT_ONLINE_TRIAL_SLOTS;
}

export function ManualEnquiryDialog({ open, onOpenChange }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [selectedTrialMode, setSelectedTrialMode] = useState<"online" | "offline" | null>(null);
  const [trialDate, setTrialDate] = useState("");
  const [trialTime, setTrialTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const detectedTrialMode = selectedLocation
    ? getTrialModeFromCoordinates(selectedLocation.lat, selectedLocation.lng).trialMode
    : null;
  const trialMode = selectedTrialMode ?? detectedTrialMode;

  useEffect(() => {
    if (!trialDate || !trialMode || !selectedLocation) {
      setAvailableTimes([]);
      setTrialTime("");
      setAvailabilityError("");
      setAvailabilityLoading(false);
      return;
    }

    const controller = new AbortController();
    setAvailabilityLoading(true);
    setAvailabilityError("");
    fetch(
      `/api/free-trial/availability?mode=${trialMode}&from=${trialDate}&to=${trialDate}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        const result = (await response.json()) as {
          success?: boolean;
          availability?: TrialAvailabilityOverrides;
          message?: string;
        };
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load trial times.");
        }
        const slots = getManualBookingTimes(
          trialMode,
          trialDate,
          result.availability?.[trialDate],
        );
        if (!controller.signal.aborted) setAvailableTimes(slots);
      })
      .catch((loadError: unknown) => {
        if (!controller.signal.aborted) {
          setAvailabilityError(
            loadError instanceof Error ? loadError.message : "Unable to load trial times.",
          );
          setAvailableTimes([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAvailabilityLoading(false);
      });

    return () => controller.abort();
  }, [trialDate, trialMode, selectedLocation]);

  useEffect(() => {
    const search = location.trim();
    if (search.length < 3 || selectedLocation?.displayName === search) {
      setLocationSuggestions([]);
      setLocationLoading(false);
      return;
    }

    const controller = new AbortController();
    setLocationLoading(true);
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=3&q=${encodeURIComponent(search)}`,
          { signal: controller.signal, headers: { Accept: "application/json" } },
        );
        if (!response.ok) throw new Error("Unable to find location.");
        const results = (await response.json()) as Array<{
          lat: string;
          lon: string;
          display_name: string;
          place_id: number;
        }>;
        if (controller.signal.aborted) return;
        setLocationSuggestions(
          results
            .map((result) => ({
              id: String(result.place_id),
              lat: Number(result.lat),
              lng: Number(result.lon),
              displayName: result.display_name,
            }))
            .filter((result) => Number.isFinite(result.lat) && Number.isFinite(result.lng)),
        );
      } catch (searchError) {
        if (!controller.signal.aborted) {
          console.error("Unable to search enquiry location:", searchError);
          setLocationSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) setLocationLoading(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [location, selectedLocation]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(
      formData.entries(),
    );
    if (!selectedLocation) {
      setError("Please select your location from the suggestions.");
      return;
    }
    if (!trialDate || !trialTime) {
      setError("Select a trial date and time before adding the enquiry.");
      return;
    }
    payload.location = selectedLocation.displayName;
    payload.latitude = selectedLocation.lat;
    payload.longitude = selectedLocation.lng;
    payload.trialMode = trialMode;
    payload.trialDate = trialDate;
    payload.trialTime = trialTime;
    const age = calculateAge(String(payload.dateOfBirth ?? ""));
    if (age === null || age < 4 || age > 18) {
      setError("Student age must be between 4 and 18.");
      return;
    }
    payload.age = age;
    delete payload.dateOfBirth;
    setSaving(true);
    setError("");

    try {
      const auth = await authReady;
      const token = await auth?.currentUser?.getIdToken();
      if (!token) throw new Error("Please sign in before adding an enquiry.");

      const response = await fetch("/api/enquire-form/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create the enquiry.");
      }

      formRef.current?.reset();
      setLocation("");
      setSelectedLocation(null);
      setSelectedTrialMode(null);
      setDateOfBirth("");
      setTrialDate("");
      setTrialTime("");
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create the enquiry. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setError("");
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        <div className="bg-gradient-to-br from-[#7f1114] via-[#a81b1e] to-[#e4572e] px-5 py-5 text-white sm:px-7">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Trial Registration</DialogTitle>
            <DialogDescription className="text-white/80">
              Enter the same student and location details collected by the free-trial form.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form ref={formRef} onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
          <div className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:col-span-2 sm:grid-cols-2 sm:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:col-span-2">Student details</h3>
            <label className="grid gap-1.5 text-sm font-medium text-stone-700 sm:col-span-2">
              <span>Child&apos;s name <span aria-hidden="true" className="text-red-600">*</span></span>
              <input name="studentName" required maxLength={120} placeholder="e.g., Aarav Patil" className="h-11 rounded-md border border-gray-200 bg-white px-3 font-normal outline-none placeholder:text-stone-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-stone-700">
              <span>Date of birth <span aria-hidden="true" className="text-red-600">*</span></span>
              <input
                name="dateOfBirth"
                type="date"
                max={getTodayDateInput()}
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                required
                className="h-11 rounded-md border border-gray-200 bg-white px-3 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
              <span className="text-xs font-normal text-stone-400">
                Choose the child&apos;s birth date.
              </span>
              {dateOfBirth && (
                <span className="text-xs font-normal text-stone-500" aria-live="polite">
                  {calculateAge(dateOfBirth) === null
                    ? "Enter a valid date of birth."
                    : `Age: ${calculateAge(dateOfBirth)} years`}
                </span>
              )}
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-stone-700">
              <span>Contact number <span aria-hidden="true" className="text-red-600">*</span></span>
              <input name="contactNumber" type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} required placeholder="Parent/guardian’s 10-digit number" className="h-11 rounded-md border border-gray-200 bg-white px-3 font-normal outline-none placeholder:text-stone-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-stone-700 sm:col-span-2">
              <span>Email <span aria-hidden="true" className="text-red-600">*</span></span>
              <input name="email" type="email" required maxLength={254} placeholder="Parent/guardian’s email address" className="h-11 rounded-md border border-gray-200 bg-white px-3 font-normal outline-none placeholder:text-stone-400 focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </label>
          </div>

          <div className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:col-span-2 sm:grid-cols-2 sm:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:col-span-2">Program and location</h3>
            <label className="grid gap-1.5 text-sm font-medium text-stone-700">
              <span>Program interest <span aria-hidden="true" className="text-red-600">*</span></span>
              <select name="programInterest" required defaultValue="" className="h-11 rounded-md border border-gray-200 bg-white px-3 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100">
                <option value="" disabled>Select a program</option>
                {PROGRAM_OPTIONS.map((program) => <option key={program} value={program}>{program}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-stone-700">
              <span>Neighborhood or city <span aria-hidden="true" className="text-red-600">*</span></span>
              <div className="relative">
                <input
                  name="location"
                  required
                  maxLength={200}
                  autoComplete="off"
                  value={location}
                  onChange={(event) => {
                    setLocation(event.target.value);
                    setSelectedLocation(null);
                    setSelectedTrialMode(null);
                    setLocationSuggestions([]);
                  }}
                  placeholder="e.g., Kalyani Nagar, Pune"
                  className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 pr-10 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
                {locationLoading && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-red-600" />
                )}
                {locationSuggestions.length > 0 && (
                  <div role="listbox" aria-label="Location suggestions" className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    {locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        role="option"
                        aria-selected={false}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setLocation(suggestion.displayName);
                          setSelectedLocation(suggestion);
                          setSelectedTrialMode(
                            getTrialModeFromCoordinates(
                              suggestion.lat,
                              suggestion.lng,
                            ).trialMode,
                          );
                          setTrialDate("");
                          setTrialTime("");
                          setLocationSuggestions([]);
                        }}
                        className="w-full px-3 py-2.5 text-left text-sm text-stone-700 hover:bg-red-50"
                      >
                        {suggestion.displayName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedLocation && (
                <span role="status" className="text-xs text-emerald-700">
                  Location selected.
                </span>
              )}
              {!selectedLocation && !locationLoading && location.trim().length >= 3 && locationSuggestions.length === 0 && (
                <span role="status" className="text-xs text-stone-500">
                  No matching locations. Try a nearby area or city.
                </span>
              )}
            </label>
            <fieldset className="grid gap-2 sm:col-span-2">
              <legend className="mb-1 text-sm font-medium text-stone-700">How did you hear about us? <span aria-hidden="true" className="text-red-600">*</span></legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {REFERRAL_OPTIONS.map((option) => (
                  <label key={option} className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-2 text-xs text-stone-700 hover:border-red-300">
                    <input type="radio" name="referralSource" value={option} required className="accent-red-700" />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 sm:col-span-2 sm:grid-cols-2 sm:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:col-span-2">
              Book a trial
            </h3>
            {!selectedLocation && (
              <p className="text-xs text-stone-500 sm:col-span-2">
                Select a location from the suggestions above to enable trial booking.
              </p>
            )}
            <fieldset className="grid gap-2 sm:col-span-2">
              <legend className="text-sm font-medium text-stone-700">
                Trial type <span aria-hidden="true" className="text-red-600">*</span>
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {(["online", "offline"] as const).map((mode) => (
                  <label
                    key={mode}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                      trialMode === mode
                        ? "border-red-700 bg-red-50 text-red-800 ring-1 ring-red-200"
                        : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="trialModeChoice"
                      value={mode}
                      required
                      checked={trialMode === mode}
                      disabled={!selectedLocation}
                      onChange={() => setSelectedTrialMode(mode)}
                      className="accent-red-700"
                    />
                    {mode}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-1.5 text-sm font-medium text-stone-700">
              <span>Trial date <span aria-hidden="true" className="text-red-600">*</span></span>
              <input
                type="date"
                min={getTomorrowDateInput()}
                value={trialDate}
                required
                aria-required="true"
                aria-label="Select a trial date"
                onChange={(event) => {
                  setTrialDate(event.target.value);
                  setTrialTime("");
                }}
                disabled={!selectedLocation}
                className="h-11 rounded-md border border-gray-200 bg-white px-3 font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-stone-100"
              />
              <span className="text-xs font-normal text-stone-400">
                Choose a date to see available trial times.
              </span>
            </label>
            <div className="grid gap-1.5 text-sm font-medium text-stone-700">
              <span>
                Trial time <span aria-hidden="true" className="text-red-600">*</span>
              </span>
              <div
                role="group"
                aria-label="Trial time"
                aria-required="true"
                className="flex min-h-11 flex-wrap gap-2"
              >
                {availabilityLoading ? (
                  <span className="inline-flex items-center gap-2 text-xs font-normal text-stone-500">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading times...
                  </span>
                ) : availabilityError ? (
                  <span role="alert" className="text-xs font-normal text-red-700">
                    {availabilityError}
                  </span>
                ) : availableTimes.length ? (
                  availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      aria-pressed={trialTime === time}
                      onClick={() => setTrialTime(time)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                        trialTime === time
                          ? "border-red-700 bg-red-700 text-white"
                          : "border-stone-200 bg-white text-stone-700 hover:border-red-300"
                      }`}
                    >
                      {formatTrialTime(time)}
                    </button>
                  ))
                ) : (
                  <span className="self-center text-xs font-normal text-stone-500">
                    {!selectedLocation
                      ? "Select a location first."
                      : trialDate
                        ? "No times available on this date. Choose another date."
                        : "Select a date to see times."}
                  </span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700 sm:col-span-2">
              {error}
            </p>
          )}

          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-red-700 hover:bg-red-800">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add enquiry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
