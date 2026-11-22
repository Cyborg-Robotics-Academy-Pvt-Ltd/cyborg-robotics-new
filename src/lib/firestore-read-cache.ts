const CACHE_TTL_MS = 30_000;

type CacheEntry = {
  expiresAt: number;
  value?: unknown;
  pending?: Promise<unknown>;
};

const cache = new Map<string, CacheEntry>();

/** Reuse a recent Firestore read and deduplicate concurrent requests by key. */
export function cachedFirestoreRead<T>(
  key: string,
  read: () => Promise<T>,
  options: { force?: boolean } = {},
): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key);

  if (!options.force && existing?.pending) {
    return existing.pending as Promise<T>;
  }

  if (!options.force && existing?.value !== undefined && existing.expiresAt > now) {
    return Promise.resolve(existing.value as T);
  }

  const entry: CacheEntry = { expiresAt: 0 };
  const pending = read().then(
    (value) => {
      entry.value = value;
      entry.expiresAt = Date.now() + CACHE_TTL_MS;
      entry.pending = undefined;
      return value;
    },
    (error) => {
      if (cache.get(key) === entry) cache.delete(key);
      throw error;
    },
  );
  entry.pending = pending;
  cache.set(key, entry);
  return pending;
}

export function invalidateFirestoreReadCache(...keys: string[]) {
  if (keys.length === 0) {
    cache.clear();
    return;
  }

  keys.forEach((key) => cache.delete(key));
}
