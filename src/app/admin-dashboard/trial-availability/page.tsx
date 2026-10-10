"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock3, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";

import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminUserData } from "@/lib/admin-utils";
import { useAuth } from "@/lib/auth-context";
import {
  DEFAULT_OFFLINE_TRIAL_SLOTS,
  DEFAULT_ONLINE_TRIAL_SLOTS,
  getDefaultTrialSlots,
  isValidTrialDate,
  isValidTrialTime,
} from "@/lib/trial-availability";
import type { TrialMode } from "@/lib/trial-location";

function getTomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function TrialAvailabilityPage() {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();
  const [authReady, setAuthReady] = useState(false);
  const [mode, setMode] = useState<TrialMode>("offline");
  const [date, setDate] = useState(getTomorrow);
  const [slots, setSlots] = useState<string[]>([]);
  const [timeInput, setTimeInput] = useState("");
  const [hasOverride, setHasOverride] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || userRole !== "admin") {
      router.push("/login");
      return;
    }

    let active = true;
    getAdminUserData(user.uid)
      .then((adminData) => {
        if (!active) return;
        if (!adminData) {
          router.push("/create-user");
          return;
        }
        setAuthReady(true);
      })
      .catch((authError: unknown) => {
        console.error("Unable to verify trial availability admin:", authError);
        if (active) setError("Unable to verify admin access. Please try again.");
      });

    return () => {
      active = false;
    };
  }, [user, userRole, authLoading, router]);

  const loadAvailability = useCallback(async () => {
    if (!user || !isValidTrialDate(date)) return;

    setLoadingAvailability(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch(
        `/api/free-trial/availability?mode=${mode}&from=${date}&to=${date}`,
      );
      const result = (await response.json()) as {
        success: boolean;
        availability?: Record<string, string[]>;
        message?: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load availability.");
      }
      const configuredSlots = result.availability?.[date];
      setHasOverride(configuredSlots !== undefined);
      setSlots(
        configuredSlots ??
          getDefaultTrialSlots(mode, date),
      );
    } catch (loadError) {
      console.error("Unable to load trial availability:", loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load availability.",
      );
    } finally {
      setLoadingAvailability(false);
    }
  }, [user, mode, date]);

  useEffect(() => {
    if (authReady) void loadAvailability();
  }, [authReady, loadAvailability]);

  const saveAvailability = async (slotsToSave = slots) => {
    if (!user) return;
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/free-trial/availability", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode, date, slots: slotsToSave }),
      });
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save availability.");
      }
      setSlots(slotsToSave);
      setHasOverride(true);
      setNotice(
        slotsToSave.length === 0
          ? "Date closed. It is disabled in the booking calendar."
          : "Availability saved. The booking calendar is updated.",
      );
    } catch (saveError) {
      console.error("Unable to save trial availability:", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save availability.",
      );
    } finally {
      setSaving(false);
    }
  };

  const resetAvailability = async () => {
    if (!user || !hasOverride) return;
    setSaving(true);
    setNotice("");
    setError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/free-trial/availability?mode=${mode}&date=${date}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to reset availability.");
      }
      setHasOverride(false);
      setSlots(getDefaultTrialSlots(mode, date));
      setNotice("The default availability schedule has been restored.");
    } catch (resetError) {
      console.error("Unable to reset trial availability:", resetError);
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to reset availability.",
      );
    } finally {
      setSaving(false);
    }
  };

  const addTime = () => {
    if (!isValidTrialTime(timeInput)) {
      setError("Enter a valid time in 24-hour format.");
      return;
    }
    if (slots.includes(timeInput)) {
      setError("That time is already on this date.");
      return;
    }
    setSlots((current) => [...current, timeInput].sort());
    setTimeInput("");
    setError("");
    setNotice("");
  };

  if (authLoading || !authReady) return <AuthLoadingSpinner />;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <Button
            variant="ghost"
            className="mb-3"
            onClick={() => router.push("/admin-dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Trial availability
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Set the exact dates and times parents can book. Saving an empty
            schedule closes that date, including a weekend holiday. Add times
            to open any date, including weekdays.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Trial mode
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as TrialMode)}
                className="h-11 rounded-md border border-slate-300 bg-white px-3 font-normal"
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Date
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
          </div>

          <div className="mt-7 border-t border-slate-100 pt-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Visible booking times
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {hasOverride
                    ? "Custom schedule for this date."
                    : "Default schedule. Change and save to override this date."}
                </p>
              </div>
              {loadingAvailability && (
                <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {slots.length ? (
                slots.map((slot) => (
                  <span
                    key={slot}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    <Clock3 className="h-4 w-4 text-slate-500" />
                    {slot}
                    <button
                      type="button"
                      aria-label={`Remove ${slot}`}
                      onClick={() => {
                        setSlots((current) => current.filter((value) => value !== slot));
                        setNotice("");
                      }}
                      className="text-slate-400 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  No trial times are available on this date.
                </p>
              )}
            </div>

            <div className="mt-4 flex max-w-sm gap-2">
              <Input
                type="time"
                value={timeInput}
                onChange={(event) => setTimeInput(event.target.value)}
                aria-label="New trial time"
              />
              <Button type="button" variant="outline" onClick={addTime}>
                <Plus className="mr-1 h-4 w-4" />
                Add time
              </Button>
            </div>

            {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
            {notice && <p role="status" className="mt-4 text-sm text-green-700">{notice}</p>}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => saveAvailability()} disabled={saving || loadingAvailability || !isValidTrialDate(date)}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save availability
              </Button>
              <Button
                variant="outline"
                onClick={() => saveAvailability([])}
                disabled={
                  saving ||
                  loadingAvailability ||
                  !isValidTrialDate(date) ||
                  (hasOverride && slots.length === 0)
                }
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Close date / holiday
              </Button>
              <Button
                variant="outline"
                onClick={resetAvailability}
                disabled={saving || loadingAvailability || !hasOverride}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore default
              </Button>
            </div>
          </div>
        </section>

        <p className="mt-4 text-xs text-slate-500">
          Defaults: offline trials run Saturday/Sunday (
          {DEFAULT_OFFLINE_TRIAL_SLOTS.join(", ")}); online trials run
          Monday–Saturday ({DEFAULT_ONLINE_TRIAL_SLOTS.join(", ")}). A saved
          date-specific schedule takes precedence.
        </p>
      </div>
    </main>
  );
}
