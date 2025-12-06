import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getManagerInfo, getTeamPicks, getBootstrapData } from '@/services/api';
import { saveManagerId, getManagerId, clearManagerId, cacheTeamData, getCachedTeamData } from '@/lib/teamStorage';
import type { ManagerInfo, Player } from '@/types/fpl';
import type { TeamPicks } from '@/services/api';

interface TeamContextType {
  managerId: number | null;
  managerInfo: ManagerInfo | null;
  teamPicks: TeamPicks | null;
  teamPlayers: Player[] | null; // The 15 players in the team
  currentGameweek: number | null;
  isLoading: boolean;
  error: Error | null;
  setManagerId: (id: number | null) => void;
  loadTeam: (id: number) => Promise<void>;
  refreshTeam: () => Promise<void>;
  clearTeam: () => void;
}

const TeamContext = createContext<TeamContextType | null>(null);

interface TeamProviderProps {
  children: ReactNode;
}

export function TeamProvider({ children }: TeamProviderProps) {
  const [managerId, setManagerIdState] = useState<number | null>(null);
  const [managerInfo, setManagerInfo] = useState<ManagerInfo | null>(null);
  const [teamPicks, setTeamPicks] = useState<TeamPicks | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[] | null>(null);
  const [currentGameweek, setCurrentGameweek] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load saved manager ID on mount
  useEffect(() => {
    const savedId = getManagerId();
    if (savedId) {
      setManagerIdState(savedId);
      // Try to load cached data first
      const cached = getCachedTeamData<{ managerInfo: ManagerInfo; teamPicks: TeamPicks; currentGameweek: number }>();
      if (cached) {
        setManagerInfo(cached.managerInfo);
        setTeamPicks(cached.teamPicks);
        setCurrentGameweek(cached.currentGameweek);
      }
      // Then load fresh data
      loadTeam(savedId).catch(console.error);
    }
  }, []);

  const loadTeam = async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get bootstrap data and manager info first to determine gameweek
      const [bootstrap, info] = await Promise.all([
        getBootstrapData(),
        getManagerInfo(id),
      ]);

      // Try to get gameweek from bootstrap first, fallback to manager's current_event
      let gameweek = bootstrap.current_event;
      if (!gameweek || gameweek <= 0) {
        gameweek = info.current_event;
      }

      if (!gameweek || gameweek <= 0) {
        throw new Error('Unable to determine current gameweek. Please try again later.');
      }

      // Load team picks for the determined gameweek
      const picks = await getTeamPicks(id, gameweek);

      setManagerInfo(info);
      setTeamPicks(picks);
      setCurrentGameweek(gameweek);

      // Get the actual player objects for the team
      const playerIds = picks.picks.map((pick) => pick.element);
      const players = bootstrap.elements.filter((player) => playerIds.includes(player.id));
      setTeamPlayers(players);

      // Cache the data
      cacheTeamData({
        managerInfo: info,
        teamPicks: picks,
        currentGameweek: gameweek,
      });

      // Save manager ID
      saveManagerId(id);
      setManagerIdState(id);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err
          : new Error('Failed to load team. Please check the Manager ID and try again.');
      setError(errorMessage);
      console.error('Error loading team:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTeam = async (): Promise<void> => {
    if (managerId) {
      await loadTeam(managerId);
    }
  };

  const clearTeam = (): void => {
    clearManagerId();
    setManagerIdState(null);
    setManagerInfo(null);
    setTeamPicks(null);
    setTeamPlayers(null);
    setCurrentGameweek(null);
    setError(null);
  };

  const setManagerId = (id: number | null): void => {
    if (id === null) {
      clearTeam();
    } else {
      loadTeam(id).catch(console.error);
    }
  };

  return (
    <TeamContext.Provider
      value={{
        managerId,
        managerInfo,
        teamPicks,
        teamPlayers,
        currentGameweek,
        isLoading,
        error,
        setManagerId,
        loadTeam,
        refreshTeam,
        clearTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeamContext(): TeamContextType {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeamContext must be used within TeamProvider');
  }
  return context;
}

