import { OneCallPayload } from "@/types/weather";

const DEFAULT_TTL = 600_000; // 10 minutes

interface CacheRecord<T> {
  ts: number;
  data: T;
}

const memoryCache = new Map<string, CacheRecord<unknown>>();

export function saveCache<T>(key: string, data: T): void {
  const record: CacheRecord<T> = { ts: Date.now(), data };
  memoryCache.set(key, record as CacheRecord<unknown>);
  try {
    localStorage.setItem(key, JSON.stringify(record));
  } catch {
    /* ignore quota errors */
  }
}

export function getCache<T>(key: string, ttl = DEFAULT_TTL): T | null {
  const mem = memoryCache.get(key) as CacheRecord<T> | undefined;
  if (mem && Date.now() - mem.ts < ttl) return mem.data;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheRecord<T>;
    if (Date.now() - parsed.ts < ttl) {
      memoryCache.set(key, parsed as CacheRecord<unknown>);
      return parsed.data;
    }
  } catch {
    /* ignore */
  }

  return null;
}

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = DEFAULT_TTL
): Promise<T> {
  const cached = getCache<T>(key, ttl);
  if (cached) return cached;

  const fresh = await fetcher();
  saveCache<T>(key, fresh);
  return fresh;
}

export type { OneCallPayload };
