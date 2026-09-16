type CacheRecord = {
  value: unknown;
  expiresAt: number;
};

const MAX_ENTRIES = 200;
const TTL_MS = 5 * 60 * 1000;

const cacheStore = new Map<string, CacheRecord>();

function purgeExpiredEntries(now: number) {
  for (const [key, record] of cacheStore.entries()) {
    if (record.expiresAt <= now) {
      cacheStore.delete(key);
    }
  }
}

function evictOverflowEntries() {
  while (cacheStore.size > MAX_ENTRIES) {
    const firstKey = cacheStore.keys().next().value;
    if (!firstKey) {
      return;
    }
    cacheStore.delete(firstKey);
  }
}

// De ce: interfață minimă (doar get/set), ca apelanții să nu depindă de implementarea
// în memorie și să putem migra ulterior la Redis/Upstash fără schimbări în ruta de chat.
export function get<T>(key: string): T | undefined {
  const now = Date.now();
  purgeExpiredEntries(now);

  const record = cacheStore.get(key);
  if (!record) {
    return undefined;
  }

  if (record.expiresAt <= now) {
    cacheStore.delete(key);
    return undefined;
  }

  return record.value as T;
}

export function set<T>(key: string, value: T): void {
  const now = Date.now();
  purgeExpiredEntries(now);

  cacheStore.set(key, {
    value,
    expiresAt: now + TTL_MS
  });

  evictOverflowEntries();
}
