import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Player, Team, ElementType } from '@/types/fpl';
import { formatPrice, getPositionName } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { NewsIndicator } from '@/components/NewsIndicator';

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

interface PositionComparisonProps {
  currentPlayer: Player;
  teams: Team[];
  allPlayers: Player[];
  positions?: ElementType[];
  limit?: number;
  selectedForCompare?: number[];
  onAddToCompare?: (playerId: number) => void;
}

export function PositionComparison({
  currentPlayer,
  teams,
  allPlayers,
  positions = [],
  limit = 10,
  selectedForCompare = [],
  onAddToCompare,
}: PositionComparisonProps) {
  const navigate = useNavigate();

  // Get top players in same position, excluding current player
  const topPlayers = useMemo(() => {
    return allPlayers
      .filter((p) => p.element_type === currentPlayer.element_type && p.id !== currentPlayer.id)
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, limit);
  }, [allPlayers, currentPlayer.element_type, currentPlayer.id, limit]);

  const handleAddToCompare = (playerId: number) => {
    if (onAddToCompare) {
      onAddToCompare(playerId);
    } else {
      // Fallback: navigate directly if no handler provided
      navigate(`/my-team/compare?players=${currentPlayer.id},${playerId}`);
    }
  };

  const getTeamName = (teamId: number): string => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.short_name : `Team ${teamId}`;
  };

  if (topPlayers.length === 0) {
    return (
      <div className="py-4 text-center text-slate-500">
        No other players found in this position.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">
          Top {topPlayers.length} players in {getPositionName(currentPlayer.element_type)} position
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-border">
          <thead className="bg-[#2A2A35]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Player
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Team
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                Price
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                Points
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                Form
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                Goals
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                Assists
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border bg-[#25252B]">
            {topPlayers.map((player, index) => {
              const isCurrentPlayer = player.id === currentPlayer.id;
              const position = positions.find((p) => p.id === player.element_type);
              return (
                <tr
                  key={player.id}
                  className={cn(
                    'hover:bg-[#2A2A35] transition-colors',
                    isCurrentPlayer && 'bg-violet-500/10'
                  )}
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">#{index + 1}</span>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium text-white">
                          {player.web_name}
                          <NewsIndicator news={player.news} />
                          {isCurrentPlayer && (
                            <span className="ml-2 rounded bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-400 border border-violet-500/30">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {player.first_name} {player.second_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                    {getTeamName(player.team)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                    {formatPrice(player.now_cost)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold text-white">
                    {player.total_points}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                    {player.form || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                    {player.goals_scored}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                    {player.assists}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {selectedForCompare.includes(player.id) ? (
                      <span className="rounded-md bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 border border-green-500/30">
                        Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddToCompare(player.id)}
                        className="rounded-md bg-violet-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-600"
                      >
                        Add to Compare
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

