    import type { TrialMode } from "@/lib/trial-location";
    import { getDefaultTrialSlots, isValidTrialDate, isValidTrialTime } from "@/lib/trial-availability";

        export const MAX_BOOKINGS_PER_SLOT = 3;

    export function getTrimmedString(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
    }

    // Checks presence regardless of type. A required *string* field must be
    // non-empty after trimming; a required *number* field (e.g. age) must be
    // a finite number.
    export function isPresent(value: unknown) {
    if (typeof value === "string") return value.trim().length > 0;
    if (typeof value === "number") return Number.isFinite(value);
    return false;
    }

    function validateRequired(value: unknown, fieldName: string) {
    return isPresent(value) ? null : fieldName;
    }

    // Coerces age to a number whether the client sent it as a JS number
    // (current frontend behavior) or as a string (defensive fallback).
    export function toAgeNumber(value: unknown): number {
    if (typeof value === "number") return value;
    return Number(getTrimmedString(value));
    }

    export type CoreFields = {
    studentName: string;
    age: number;
    contactNumber: string;
    email: string;
    };

    export type ValidationResult =
    | { ok: true; data: CoreFields }
    | { ok: false; message: string };

    // Validates the 4 lead fields that are always required, whether we're
    // creating the initial "incomplete" lead (step 1) or finalizing it (step 2).
    export function validateCoreFields(body: Record<string, unknown>): ValidationResult {
    const { studentName, age, contactNumber, email } = body;

    const missingFields = [
        validateRequired(studentName, "studentName"),
        validateRequired(age, "age"),
        validateRequired(contactNumber, "contactNumber"),
        validateRequired(email, "email"),
    ].filter(Boolean);

    if (missingFields.length > 0) {
        return {
        ok: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        };
    }

    const phone = getTrimmedString(contactNumber);
    if (!/^\d{10}$/.test(phone)) {
        return { ok: false, message: "Contact number must be exactly 10 digits." };
    }

    const parsedAge = toAgeNumber(age);
    if (!Number.isInteger(parsedAge) || parsedAge < 4 || parsedAge > 18) {
        return { ok: false, message: "Student age must be between 4 and 18." };
    }

    const emailAddress = getTrimmedString(email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
        return { ok: false, message: "Please enter a valid email address." };
    }

    return {
        ok: true,
        data: {
        studentName: getTrimmedString(studentName),
        age: parsedAge,
        contactNumber: phone,
        email: emailAddress,
        },
    };
    }

    export type SlotFields = { date: string; time: string };
    export type SlotValidationResult =
    | { ok: true; data: SlotFields }
    | { ok: false; message: string };

    export type ManualTrialRequestResult =
      | { ok: true; remark: string | null }
      | { ok: false; message: string };

    export function validateManualTrialRequest(
      body: Record<string, unknown>,
    ): ManualTrialRequestResult {
      const dateValue = body.requestedTrialDate;
      const timeValue = body.requestedTrialTime;
      const hasDate = typeof dateValue === "string" && dateValue.trim().length > 0;
      const hasTime = typeof timeValue === "string" && timeValue.trim().length > 0;

      const hasAnyInput =
        (dateValue !== undefined &&
          dateValue !== null &&
          dateValue !== "") ||
        (timeValue !== undefined &&
          timeValue !== null &&
          timeValue !== "");

      if (!hasAnyInput) {
        return { ok: true, remark: null };
      }

      if (!hasDate || !hasTime) {
        return {
          ok: false,
          message: "Please enter both a preferred trial date and time.",
        };
      }

      const date = getTrimmedString(dateValue);
      const time = getTrimmedString(timeValue);
      if (!isValidTrialDate(date) || !isValidTrialTime(time)) {
        return {
          ok: false,
          message: "Please enter a valid preferred trial date and time.",
        };
      }

      if (date < new Date().toISOString().slice(0, 10)) {
        return {
          ok: false,
          message: "Preferred trial date cannot be in the past.",
        };
      }

      return {
        ok: true,
        remark: `Requested trial schedule: ${date} at ${time}.`,
      };
    }

        // Validates trialDate/trialTime. Only called when the client actually sent
    // a slot (step 2) — step 1's "incomplete" lead has no slot yet.
   export function validateSlotFields(
  body: Record<string, unknown>,
     trialMode: TrialMode,
     configuredSlots?: string[],
   ): SlotValidationResult {
  const date = getTrimmedString(body.trialDate);
  const time = getTrimmedString(body.trialTime);

  if (!isValidTrialDate(date)) {
    return {
      ok: false,
      message: "Invalid trial date format.",
    };
  }

  if (!isValidTrialTime(time)) {
    return {
      ok: false,
      message: "Invalid trial time slot.",
    };
  }

  const permittedSlots =
    configuredSlots ?? getDefaultTrialSlots(trialMode, date);
  if (!permittedSlots.includes(time)) {
    return {
      ok: false,
      message:
        configuredSlots === undefined
          ? trialMode === "offline"
            ? "Offline trials are only available on Saturdays and Sundays."
            : "No online trial times are available on this date."
          : "That trial time is not available on the selected date.",
    };
  }

  const today = new Date().toISOString().split("T")[0];

  if (date < today) {
    return {
      ok: false,
      message: "Trial date cannot be in the past.",
    };
  }

  return {
    ok: true,
    data: {
      date,
      time,
    },
  };
}

    export function slotIdFor(date: string, time: string) {
    return `${date}_${time.replace(/\s/g, "")}`;
    }