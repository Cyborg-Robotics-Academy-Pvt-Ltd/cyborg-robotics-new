import { createHash } from "crypto";

function normalizeCustomerSeed(seed: string): string {
  return seed.trim().toLowerCase();
}

/**
 * Generates a stable, deterministic customer ID from a user-specific seed.
 * The same email/user ID always produces the same ID, while the raw value
 * is never sent to the gateway.
 */
export function generateCustomerId(seed: string): string {
  const normalizedSeed = normalizeCustomerSeed(seed);

  if (!normalizedSeed) {
    throw new Error("Customer ID seed is required");
  }

  return createHash("sha256").update(normalizedSeed).digest("hex").slice(0, 20);
}

/**
 * Legacy helper retained for compatibility.
 * Returns the deterministic customer ID for the supplied seed.
 */
export async function getNextCustomerId(seed: string): Promise<string> {
  return generateCustomerId(seed);
}
