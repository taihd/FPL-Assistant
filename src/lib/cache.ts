// Simple localStorage-based cache utility

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

const CACHE_PREFIX = 'fpl_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export function getCachedData<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now > entry.timestamp + entry.expiry) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

export function setCachedData<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiry: ttl,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (error) {
    console.error('Error writing to cache:', error);
    // If storage is full, try to clear old entries
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCacheEntries();
    }
  }
}

export function clearCache(key?: string): void {
  if (key) {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } else {
    // Clear all cache entries
    Object.keys(localStorage)
      .filter((k) => k.startsWith(CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }
}

function clearOldCacheEntries(): void {
  const now = Date.now();
  Object.keys(localStorage)
    .filter((k) => k.startsWith(CACHE_PREFIX))
    .forEach((key) => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry = JSON.parse(cached) as CacheEntry<unknown>;
          if (now > entry.timestamp + entry.expiry) {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // If we can't parse it, remove it
        localStorage.removeItem(key);
      }
    });
}

// Cache keys
export const CACHE_KEYS = {
  BOOTSTRAP: 'bootstrap',
  FIXTURES: 'fixtures',
  PLAYER_SUMMARY: (id: number) => `player_${id}`,
  MANAGER_INFO: (id: number) => `manager_${id}`,
  MANAGER_HISTORY: (id: number) => `manager_history_${id}`,
  MANAGER_TRANSFERS: (id: number) => `manager_transfers_${id}`,
  LEAGUE_STANDINGS: (id: number) => `league_${id}`,
} as const;

