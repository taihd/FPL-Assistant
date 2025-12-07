import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Player, Team } from '@/types/fpl';
import { formatPrice, getPositionName } from '@/lib/utils';

interface PositionComparisonProps {
  currentPlayer: Player;
  teams: Team[];
  allPlayers: Player[];
  limit?: number;
  selectedForCompare?: number[];
  onAddToCompare?: (playerId: number) => void;
}

export function PositionComparison({
  currentPlayer,
  teams,
  allPlayers,
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
        <p className="text-sm text-slate-600">
          Top {topPlayers.length} players in {getPositionName(currentPlayer.element_type)} position
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Player
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                Team
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Price
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Points
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Form
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Goals
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Assists
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {topPlayers.map((player, index) => {
              const isCurrentPlayer = player.id === currentPlayer.id;
              return (
                <tr
                  key={player.id}
                  className={isCurrentPlayer ? 'bg-blue-50' : 'hover:bg-slate-50'}
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">#{index + 1}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {player.web_name}
                          {isCurrentPlayer && (
                            <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {player.first_name} {player.second_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                    {getTeamName(player.team)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-900">
                    {formatPrice(player.now_cost)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    {player.total_points}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600">
                    {player.form || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600">
                    {player.goals_scored}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600">
                    {player.assists}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    {selectedForCompare.includes(player.id) ? (
                      <span className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800">
                        Added
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddToCompare(player.id)}
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
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

