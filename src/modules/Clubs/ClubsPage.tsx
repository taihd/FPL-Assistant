import { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFPLApi } from '@/hooks/useFPLApi';
import { ClubCard } from './ClubCard';
import { ClubCompare } from './ClubCompare';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Team, Fixture } from '@/types/fpl';
import { cn } from '@/lib/utils';

export function ClubsPage() {
  const { setScreen, setDataSnapshot } = useAppContext();
  const { fetchBootstrapData, fetchFixtures } = useFPLApi();

  const [teams, setTeams] = useState<Team[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);
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

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Clubs</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Clubs</h1>
        <div className="rounded-lg bg-red-50 p-6 text-red-800">
          <p className="mb-2 font-semibold">Error loading clubs</p>
          <p className="mb-4 text-sm">{error.message}</p>
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
    <div>
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Premier League Clubs</h1>

      {/* Search and Compare Controls */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row">
        <div className="flex-1">
          <label
            htmlFor="club-search"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Search Clubs
          </label>
          <input
            id="club-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by team name..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>

        {selectedTeams.length > 0 && (
          <div className="flex items-end gap-2">
            <button
              onClick={() => setShowCompare(!showCompare)}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                showCompare
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              {showCompare ? 'Hide' : 'Show'} Comparison ({selectedTeams.length})
            </button>
            <button
              onClick={() => {
                setSelectedTeams([]);
                setShowCompare(false);
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Comparison View */}
      {showCompare && selectedTeamsData.length > 0 && (
        <div className="mb-6">
          <ClubCompare teams={selectedTeamsData} />
        </div>
      )}

      {/* Clubs Grid */}
      {filteredTeams.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">No clubs found matching your search.</p>
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
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-white text-slate-400 shadow-sm hover:bg-slate-50 hover:text-slate-600'
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
    </div>
  );
}
