const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

function normalizeOrigin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

export function getAllowedPaymentOrigins(): string[] {
  const configuredOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.PAYMENT_ALLOWED_REDIRECT_ORIGINS,
    process.env.PAYMENT_ALLOWED_CALLBACK_ORIGINS,
  ]
    .flatMap((value) => (value ? value.split(",") : []))
    .map((value) => value.trim())
    .filter(Boolean);

  const origins = [...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins]
    .map(normalizeOrigin)
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(origins));
}

export function isAllowedPaymentOrigin(value: string): boolean {
  const origin = normalizeOrigin(value);
  if (!origin) return false;

  return getAllowedPaymentOrigins().includes(origin);
}

export function requireTrustedBaseUrl(
  baseUrl: string | undefined | null
): URL | null {
  if (!baseUrl || !baseUrl.trim()) {
    return null;
  }

  try {
    const url = new URL(baseUrl.trim());
    if (!isAllowedPaymentOrigin(url.origin)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export function buildTrustedPaymentUrl(
  baseUrl: string | URL,
  path: string
): URL {
  const base = typeof baseUrl === "string" ? new URL(baseUrl) : baseUrl;
  const target = new URL(path, base);

  if (!isAllowedPaymentOrigin(target.origin)) {
    throw new Error(`Disallowed payment URL origin: ${target.origin}`);
  }

  return target;
}

export function getRequestBaseUrl(req: Request): URL {
  const requestUrl = new URL(req.url);
  return new URL(requestUrl.origin);
}

export function buildPaymentUrlFromRequest(req: Request, path: string): URL {
  return new URL(path, getRequestBaseUrl(req));
}
