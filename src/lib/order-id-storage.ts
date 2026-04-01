export const ORDER_ID_STORAGE_KEY = "cyborg_last_order_id";

export function saveOrderId(orderId: string): void {
  if (!orderId || typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(ORDER_ID_STORAGE_KEY, orderId);
  } catch {
    // Ignore storage failures and continue the payment flow.
  }
}

export function readOrderId(): string {
  if (typeof window === "undefined") return "";

  try {
    return window.sessionStorage.getItem(ORDER_ID_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}
