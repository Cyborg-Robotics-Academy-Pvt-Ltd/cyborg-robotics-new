export const SUCCESS_PAYMENT_STATUSES = ["SUCCESS", "CHARGED"] as const;
export const FAILED_PAYMENT_STATUSES = ["FAILED", "DECLINED"] as const;
export const TERMINAL_PAYMENT_STATUSES = [
  ...SUCCESS_PAYMENT_STATUSES,
  ...FAILED_PAYMENT_STATUSES,
] as const;

export function isSuccessfulPaymentStatus(status?: string | null): boolean {
  return SUCCESS_PAYMENT_STATUSES.includes((status || "").toUpperCase() as (typeof SUCCESS_PAYMENT_STATUSES)[number]);
}

export function isFailedPaymentStatus(status?: string | null): boolean {
  return FAILED_PAYMENT_STATUSES.includes((status || "").toUpperCase() as (typeof FAILED_PAYMENT_STATUSES)[number]);
}

export function isTerminalPaymentStatus(status?: string | null): boolean {
  return TERMINAL_PAYMENT_STATUSES.includes((status || "").toUpperCase() as (typeof TERMINAL_PAYMENT_STATUSES)[number]);
}
