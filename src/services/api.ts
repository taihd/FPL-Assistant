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

// Simple helper: use Vite proxy in dev, AllOrigins proxy in production
// Encode the FULL URL (base + path) for AllOrigins to work correctly
const getApiUrl = (path: string): string => {
  if (import.meta.env.DEV) {
    return `/api/fpl${path}`;
  }
  
  // Production: encode the full URL including path
  const fullUrl = `${FPL_API_URL}${path}`;
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(fullUrl)}`;
};

// Cache TTLs (in milliseconds)
const CACHE_TTL = {
  BOOTSTRAP: 10 * 60 * 1000, // 10 minutes (changes less frequently)
  FIXTURES: 5 * 60 * 1000, // 5 minutes
  MANAGER: 2 * 60 * 1000, // 2 minutes
  PLAYER: 5 * 60 * 1000, // 5 minutes
} as const;

// Simple fetch function with error handling and fallback
async function fetchApi(path: string): Promise<Response> {
  const url = getApiUrl(path);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
    
    // If AllOrigins returns 403, try alternative proxy
    if (response.status === 403 && !import.meta.env.DEV) {
      console.warn('AllOrigins returned 403, trying alternative proxy...');
      const fullUrl = `${FPL_API_URL}${path}`;
      const altUrl = `https://corsproxy.io/?${encodeURIComponent(fullUrl)}`;
      
      const altResponse = await fetch(altUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (altResponse.ok) {
        return altResponse;
      }
    }
    
    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      throw new Error(`Proxy returned HTML instead of JSON. Status: ${response.status}`);
    }
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    // If fetch fails completely, try alternative proxy in production
    if (!import.meta.env.DEV && error instanceof TypeError) {
      console.warn('Primary proxy failed, trying alternative...');
      const fullUrl = `${FPL_API_URL}${path}`;
      const altUrl = `https://corsproxy.io/?${encodeURIComponent(fullUrl)}`;
      
      try {
        const altResponse = await fetch(altUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
        });
        
        if (altResponse.ok) {
          return altResponse;
        }
      } catch (altError) {
        // Both failed, throw original error
      }
    }
    
    throw error;
  }
}

export async function getBootstrapData(): Promise<BootstrapData> {
  // Check cache first
  const cached = getCachedData<BootstrapData>(CACHE_KEYS.BOOTSTRAP);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetchApi('/bootstrap-static/');
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
    const response = await fetchApi('/fixtures/');
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
    const response = await fetchApi(`/element-summary/${id}/`);
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
    const response = await fetchApi(`/entry/${id}/`);
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
    const response = await fetchApi(`/entry/${id}/history/`);
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
    const response = await fetchApi(`/entry/${id}/transfers/`);
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
    const response = await fetchApi(`/leagues-classic/${id}/standings/`);
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
    const response = await fetchApi(`/entry/${managerId}/event/${gameweek}/picks/`);
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

