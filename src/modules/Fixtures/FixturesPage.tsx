import { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFPLApi } from '@/hooks/useFPLApi';
import { FixtureCard } from './FixtureCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Fixture, Team, Event } from '@/types/fpl';

export function FixturesPage() {
  const { setScreen, setDataSnapshot } = useAppContext();
  const { fetchBootstrapData, fetchFixtures, loading } = useFPLApi();

  const [bootstrapData, setBootstrapData] = useState<{
    teams: Team[];
    events: Event[];
  } | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedGameweek, setSelectedGameweek] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setScreen('fixtures');
    setError(null);
    setIsLoading(true);

    const loadData = async () => {
      try {
        const [bootstrap, fixturesData] = await Promise.all([
          fetchBootstrapData(),
          fetchFixtures(),
        ]);

        setBootstrapData({
          teams: bootstrap.teams,
          events: bootstrap.events,
        });
        setFixtures(fixturesData);

        // Set current gameweek as default
        const currentEvent = bootstrap.events.find((e) => e.is_current);
        if (currentEvent) {
          setSelectedGameweek(currentEvent.id);
        }

        // Update context for AI
        setDataSnapshot({
          fixtures: fixturesData,
          teams: bootstrap.teams,
          events: bootstrap.events,
        });

        setError(null);
      } catch (err) {
        console.error('Failed to load fixtures data:', err);
        const errorMessage =
          err instanceof Error
            ? err
            : new Error('Failed to load fixtures data. Please try again later.');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setScreen, setDataSnapshot, fetchBootstrapData, fetchFixtures]);

  // Filter fixtures by gameweek and team
  const filteredFixtures = useMemo(() => {
    let filtered = fixtures;

    if (selectedGameweek !== null) {
      filtered = filtered.filter((f) => f.event === selectedGameweek);
    }

    if (selectedTeamId !== null) {
      filtered = filtered.filter(
        (f) => f.team_h === selectedTeamId || f.team_a === selectedTeamId
      );
    }

    return filtered;
  }, [fixtures, selectedGameweek, selectedTeamId]);

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-white">Fixtures</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-white">Fixtures</h1>
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6">
          <p className="mb-2 font-semibold text-red-400">Error loading fixtures</p>
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
                  setBootstrapData({
                    teams: bootstrap.teams,
                    events: bootstrap.events,
                  });
                  setFixtures(fixturesData);
                  const currentEvent = bootstrap.events.find((e) => e.is_current);
                  if (currentEvent) {
                    setSelectedGameweek(currentEvent.id);
                  }
                  setDataSnapshot({
                    fixtures: fixturesData,
                    teams: bootstrap.teams,
                    events: bootstrap.events,
                  });
                  setError(null);
                } catch (err) {
                  const errorMessage =
                    err instanceof Error
                      ? err
                      : new Error('Failed to load fixtures data');
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

  if (!bootstrapData) {
    return null;
  }

  const teams = bootstrapData.teams;
  const events = bootstrapData.events;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Fixtures</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-dark-border bg-[#25252B] p-4 sm:flex-row">
        {/* Gameweek Selector */}
        <div className="flex-1">
          <label
            htmlFor="gameweek-select"
            className="mb-2 block text-sm font-medium text-white"
          >
            Gameweek
          </label>
          <select
            id="gameweek-select"
            value={selectedGameweek ?? ''}
            onChange={(e) =>
              setSelectedGameweek(
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
            className="w-full rounded-md border border-dark-border bg-[#2A2A35] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="" className="bg-[#2A2A35] text-white">All Gameweeks</option>
            {events.map((event) => (
              <option key={event.id} value={event.id} className="bg-[#2A2A35] text-white">
                {event.name} {event.finished ? '(Finished)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Team Filter */}
        <div className="flex-1">
          <label
            htmlFor="team-select"
            className="mb-2 block text-sm font-medium text-white"
          >
            Filter by Team
          </label>
          <select
            id="team-select"
            value={selectedTeamId ?? ''}
            onChange={(e) =>
              setSelectedTeamId(
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
            className="w-full rounded-md border border-dark-border bg-[#2A2A35] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="" className="bg-[#2A2A35] text-white">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id} className="bg-[#2A2A35] text-white">
                {team.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(selectedGameweek !== null || selectedTeamId !== null) && (
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedGameweek(null);
                setSelectedTeamId(null);
              }}
              className="rounded-md border border-dark-border bg-[#2A2A35] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2F2F3A]"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Fixtures List */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredFixtures.length === 0 ? (
        <div className="rounded-lg border border-dark-border bg-[#25252B] p-8 text-center">
          <p className="text-slate-300">No fixtures found matching your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFixtures.map((fixture) => {
            const homeTeam = teams.find((t) => t.id === fixture.team_h);
            const awayTeam = teams.find((t) => t.id === fixture.team_a);

            if (!homeTeam || !awayTeam) {
              return null;
            }

            return (
              <FixtureCard
                key={fixture.id}
                fixture={fixture}
                homeTeam={homeTeam}
                awayTeam={awayTeam}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
