interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitStore {
  entries: Map<string, RateLimitEntry>;
}

const globalForRateLimit = globalThis as unknown as {
  veloxRateLimit?: RateLimitStore;
};

const store =
  globalForRateLimit.veloxRateLimit ??
  ({ entries: new Map<string, RateLimitEntry>() } satisfies RateLimitStore);

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.veloxRateLimit = store;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function takeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  if (store.entries.size > 10_000) {
    for (const [entryKey, entry] of store.entries) {
      if (entry.resetAt <= now) store.entries.delete(entryKey);
    }
  }

  const existing = store.entries.get(key);
  if (!existing || existing.resetAt <= now) {
    store.entries.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clearRateLimit(key: string): void {
  store.entries.delete(key);
}
