import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getBootstrapData, getFixtures } from '@/services/api';
import type { BootstrapData, Fixture, Player, Team, ElementType, Event } from '@/types/fpl';

interface FPLDataContextType {
  bootstrap: BootstrapData | null;
  fixtures: Fixture[] | null;
  allPlayers: Player[];
  allTeams: Team[];
  allPositions: ElementType[];
  events: Event[];
  currentGameweek: number | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const FPLDataContext = createContext<FPLDataContextType | null>(null);

interface FPLDataProviderProps {
  children: ReactNode;
  refreshInterval?: number; // Refresh interval in milliseconds (default: 10 minutes)
}

export function FPLDataProvider({ 
  children, 
  refreshInterval = 10 * 60 * 1000 // 10 minutes
}: FPLDataProviderProps) {
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [bootstrapData, fixturesData] = await Promise.all([
        getBootstrapData(),
        getFixtures(),
      ]);

      setBootstrap(bootstrapData);
      setFixtures(fixturesData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err
          : new Error('Failed to load FPL data');
      setError(errorMessage);
      console.error('Error loading FPL data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadData();

    // Set up auto-refresh
    const intervalId = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshInterval]);

  const refresh = async () => {
    await loadData();
  };

  const value: FPLDataContextType = {
    bootstrap,
    fixtures,
    allPlayers: bootstrap?.elements || [],
    allTeams: bootstrap?.teams || [],
    allPositions: bootstrap?.element_types || [],
    events: bootstrap?.events || [],
    currentGameweek: bootstrap?.current_event || null,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };

  return (
    <FPLDataContext.Provider value={value}>
      {children}
    </FPLDataContext.Provider>
  );
}

export function useFPLData(): FPLDataContextType {
  const context = useContext(FPLDataContext);
  if (!context) {
    throw new Error('useFPLData must be used within FPLDataProvider');
  }
  return context;
}
