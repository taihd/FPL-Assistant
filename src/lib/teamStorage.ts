// Team storage utilities for localStorage

const STORAGE_KEYS = {
  MANAGER_ID: 'fpl_manager_id',
  TEAM_DATA: 'fpl_team_data',
} as const;

/**
 * Save Manager ID to localStorage
 */
export function saveManagerId(id: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MANAGER_ID, id.toString());
  } catch (error) {
    console.error('Error saving manager ID:', error);
  }
}

/**
 * Get Manager ID from localStorage
 */
export function getManagerId(): number | null {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.MANAGER_ID);
    return id ? parseInt(id, 10) : null;
  } catch (error) {
    console.error('Error getting manager ID:', error);
    return null;
  }
}

/**
 * Clear Manager ID from localStorage
 */
export function clearManagerId(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.MANAGER_ID);
    localStorage.removeItem(STORAGE_KEYS.TEAM_DATA);
  } catch (error) {
    console.error('Error clearing manager ID:', error);
  }
}

/**
 * Cache team data in localStorage
 */
export function cacheTeamData(data: unknown): void {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEYS.TEAM_DATA, JSON.stringify(cacheEntry));
  } catch (error) {
    console.error('Error caching team data:', error);
  }
}

/**
 * Get cached team data from localStorage
 */
export function getCachedTeamData<T>(): T | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.TEAM_DATA);
    if (!cached) return null;

    const cacheEntry = JSON.parse(cached) as { data: T; timestamp: number };
    // Cache is valid for 5 minutes
    const CACHE_TTL = 5 * 60 * 1000;
    if (Date.now() - cacheEntry.timestamp > CACHE_TTL) {
      localStorage.removeItem(STORAGE_KEYS.TEAM_DATA);
      return null;
    }

    return cacheEntry.data;
  } catch (error) {
    console.error('Error getting cached team data:', error);
    return null;
  }
}

