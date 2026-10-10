"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarClock, Clock3, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { dateToYMD, ymdToDate } from "@/app/enquire-form/utils";
import { TrialRegistration } from "@/app/enquire-form/types";
import {
  getDefaultTrialSlots,
  type TrialAvailabilityOverrides,
} from "@/lib/trial-availability";

type Props = {
  target: TrialRegistration | null;
  onClose: () => void;
  onSave: (id: string, date: string, time: string) => Promise<boolean>;
};

function getMinBookableDate() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date;
}

export function RescheduleDialog({ target, onClose, onSave }: Props) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(getMinBookableDate);
  const [availabilityOverrides, setAvailabilityOverrides] =
    useState<TrialAvailabilityOverrides>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const minBookableDate = getMinBookableDate();
  const targetMode = target?.trialMode === "offline" ? "offline" : "online";
  const selectedSlots = useMemo(() => {
    if (!date) return [];
    return availabilityOverrides[date] ?? getDefaultTrialSlots(targetMode, date);
  }, [availabilityOverrides, date, targetMode]);

  useEffect(() => {
    setDate(target?.trialDate || "");
    setTime(target?.trialTime || "");
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, "0")}`;
    let active = true;
    setAvailabilityLoading(true);
    setAvailabilityError("");

    fetch(
      `/api/free-trial/availability?mode=${targetMode}&from=${from}&to=${to}`,
    )
      .then(async (response) => {
        const result = (await response.json()) as {
          success: boolean;
          availability?: TrialAvailabilityOverrides;
          message?: string;
        };
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load trial availability.");
        }
        if (active) setAvailabilityOverrides(result.availability ?? {});
      })
      .catch((loadError: unknown) => {
        console.error("Unable to load trial availability:", loadError);
        if (active) {
          setAvailabilityError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load trial availability.",
          );
        }
      })
      .finally(() => {
        if (active) setAvailabilityLoading(false);
      });

    return () => {
      active = false;
    };
  }, [target, targetMode, visibleMonth]);

  const save = async () => {
    if (!target || !date || !time) return;

    setSaving(true);
    const saved = await onSave(target.id, date, time);
    setSaving(false);

    if (saved) onClose();
  };

  return (
    <Dialog open={Boolean(target)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-orange-600" />
            Reschedule trial
          </DialogTitle>
          <DialogDescription>
            Choose a new date and time for {target?.studentName}&apos;s trial. A
            reschedule email will be sent after saving.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-[auto_1fr] sm:items-start">
          <div className="flex justify-center rounded-xl border border-stone-200 p-2">
            <Calendar
              mode="single"
              selected={ymdToDate(date)}
              onSelect={(selectedDate) => {
                setDate(selectedDate ? dateToYMD(selectedDate) : "");
                setTime("");
              }}
              disabled={(calendarDate) =>
                availabilityLoading ||
                Boolean(availabilityError) ||
                calendarDate < minBookableDate ||
                (availabilityOverrides[dateToYMD(calendarDate)] ??
                  getDefaultTrialSlots(
                    targetMode,
                    dateToYMD(calendarDate),
                  )).length === 0
              }
              defaultMonth={minBookableDate}
              onMonthChange={setVisibleMonth}
              className="rounded-md"
            />
          </div>

          <div className="grid gap-2">
            {availabilityError && (
              <p role="alert" className="text-sm text-red-700">
                {availabilityError}
              </p>
            )}
            <span className="flex items-center gap-1.5 text-sm font-medium text-stone-700">
              <Clock3 className="h-3.5 w-3.5 text-orange-600" />
              Select time
            </span>

            {date ? (
              <div className="flex flex-wrap gap-2">
                {selectedSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      time === slot
                        ? "border-orange-600 bg-orange-600 text-white"
                        : "border-stone-200 bg-white text-stone-700 hover:border-orange-200 hover:bg-orange-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400">
                Pick a date to see available time slots.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={save}
            disabled={
              !date ||
              !time ||
              !selectedSlots.includes(time) ||
              availabilityLoading ||
              Boolean(availabilityError) ||
              saving
            }
            className="bg-orange-600 hover:bg-orange-700"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save reschedule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
