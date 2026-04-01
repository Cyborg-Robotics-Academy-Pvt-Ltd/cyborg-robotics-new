import { randomBytes } from "crypto";

export const ORDER_ID_LENGTH = 20;
export const LEGACY_ORDER_ID_REGEX = /^ORDER_[a-f0-9]{15}$/;

export const ORDER_ID_REGEX = new RegExp(`^[a-f0-9]{${ORDER_ID_LENGTH}}$`);

export function isValidOrderId(orderId: string | null | undefined): boolean {
  if (!orderId) return false;
  return ORDER_ID_REGEX.test(orderId) || LEGACY_ORDER_ID_REGEX.test(orderId);
}

export function generateOrderId(): string {
  return randomBytes(Math.ceil(ORDER_ID_LENGTH / 2))
    .toString("hex")
    .slice(0, ORDER_ID_LENGTH);
}
