import { createHmac, createHash, timingSafeEqual } from "crypto";

export const PAYMENT_SESSION_COOKIE_NAME = "cyborg_payment_session";

export interface PaymentSessionBindingPayload {
  orderId: string;
  customerId: string;
  ownerSeedHash: string;
  sessionBindingKey: string;
  issuedAt: string;
  expiresAt: string;
}

export type PaymentSessionBindingVerificationResult =
  | { ok: true; payload: PaymentSessionBindingPayload }
  | { ok: false; reason: string };

function normalizeSeed(value: string): string {
  return value.trim().toLowerCase();
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function getSessionSecret(): string | null {
  return (
    process.env.PAYMENT_SESSION_SECRET ||
    process.env.HDFC_RESPONSE_KEY ||
    process.env.JUSPAY_RESPONSE_KEY ||
    process.env.HDFC_API_KEY ||
    null
  );
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function derivePaymentOwnerSeed(
  userId?: string | null,
  email?: string | null
): string {
  const seed = userId?.trim() || email?.trim() || "anonymous";
  return normalizeSeed(seed);
}

export function derivePaymentSessionBindingKey(
  orderId: string,
  customerId: string,
  ownerSeed: string
): string {
  const ownerSeedHash = sha256(normalizeSeed(ownerSeed));
  return sha256([orderId, customerId, ownerSeedHash].join(":"));
}

export function createPaymentSessionCookieValue(
  payload: PaymentSessionBindingPayload
): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", secret)
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

export function createPaymentSessionBinding(
  orderId: string,
  customerId: string,
  ownerSeed: string,
  ttlMinutes = 480
): PaymentSessionBindingPayload {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + ttlMinutes * 60 * 1000);
  const ownerSeedHash = sha256(normalizeSeed(ownerSeed));
  const sessionBindingKey = derivePaymentSessionBindingKey(
    orderId,
    customerId,
    ownerSeed
  );

  return {
    orderId,
    customerId,
    ownerSeedHash,
    sessionBindingKey,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export function verifyPaymentSessionCookieValue(
  cookieValue: string | null | undefined
): PaymentSessionBindingVerificationResult {
  if (!cookieValue) {
    return { ok: false, reason: "Missing payment session cookie" };
  }

  const secret = getSessionSecret();
  if (!secret) {
    return { ok: false, reason: "Payment session secret not configured" };
  }

  const [body, signature] = cookieValue.split(".");
  if (!body || !signature) {
    return { ok: false, reason: "Malformed payment session cookie" };
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(body)
    .digest("base64url");

  const actual = Buffer.from(signature, "base64url");
  const expected = Buffer.from(expectedSignature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return { ok: false, reason: "Payment session signature mismatch" };
  }

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as PaymentSessionBindingPayload;
    if (
      !payload ||
      typeof payload.orderId !== "string" ||
      typeof payload.customerId !== "string" ||
      typeof payload.sessionBindingKey !== "string" ||
      typeof payload.ownerSeedHash !== "string" ||
      typeof payload.expiresAt !== "string"
    ) {
      return { ok: false, reason: "Invalid payment session payload" };
    }

    if (new Date(payload.expiresAt).getTime() < Date.now()) {
      return { ok: false, reason: "Payment session expired" };
    }

    return { ok: true, payload };
  } catch {
    return { ok: false, reason: "Invalid payment session payload" };
  }
}

export function getCookieValue(
  cookieHeader: string | null | undefined,
  name: string
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((entry) => entry.trim());
  for (const cookie of cookies) {
    const index = cookie.indexOf("=");
    if (index <= 0) continue;

    const key = cookie.slice(0, index).trim();
    if (key === name) {
      return cookie.slice(index + 1);
    }
  }

  return null;
}

