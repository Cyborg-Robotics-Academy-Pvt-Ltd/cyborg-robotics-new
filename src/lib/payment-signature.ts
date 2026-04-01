import { createHmac } from "crypto";

export const PAYMENT_SIGNATURE_ALGORITHM = "HMAC-SHA256";

export type PaymentSignatureVerificationResult = {
  ok: boolean;
  reason?: string;
  algorithm?: string;
  expectedSignature?: string;
  receivedSignature?: string;
};

function decodeOnce(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function asciiCompare(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function percentEncode(value: string): string {
  return encodeURIComponent(value);
}

function normalizeKey(key: string): string {
  return key.trim().toLowerCase();
}

export function verifyReturnUrlSignature(
  params: URLSearchParams,
  responseKey?: string | null
): PaymentSignatureVerificationResult {
  if (!responseKey || !responseKey.trim()) {
    return {
      ok: false,
      reason: "Response key not configured",
    };
  }

  const signature = params.get("signature");
  const signatureAlgorithm = params.get("signature_algorithm");

  if (!signature) {
    return {
      ok: false,
      reason: "Missing signature",
    };
  }

  if (!signatureAlgorithm) {
    return {
      ok: false,
      reason: "Missing signature algorithm",
    };
  }

  if (normalizeKey(signatureAlgorithm) !== normalizeKey(PAYMENT_SIGNATURE_ALGORITHM)) {
    return {
      ok: false,
      reason: `Unsupported signature algorithm: ${signatureAlgorithm}`,
      algorithm: signatureAlgorithm,
    };
  }

  const signedPairs = Array.from(params.entries()).filter(
    ([key]) => key !== "signature" && key !== "signature_algorithm"
  );

  if (signedPairs.length === 0) {
    return {
      ok: false,
      reason: "No signed parameters found",
      algorithm: signatureAlgorithm,
      receivedSignature: decodeOnce(signature),
    };
  }

  const canonicalPayload = signedPairs
    .map(([key, value]) => [percentEncode(key), percentEncode(value)] as const)
    .sort(([left], [right]) => asciiCompare(left, right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const stringToSign = percentEncode(canonicalPayload);
  const generatedHash = createHmac("sha256", responseKey.trim())
    .update(stringToSign)
    .digest("hex");

  const expectedSignature = encodeURIComponent(generatedHash);
  const receivedSignature = decodeOnce(signature);

  if (receivedSignature !== expectedSignature) {
    return {
      ok: false,
      reason: "Signature mismatch",
      algorithm: signatureAlgorithm,
      expectedSignature,
      receivedSignature,
    };
  }

  return {
    ok: true,
    algorithm: signatureAlgorithm,
    expectedSignature,
    receivedSignature,
  };
}
