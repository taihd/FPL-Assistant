import { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFPLApi } from '@/hooks/useFPLApi';
import { ClubCard } from './ClubCard';
import { ClubCompare } from './ClubCompare';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ComparisonFooter } from '@/components/ComparisonFooter';
import type { Team, Fixture } from '@/types/fpl';
import { cn } from '@/lib/utils';

export function ClubsPage() {
  const { setScreen, setDataSnapshot } = useAppContext();
  const { fetchBootstrapData, fetchFixtures } = useFPLApi();

  const [teams, setTeams] = useState<Team[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setScreen('clubs');
    setError(null);
    setIsLoading(true);

    const loadData = async () => {
      try {
        const [bootstrap, fixturesData] = await Promise.all([
          fetchBootstrapData(),
          fetchFixtures(),
        ]);

        setTeams(bootstrap.teams);
        setFixtures(fixturesData);

        // Update context for AI
        setDataSnapshot({
          teams: bootstrap.teams,
          fixtures: fixturesData,
        });

        setError(null);
      } catch (err) {
        console.error('Failed to load clubs data:', err);
        const errorMessage =
          err instanceof Error
            ? err
            : new Error('Failed to load clubs data. Please try again later.');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setScreen, setDataSnapshot, fetchBootstrapData, fetchFixtures]);

  // Filter teams by search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) {
      return teams;
    }

    const query = searchQuery.toLowerCase();
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.short_name.toLowerCase().includes(query)
    );
  }, [teams, searchQuery]);

  // Get selected teams for comparison
  const selectedTeamsData = useMemo(() => {
    return teams.filter((team) => selectedTeams.includes(team.id));
  }, [teams, selectedTeams]);

  const toggleTeamSelection = (teamId: number) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleCompareClick = () => {
    if (selectedTeams.length > 0) {
      // For teams, we'll show comparison inline or navigate to a comparison page
      // For now, we'll keep it inline but could add navigation later
    }
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-white">Clubs</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-white">Clubs</h1>
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6">
          <p className="mb-2 font-semibold text-red-400">Error loading clubs</p>
          <p className="mb-4 text-sm text-red-300">{error.message}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              const loadData = async () => {
                try {
                  const [bootstrap, fixturesData] = await Promise.all([
                    fetchBootstrapData(),
                    fetchFixtures(),
                  ]);
                  setTeams(bootstrap.teams);
                  setFixtures(fixturesData);
                  setDataSnapshot({
                    teams: bootstrap.teams,
                    fixtures: fixturesData,
                  });
                  setError(null);
                } catch (err) {
                  const errorMessage =
                    err instanceof Error
                      ? err
                      : new Error('Failed to load clubs data');
                  setError(errorMessage);
                } finally {
                  setIsLoading(false);
                }
              };
              loadData();
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={selectedTeams.length > 0 ? 'pb-20' : ''}>
      <h1 className="mb-6 text-3xl font-bold text-white">Premier League Clubs</h1>

      {/* Search */}
      <div className="mb-6 rounded-lg border border-dark-border bg-[#25252B] p-4">
        <label
          htmlFor="club-search"
          className="mb-2 block text-sm font-medium text-white"
        >
          Search Clubs
        </label>
        <input
          id="club-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by team name..."
          className="w-full rounded-md border border-dark-border bg-[#2A2A35] px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Comparison View - Always show when teams are selected */}
      {selectedTeamsData.length > 0 && (
        <div className="mb-6">
          <ClubCompare teams={selectedTeamsData} />
        </div>
      )}

      {/* Clubs Grid */}
      {filteredTeams.length === 0 ? (
        <div className="rounded-lg border border-dark-border bg-[#25252B] p-8 text-center">
          <p className="text-slate-300">No clubs found matching your search.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <div key={team.id} className="relative">
              <ClubCard team={team} fixtures={fixtures} allTeams={teams} />
              <button
                onClick={() => toggleTeamSelection(team.id)}
                className={cn(
                  'absolute right-2 top-2 rounded-full p-1.5 transition-colors',
                  selectedTeams.includes(team.id)
                    ? 'bg-violet-500 text-white hover:bg-violet-600'
                    : 'bg-[#2A2A35] text-slate-400 hover:bg-[#2F2F3A] hover:text-white'
                )}
                title={
                  selectedTeams.includes(team.id)
                    ? 'Remove from comparison'
                    : 'Add to comparison'
                }
              >
                {selectedTeams.includes(team.id) ? (
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Footer */}
      <ComparisonFooter
        selectedItems={selectedTeams.map((teamId) => {
          const team = teams.find((t) => t.id === teamId);
          return {
            id: teamId,
            name: team?.name || `Team ${teamId}`,
            label: team?.short_name,
          };
        })}
        onRemove={toggleTeamSelection}
        onClearAll={() => setSelectedTeams([])}
        onCompare={handleCompareClick}
        type="teams"
        teams={teams}
      />
    </div>
  );
}
