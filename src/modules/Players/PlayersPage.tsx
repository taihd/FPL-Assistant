import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useFPLApi } from '@/hooks/useFPLApi';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ComparisonFooter } from '@/components/ComparisonFooter';
import { NewsIndicator } from '@/components/NewsIndicator';
import type { Player, Team, ElementType } from '@/types/fpl';
import { cn, formatPrice } from '@/lib/utils';

type SortField =
  | 'player'
  | 'price'
  | 'points'
  | 'goals'
  | 'assists'
  | 'cleanSheets'
  | 'form'
  | 'ict'
  | 'luck';
type SortDirection = 'asc' | 'desc';

const getPositionColor = (positionId: number): string => {
  switch (positionId) {
    case 1: // Goalkeeper
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 2: // Defender
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 3: // Midfielder
      return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
    case 4: // Forward
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

export function PlayersPage() {
  const navigate = useNavigate();
  const { setScreen, setDataSnapshot } = useAppContext();
  const { fetchBootstrapData } = useFPLApi();

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [positions, setPositions] = useState<ElementType[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('points');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
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
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((player) => {
        const fullName = `${player.first_name} ${player.second_name} ${player.web_name}`.toLowerCase();
        return fullName.includes(query);
      });
    }

    // Position filter (multi-select)
    if (selectedPositions.length > 0) {
      filtered = filtered.filter((player) =>
        selectedPositions.includes(player.element_type)
      );
    }

    // Team filter (multi-select)
    if (selectedTeams.length > 0) {
      filtered = filtered.filter((player) => selectedTeams.includes(player.team));
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'player':
          comparison = a.web_name.localeCompare(b.web_name);
          break;
        case 'price':
          comparison = a.now_cost - b.now_cost;
          break;
        case 'points':
          comparison = a.total_points - b.total_points;
          break;
        case 'goals':
          comparison = a.goals_scored - b.goals_scored;
          break;
        case 'assists':
          comparison = a.assists - b.assists;
          break;
        case 'cleanSheets':
          comparison = a.clean_sheets - b.clean_sheets;
          break;
        case 'form':
          comparison = parseFloat(a.form || '0') - parseFloat(b.form || '0');
          break;
        case 'ict':
          comparison = parseFloat(a.ict_index || '0') - parseFloat(b.ict_index || '0');
          break;
        case 'luck':
          // Luck calculation: points - expected points (simplified)
          // For now, we'll use a placeholder calculation
          const aLuck = a.total_points - parseFloat(a.ict_index || '0') * 0.5;
          const bLuck = b.total_points - parseFloat(b.ict_index || '0') * 0.5;
          comparison = aLuck - bLuck;
          break;
        default:
          return 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [players, searchQuery, selectedPositions, selectedTeams, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const togglePosition = (positionId: number) => {
    setSelectedPositions((prev) =>
      prev.includes(positionId)
        ? prev.filter((id) => id !== positionId)
        : [...prev, positionId]
    );
  };

  const toggleTeam = (teamId: number) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const togglePlayerSelection = (playerId: number) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleCompareClick = () => {
    if (selectedPlayerIds.length > 0) {
      navigate(`/my-team/compare?players=${selectedPlayerIds.join(',')}`);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="ml-1 h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="ml-1 h-3 w-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="ml-1 h-3 w-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-white">Players</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-white">Players</h1>
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6">
          <p className="mb-2 font-semibold text-red-400">Error loading players</p>
          <p className="mb-4 text-sm text-red-300">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={selectedPlayerIds.length > 0 ? 'pb-20' : ''}>
      <h1 className="mb-6 text-3xl font-bold text-white">Players</h1>

      {/* Filters */}
      <div className="mb-6 space-y-4 rounded-lg border border-dark-border bg-[#25252B] p-4">
        {/* Search */}
        <div>
          <div className="mb-2 text-sm font-medium text-white">Search Players</div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by player name..."
            className="w-full rounded-md border border-dark-border bg-[#2A2A35] px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>

        {/* Position Filter */}
        <div>
          <div className="mb-2 text-sm font-medium text-white">Position</div>
          <div className="flex flex-wrap gap-2">
            {positions.map((position) => {
              const isSelected = selectedPositions.includes(position.id);
              return (
                <button
                  key={position.id}
                  onClick={() => togglePosition(position.id)}
                  className={cn(
                    'rounded border px-3 py-1.5 text-sm font-medium transition-colors',
                    getPositionColor(position.id),
                    isSelected && 'ring-2 ring-violet-500'
                  )}
                >
                  {position.plural_name_short}
                </button>
              );
            })}
          </div>
        </div>

        {/* Team Filter */}
        <div>
          <div className="mb-2 text-sm font-medium text-white">Team</div>
          <div className="flex flex-wrap gap-2">
            {teams.map((team) => {
              const isSelected = selectedTeams.includes(team.id);
              return (
                <button
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  className={cn(
                    'rounded border border-dark-border px-3 py-1.5 text-sm font-medium transition-colors',
                    isSelected
                      ? 'bg-violet-500/20 text-violet-400 border-violet-500/50'
                      : 'bg-[#2A2A35] text-slate-300 hover:bg-[#2F2F3A] hover:text-white'
                  )}
                >
                  {team.short_name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="rounded-lg border border-dark-border bg-[#25252B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-[#2A2A35]">
              <tr>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  onClick={() => handleSort('player')}
                >
                  <div className="flex items-center">
                    Player
                    <SortIcon field="player" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Actions
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  onClick={() => handleSort('player')}
                >
                  <div className="flex items-center">
                    Pos
                    <SortIcon field="player" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center justify-center">
                    Price
                    <SortIcon field="price" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  onClick={() => handleSort('points')}
                >
                  <div className="flex items-center justify-center">
                    Pts
                    <SortIcon field="points" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  onClick={() => handleSort('goals')}
                >
                  <div className="flex items-center justify-center">
                    G
                    <SortIcon field="goals" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  onClick={() => handleSort('assists')}
                >
                  <div className="flex items-center justify-center">
                    A
                    <SortIcon field="assists" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  onClick={() => handleSort('cleanSheets')}
                >
                  <div className="flex items-center justify-center">
                    CS
                    <SortIcon field="cleanSheets" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  onClick={() => handleSort('form')}
                >
                  <div className="flex items-center justify-center">
                    Form
                    <SortIcon field="form" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  onClick={() => handleSort('ict')}
                >
                  <div className="flex items-center justify-center">
                    ICT
                    <SortIcon field="ict" />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  onClick={() => handleSort('luck')}
                >
                  <div className="flex items-center justify-center">
                    Luck
                    <SortIcon field="luck" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border bg-[#25252B]">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-300">
                    No players found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => {
                  const team = teams.find((t) => t.id === player.team);
                  const position = positions.find((p) => p.id === player.element_type);
                  if (!team || !position) return null;

                  const isSelected = selectedPlayerIds.includes(player.id);
                  const form = parseFloat(player.form || '0');
                  const ictIndex = parseFloat(player.ict_index || '0');
                  // Simplified luck calculation
                  const luck = player.total_points - ictIndex * 0.5;

                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-[#2A2A35] transition-colors cursor-pointer"
                      onClick={() => navigate(`/my-team/player/${player.id}`, { state: { from: 'players' } })}
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2 font-medium text-white">
                            {player.web_name}
                            <NewsIndicator news={player.news} />
                          </div>
                          <div className="text-xs text-slate-400">{team.short_name}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlayerSelection(player.id);
                            }}
                            className={cn(
                              'rounded p-1 transition-colors',
                              isSelected
                                ? 'text-violet-400 hover:text-violet-300'
                                : 'text-slate-400 hover:text-slate-300'
                            )}
                            title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/my-team/player/${player.id}`, { state: { from: 'players' } });
                            }}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="View player details"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={cn(
                            'rounded border px-2 py-1 text-xs font-medium',
                            getPositionColor(player.element_type)
                          )}
                        >
                          {position.singular_name_short}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                        {formatPrice(player.now_cost)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold text-white">
                        {player.total_points}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                        {player.goals_scored}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                        {player.assists}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                        {player.clean_sheets}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                        {form > 0 ? form.toFixed(1) : '0.0'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                        {ictIndex.toFixed(1)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                        <span
                          className={cn(
                            luck >= 0 ? 'text-green-400' : 'text-red-400'
                          )}
                        >
                          {luck >= 0 ? '+' : ''}
                          {luck.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Footer */}
      <ComparisonFooter
        selectedItems={selectedPlayerIds.map((playerId) => {
          const player = players.find((p) => p.id === playerId);
          const position = positions.find((p) => p.id === player?.element_type);
          return {
            id: playerId,
            name: player?.web_name || `Player ${playerId}`,
            label: position?.singular_name_short,
          };
        })}
        onRemove={togglePlayerSelection}
        onClearAll={() => setSelectedPlayerIds([])}
        onCompare={handleCompareClick}
        type="players"
        positions={positions}
      />
    </div>
  );
}
