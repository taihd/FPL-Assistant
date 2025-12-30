import type {
  BootstrapData,
  Fixture,
  ManagerInfo,
  ManagerHistory,
  ManagerTransfer,
} from '@/types/fpl';
import type { PlayerSummary } from '@/types/player';
import { getCachedData, setCachedData, CACHE_KEYS } from '@/lib/cache';

export type {
  BootstrapData,
  Fixture,
  Team,
  Event,
  Player,
  ElementType,
  ManagerInfo,
  ManagerHistory,
  ManagerTransfer,
} from '@/types/fpl';

// Use proxy in development, CORS proxy in production (GitHub Pages)
// The FPL API blocks CORS requests from GitHub Pages, so we need a proxy
const FPL_API_URL = 'https://fantasy.premierleague.com/api';

// Helper to get the proxied URL for production with fallback
const getProxiedUrl = (path: string): string => {
  if (import.meta.env.DEV) {
    return `/api/fpl${path}`;
  }
  
  // Try multiple CORS proxy services with fallback
  // Primary: corsproxy.io (more reliable)
  // Fallback: api.allorigins.win (if primary fails)
  const fullUrl = `${FPL_API_URL}${path}`;
  
  // Use corsproxy.io as primary
  return `https://corsproxy.io/?${encodeURIComponent(fullUrl)}`;
};

