// lib/order-id-storage.ts

export const ORDER_ID_STORAGE_KEY = "cyborg_last_order_id";
const ORDER_ID_MAX_AGE_SECONDS = 60 * 30; // 30 min — enough for a stalled UPI round-trip

/**
 * Persists the orderId across the payment redirect flow.
 * Uses a cookie as primary storage (survives Instagram in-app-browser
 * WebView instance resets during UPI app-switch), with sessionStorage
 * as a secondary fallback.
 */
export function saveOrderId(orderId: string): void {
  if (!orderId || typeof window === "undefined") return;

  try {
    document.cookie = `${ORDER_ID_STORAGE_KEY}=${encodeURIComponent(
      orderId
    )}; max-age=${ORDER_ID_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
  } catch {
    // Ignore storage failures and continue the payment flow.
  }

  try {
    window.sessionStorage.setItem(ORDER_ID_STORAGE_KEY, orderId);
  } catch {
    // Ignore storage failures and continue the payment flow.
  }
}

/**
 * Reads the orderId back. Tries cookie first (most durable across
 * IAB WebView resets), then falls back to sessionStorage.
 */
export function readOrderId(): string {
  if (typeof window === "undefined") return "";

  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${ORDER_ID_STORAGE_KEY}=`));
    if (match) {
      const value = match.split("=")[1];
      if (value) return decodeURIComponent(value);
    }
  } catch {
    // fall through to sessionStorage
  }

  try {
    return window.sessionStorage.getItem(ORDER_ID_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * Clears stored orderId once the flow is complete (call this after
 * a SUCCESS status is confirmed on the success page, to avoid stale
 * orderId leaking into a future unrelated payment attempt).
 */
export function clearOrderId(): void {
  if (typeof window === "undefined") return;

  try {
    document.cookie = `${ORDER_ID_STORAGE_KEY}=; max-age=0; path=/; SameSite=Lax`;
  } catch {
    // Ignore.
  }

  try {
    window.sessionStorage.removeItem(ORDER_ID_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}