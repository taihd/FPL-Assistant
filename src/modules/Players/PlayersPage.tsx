import { useEffect, useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useFPLApi } from '@/hooks/useFPLApi';
import { PlayerCard } from './PlayerCard';
import { PlayerCompare } from './PlayerCompare';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Player, Team, ElementType } from '@/types/fpl';
import { cn } from '@/lib/utils';

export function PlayersPage() {
  const { setScreen, setDataSnapshot } = useAppContext();
  const { fetchBootstrapData } = useFPLApi();

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [positions, setPositions] = useState<ElementType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'points' | 'price' | 'form' | 'ownership'>('points');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setScreen('players');
    setError(null);
    setIsLoading(true);

    const loadData = async () => {
      try {
        const bootstrap = await fetchBootstrapData();

        setPlayers(bootstrap.elements);
        setTeams(bootstrap.teams);
        setPositions(bootstrap.element_types);

        // Update context for AI
        setDataSnapshot({
          players: bootstrap.elements,
          teams: bootstrap.teams,
          positions: bootstrap.element_types,
        });

        setError(null);
      } catch (err) {
        console.error('Failed to load players data:', err);
        const errorMessage =
          err instanceof Error
            ? err
            : new Error('Failed to load players data. Please try again later.');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setScreen, setDataSnapshot, fetchBootstrapData]);

  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    let filtered = players;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (player) =>
          player.web_name.toLowerCase().includes(query) ||
          player.first_name.toLowerCase().includes(query) ||
          player.second_name.toLowerCase().includes(query)
      );
    }

    // Position filter
    if (selectedPosition !== null) {
      filtered = filtered.filter((player) => player.element_type === selectedPosition);
    }

    // Team filter
    if (selectedTeam !== null) {
      filtered = filtered.filter((player) => player.team === selectedTeam);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.total_points - a.total_points;
        case 'price':
          return b.now_cost - a.now_cost;
        case 'form':
          return parseFloat(b.form || '0') - parseFloat(a.form || '0');
        case 'ownership':
          return (
            parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent)
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [players, searchQuery, selectedPosition, selectedTeam, sortBy]);

  // Get selected players with their team and position data
  const selectedPlayersData = useMemo(() => {
    return selectedPlayerIds
      .map((playerId) => {
        const player = players.find((p) => p.id === playerId);
        if (!player) return null;

        const team = teams.find((t) => t.id === player.team);
        const position = positions.find((p) => p.id === player.element_type);

        if (!team || !position) return null;

        return { player, team, position };
      })
      .filter((item): item is { player: Player; team: Team; position: ElementType } =>
        item !== null
      );
  }, [selectedPlayerIds, players, teams, positions]);

  const togglePlayerSelection = (playerId: number) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Players</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Players</h1>
        <div className="rounded-lg bg-red-50 p-6 text-red-800">
          <p className="mb-2 font-semibold">Error loading players</p>
          <p className="mb-4 text-sm">{error.message}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              const loadData = async () => {
                try {
                  const bootstrap = await fetchBootstrapData();
                  setPlayers(bootstrap.elements);
                  setTeams(bootstrap.teams);
                  setPositions(bootstrap.element_types);
                  setDataSnapshot({
                    players: bootstrap.elements,
                    teams: bootstrap.teams,
                    positions: bootstrap.element_types,
                  });
                  setError(null);
                } catch (err) {
                  const errorMessage =
                    err instanceof Error
                      ? err
                      : new Error('Failed to load players data');
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
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Players</h1>

      {/* Filters and Controls */}
      <div className="mb-6 space-y-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label
              htmlFor="player-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Search
            </label>
            <input
              id="player-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          {/* Position Filter */}
          <div>
            <label
              htmlFor="position-select"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Position
            </label>
            <select
              id="position-select"
              value={selectedPosition ?? ''}
              onChange={(e) =>
                setSelectedPosition(
                  e.target.value ? parseInt(e.target.value, 10) : null
                )
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">All Positions</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.plural_name}
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <label
              htmlFor="team-select"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Team
            </label>
            <select
              id="team-select"
              value={selectedTeam ?? ''}
              onChange={(e) =>
                setSelectedTeam(e.target.value ? parseInt(e.target.value, 10) : null)
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label
              htmlFor="sort-select"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Sort By
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'points' | 'price' | 'form' | 'ownership'
                )
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="points">Total Points</option>
              <option value="price">Price</option>
              <option value="form">Form</option>
              <option value="ownership">Ownership %</option>
            </select>
          </div>
        </div>

        {/* Comparison Controls */}
        {selectedPlayerIds.length > 0 && (
          <div className="flex items-center gap-2 border-t pt-4">
            <button
              onClick={() => setShowCompare(!showCompare)}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                showCompare
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              {showCompare ? 'Hide' : 'Show'} Comparison ({selectedPlayerIds.length})
            </button>
            <button
              onClick={() => {
                setSelectedPlayerIds([]);
                setShowCompare(false);
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Comparison View */}
      {showCompare && selectedPlayersData.length > 0 && (
        <div className="mb-6">
          <PlayerCompare players={selectedPlayersData} />
        </div>
      )}

      {/* Players Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">No players found matching your filters.</p>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm text-slate-600">
            Showing {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlayers.map((player) => {
              const team = teams.find((t) => t.id === player.team);
              const position = positions.find((p) => p.id === player.element_type);

              if (!team || !position) return null;

              return (
                <div key={player.id} className="relative">
                  <PlayerCard player={player} team={team} position={position} />
                  <button
                    onClick={() => togglePlayerSelection(player.id)}
                    className={cn(
                      'absolute right-2 top-2 rounded-full p-1.5 transition-colors',
                      selectedPlayerIds.includes(player.id)
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-white text-slate-400 shadow-sm hover:bg-slate-50 hover:text-slate-600'
                    )}
                    title={
                      selectedPlayerIds.includes(player.id)
                        ? 'Remove from comparison'
                        : 'Add to comparison'
                    }
                  >
                    {selectedPlayerIds.includes(player.id) ? (
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
