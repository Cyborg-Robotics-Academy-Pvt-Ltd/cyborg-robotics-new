import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type PaymentAuditSource =
  | "payment_status_get"
  | "payment_status_put"
  | "payment_return_get"
  | "payment_return_post"
  | "payment_webhook_post"
  | "admin_payment_reconcile";

export type PaymentAuditEventType =
  | "status_lookup"
  | "status_verify"
  | "return_signature"
  | "return_amount_check"
  | "webhook_received"
  | "webhook_status_update"
  | "webhook_finalized";

export interface PaymentAuditLogInput {
  eventType: PaymentAuditEventType;
  source: PaymentAuditSource;
  orderId?: string | null;
  status?: string | null;
  amount?: number | null;
  txnId?: string | null;
  bankRef?: string | null;
  reason?: string | null;
  success?: boolean;
  requestMethod?: string | null;
  requestPath?: string | null;
  rawRequest?: unknown;
  rawResponse?: unknown;
  metadata?: Record<string, unknown>;
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T;
}

function deepStripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => deepStripUndefined(entry)).filter((entry) => entry !== undefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, deepStripUndefined(entry)])
    );
  }

  return value;
}

export async function writePaymentAuditLog(
  input: PaymentAuditLogInput
): Promise<void> {
  const payload = deepStripUndefined(stripUndefined({
    ...input,
    createdAt: serverTimestamp(),
  })) as Record<string, unknown>;

  await addDoc(collection(db, "payment_audit_logs"), payload);
}

export async function safeWritePaymentAuditLog(
  input: PaymentAuditLogInput
): Promise<void> {
  try {
    await writePaymentAuditLog(input);
  } catch (error) {
    console.error("Failed to write payment audit log:", error);
  }
}

export function extractBankRef(payload: Record<string, any> | null | undefined): string | null {
  if (!payload || typeof payload !== "object") return null;

  const candidateKeys = [
    "bank_ref",
    "bankRef",
    "bank_ref_no",
    "bank_reference",
    "gateway_reference",
    "acq_id",
    "rrn",
    "ref_no",
  ];

  for (const key of candidateKeys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  const nestedOrder = payload?.content?.order;
  if (nestedOrder && typeof nestedOrder === "object") {
    for (const key of candidateKeys) {
      const value = nestedOrder[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  return null;
}
