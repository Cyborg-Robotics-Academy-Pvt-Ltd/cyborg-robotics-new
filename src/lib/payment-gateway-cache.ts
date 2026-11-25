import { createHash, randomUUID } from "node:crypto";
import { kv } from "@vercel/kv";

const RESULT_TTL_SECONDS = 5;
const LOCK_TTL_SECONDS = 15;
const WAIT_ATTEMPTS = 15;
const WAIT_INTERVAL_MS = 100;

type CachedValue<T> = { value: T };

export type PaymentGatewayCacheResult<T> = {
  value: T | null;
  inFlight: boolean;
  cached: boolean;
};

let warnedMissingKv = false;
let warnedKvFailure = false;

function warnKvFailure(message: string) {
  if (warnedKvFailure) return;
  warnedKvFailure = true;
  console.warn(message);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function paymentCacheKey(orderId: string) {
  const digest = createHash("sha256").update(orderId).digest("hex");
  return `payment-gateway-status:v1:${digest}`;
}

/** Share a brief gateway snapshot across Vercel instances and coalesce concurrent misses. */
export async function getPaymentGatewayResult<T>(
  orderId: string,
  load: () => Promise<T>,
  shouldCache: (value: T) => boolean,
): Promise<PaymentGatewayCacheResult<T>> {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    if (!warnedMissingKv) {
      console.warn(
        "Payment gateway status cache is disabled: Vercel KV environment variables are missing.",
      );
      warnedMissingKv = true;
    }
    return { value: await load(), inFlight: false, cached: false };
  }

  const resultKey = paymentCacheKey(orderId);
  const lockKey = `${resultKey}:lock`;
  const lockToken = randomUUID();

  try {
    const cached = await kv.get<CachedValue<T>>(resultKey);
    if (cached && typeof cached === "object" && "value" in cached) {
      return { value: cached.value, inFlight: false, cached: true };
    }
  } catch {
    warnKvFailure("Vercel KV read failed; payment status is falling back to the gateway.");
    return { value: await load(), inFlight: false, cached: false };
  }

  let acquired = false;
  try {
    acquired =
      (await kv.set(lockKey, lockToken, {
        nx: true,
        ex: LOCK_TTL_SECONDS,
      })) === "OK";
  } catch {
    warnKvFailure("Vercel KV lock failed; payment status is falling back to the gateway.");
    return { value: await load(), inFlight: false, cached: false };
  }

  if (!acquired) {
    try {
      for (let attempt = 0; attempt < WAIT_ATTEMPTS; attempt += 1) {
        await wait(WAIT_INTERVAL_MS);
        const cached = await kv.get<CachedValue<T>>(resultKey);
        if (cached && typeof cached === "object" && "value" in cached) {
          return { value: cached.value, inFlight: false, cached: true };
        }
      }
    } catch {
      warnKvFailure("Vercel KV wait failed while checking payment status.");
    }

    // The request holding the short lease is still checking the gateway. Let the
    // client retry later instead of creating another upstream gateway request.
    return { value: null, inFlight: true, cached: false };
  }

  try {
    const value = await load();
    if (shouldCache(value)) {
      try {
        await kv.set(resultKey, { value }, { ex: RESULT_TTL_SECONDS });
      } catch {
        warnKvFailure("Vercel KV cache write failed for payment status.");
      }
    }
    return { value, inFlight: false, cached: false };
  } finally {
    try {
      await kv.eval(
        "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
        [lockKey],
        [lockToken],
      );
    } catch {
      // The lock expires automatically if it cannot be released here.
      warnKvFailure("Vercel KV lock release failed for payment status.");
    }
  }
}