// Fallback proxy function for retry logic
const getFallbackProxiedUrl = (path: string): string => {
  const fullUrl = `${FPL_API_URL}${path}`;
  // Fallback to allorigins if primary fails
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl)}`;
};

// Cache TTLs (in milliseconds)
const CACHE_TTL = {
  BOOTSTRAP: 10 * 60 * 1000, // 10 minutes (changes less frequently)
  FIXTURES: 5 * 60 * 1000, // 5 minutes
  MANAGER: 2 * 60 * 1000, // 2 minutes
  PLAYER: 5 * 60 * 1000, // 5 minutes
} as const;

// Helper function to fetch with retry and fallback proxy
async function fetchWithFallback(url: string, fallbackUrl: string): Promise<Response> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
    
    // If primary proxy returns 500 or other server errors, try fallback
    if (response.status >= 500) {
      console.warn('Primary proxy failed, trying fallback...');
      const fallbackResponse = await fetch(fallbackUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });
      return fallbackResponse;
    }
    
    return response;
  } catch (error) {
    // If primary fails completely, try fallback
    console.warn('Primary proxy error, trying fallback...', error);
    try {
      return await fetch(fallbackUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });
    } catch (fallbackError) {
      // If both fail, throw the original error
      throw error;
    }
  }
}

export async function getBootstrapData(): Promise<BootstrapData> {
  // Check cache first
  const cached = getCachedData<BootstrapData>(CACHE_KEYS.BOOTSTRAP);
  if (cached) {
    return cached;
  }

  try {
    const primaryUrl = getProxiedUrl('/bootstrap-static/');
    const fallbackUrl = getFallbackProxiedUrl('/bootstrap-static/');
    
    const response = await fetchWithFallback(primaryUrl, fallbackUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch bootstrap data: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json() as BootstrapData;
    // Cache the data
    setCachedData(CACHE_KEYS.BOOTSTRAP, data, CACHE_TTL.BOOTSTRAP);
    return data;
  } catch (error) {
    console.error('API Error (getBootstrapData):', error);
    
    // Check for CORS errors
    if (error instanceof TypeError) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('failed to fetch') || errorMessage.includes('networkerror') || errorMessage.includes('cors')) {
        throw new Error(
          'CORS error: Unable to connect to FPL API. The API may be blocking requests from this domain. Please check the browser console for more details.'
        );
      }
      throw new Error(
        'Network error: Unable to connect to FPL API. Please check your internet connection or try again later.'
      );
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unknown error occurred while fetching bootstrap data');
  }
}

export async function getFixtures(): Promise<Fixture[]> {
  // Check cache first
  const cached = getCachedData<Fixture[]>(CACHE_KEYS.FIXTURES);
  if (cached) {
    return cached;
  }

  try {
    const primaryUrl = getProxiedUrl('/fixtures/');
    const fallbackUrl = getFallbackProxiedUrl('/fixtures/');
    
    const response = await fetchWithFallback(primaryUrl, fallbackUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch fixtures: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json() as Fixture[];
    // Cache the data
    setCachedData(CACHE_KEYS.FIXTURES, data, CACHE_TTL.FIXTURES);
    return data;
  } catch (error) {
    console.error('API Error (getFixtures):', error);
    
    // Check for CORS errors
    if (error instanceof TypeError) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('failed to fetch') || errorMessage.includes('networkerror') || errorMessage.includes('cors')) {
        throw new Error(
          'CORS error: Unable to connect to FPL API. The API may be blocking requests from this domain.'
        );
      }
      throw new Error(
        'Network error: Unable to connect to FPL API. Please check your internet connection or try again later.'
      );
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('An unknown error occurred while fetching fixtures');
  }
}

export type { PlayerSummary, PlayerHistory, PlayerFixture } from '@/types/player';

export async function getPlayerSummary(id: number): Promise<PlayerSummary> {
  // Check cache first
  const cached = getCachedData<PlayerSummary>(CACHE_KEYS.PLAYER_SUMMARY(id));
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(getProxiedUrl(`/element-summary/${id}/`), {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch player summary for id ${id}`);
    }
    const data = await response.json() as PlayerSummary;
    // Cache the data
    setCachedData(CACHE_KEYS.PLAYER_SUMMARY(id), data, CACHE_TTL.PLAYER);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function getManagerInfo(id: number): Promise<ManagerInfo> {
  // Check cache first
  const cached = getCachedData<ManagerInfo>(CACHE_KEYS.MANAGER_INFO(id));
  if (cached) {
    return cached;
  }

  try {
    const primaryUrl = getProxiedUrl(`/entry/${id}/`);
    const fallbackUrl = getFallbackProxiedUrl(`/entry/${id}/`);
    
    const response = await fetchWithFallback(primaryUrl, fallbackUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch manager info for id ${id}`);
    }
    const data = await response.json() as ManagerInfo;
    // Cache the data
    setCachedData(CACHE_KEYS.MANAGER_INFO(id), data, CACHE_TTL.MANAGER);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function getManagerHistory(id: number): Promise<ManagerHistory> {
  // Check cache first
  const cached = getCachedData<ManagerHistory>(CACHE_KEYS.MANAGER_HISTORY(id));
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(getProxiedUrl(`/entry/${id}/history/`), {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch manager history for id ${id}`);
    }
    const data = await response.json() as ManagerHistory;
    // Cache the data
    setCachedData(CACHE_KEYS.MANAGER_HISTORY(id), data, CACHE_TTL.MANAGER);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function getManagerTransfers(id: number): Promise<ManagerTransfer[]> {
  // Check cache first
  const cached = getCachedData<ManagerTransfer[]>(CACHE_KEYS.MANAGER_TRANSFERS(id));
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(getProxiedUrl(`/entry/${id}/transfers/`), {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch manager transfers for id ${id}`);
    }
    const data = await response.json() as ManagerTransfer[];
    // Cache the data
    setCachedData(CACHE_KEYS.MANAGER_TRANSFERS(id), data, CACHE_TTL.MANAGER);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function getLeagueStandings(id: number): Promise<unknown> {
  try {
    const response = await fetch(getProxiedUrl(`/leagues-classic/${id}/standings/`), {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch league standings for id ${id}`);
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export interface TeamPicks {
  active_chip: string | null;
  automatic_subs: Array<{
    entry: number;
    element_in: number;
    element_out: number;
    event: number;
  }>;
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  };
  picks: Array<{
    element: number; // Player ID
    position: number; // Position in team (1-15)
    is_captain: boolean;
    is_vice_captain: boolean;
    multiplier: number;
  }>;
}

/**
 * Get team picks for a specific manager and gameweek
 */
export async function getTeamPicks(managerId: number, gameweek: number): Promise<TeamPicks> {
  if (!gameweek || gameweek <= 0 || isNaN(gameweek)) {
    throw new Error(`Invalid gameweek: ${gameweek}. Please ensure the current gameweek is available.`);
  }

  // Check cache first
  const cacheKey = `team_picks_${managerId}_${gameweek}`;
  const cached = getCachedData<TeamPicks>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const primaryUrl = getProxiedUrl(`/entry/${managerId}/event/${gameweek}/picks/`);
    const fallbackUrl = getFallbackProxiedUrl(`/entry/${managerId}/event/${gameweek}/picks/`);
    
    const response = await fetchWithFallback(primaryUrl, fallbackUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch team picks for manager ${managerId}, gameweek ${gameweek}: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json() as TeamPicks;
    // Cache the data (2 minutes - team picks can change)
    setCachedData(cacheKey, data, CACHE_TTL.MANAGER);
    return data;
  } catch (error) {
    console.error('API Error (getTeamPicks):', error);

    // Check for CORS errors
    if (error instanceof TypeError) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('failed to fetch') || errorMessage.includes('networkerror') || errorMessage.includes('cors')) {
        throw new Error(
          'CORS error: Unable to connect to FPL API. The API may be blocking requests from this domain.'
        );
      }
      throw new Error(
        'Network error: Unable to connect to FPL API. Please check your internet connection or try again later.'
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unknown error occurred while fetching team picks');
  }
}

