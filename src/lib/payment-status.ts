export const SUCCESS_PAYMENT_STATUSES = ["SUCCESS", "CHARGED"] as const;
export const FAILED_PAYMENT_STATUSES = [
  "FAILED",
  "DECLINED",
  "AUTHORIZATION_FAILED",
  "AUTHENTICATION_FAILED",
  "JUSPAY_DECLINED",
  "CANCELLED",
  "CANCELED",
] as const;
export const TERMINAL_PAYMENT_STATUSES = [
  ...SUCCESS_PAYMENT_STATUSES,
  ...FAILED_PAYMENT_STATUSES,
] as const;

export function normalizePaymentStatus(status?: string | null): string {
  const normalized = (status || "").trim().toUpperCase();

  if (
    SUCCESS_PAYMENT_STATUSES.includes(
      normalized as (typeof SUCCESS_PAYMENT_STATUSES)[number],
    )
  ) {
    return "SUCCESS";
  }

  if (
    FAILED_PAYMENT_STATUSES.includes(
      normalized as (typeof FAILED_PAYMENT_STATUSES)[number],
    )
  ) {
    return "FAILED";
  }

  return normalized || "PENDING";
}

export function isSuccessfulPaymentStatus(status?: string | null): boolean {
  return normalizePaymentStatus(status) === "SUCCESS";
}

export function isFailedPaymentStatus(status?: string | null): boolean {
  return normalizePaymentStatus(status) === "FAILED";
}

export function isTerminalPaymentStatus(status?: string | null): boolean {
  return isSuccessfulPaymentStatus(status) || isFailedPaymentStatus(status);
}
