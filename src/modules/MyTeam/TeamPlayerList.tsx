import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamContext } from '@/context/TeamContext';
import { getBootstrapData } from '@/services/api';
import type { Player, Team, ElementType } from '@/types/fpl';
import { getPositionName, formatPrice, cn } from '@/lib/utils';
import { NewsIndicator } from '@/components/NewsIndicator';

interface TeamPlayerListProps {
  players: Player[];
}

export function TeamPlayerList({ players }: TeamPlayerListProps) {
  const { teamPicks } = useTeamContext();
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [teams, setTeams] = useState<Team[]>([]);
  const [positions, setPositions] = useState<ElementType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getBootstrapData().then((data) => {
      setTeams(data.teams);
      setPositions(data.element_types);
    });
  }, []);

  // Get captain and vice-captain IDs
  const captainId = teamPicks?.picks.find((p) => p.is_captain)?.element;
  const viceCaptainId = teamPicks?.picks.find((p) => p.is_vice_captain)?.element;

  // Filter players by position
  const filteredPlayers = players.filter((player) => {
    if (filterPosition === 'all') return true;
    return getPositionName(player.element_type) === filterPosition;
  });

  // Sort all players by position (1-15)
  const sortedPlayers = filteredPlayers
    .map((player) => {
      const pick = teamPicks?.picks.find((p) => p.element === player.id);
      return {
        player,
        pick,
        position: pick?.position ?? 99,
        isStarter: (pick?.position ?? 99) <= 11,
      };
    })
    .sort((a, b) => a.position - b.position);

  const handlePlayerClick = (playerId: number) => {
    navigate(`/my-team/player/${playerId}`);
  };

  const getPositionColor = (positionId: number): string => {
    switch (positionId) {
      case 1: // Goalkeeper
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
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

  return (
    <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">
          Team Players ({players.length})
        </h2>
        <div className="flex gap-2">
          {['all', 'GK', 'DEF', 'MID', 'FWD'].map((pos) => (
            <button
              key={pos}
              onClick={() => setFilterPosition(pos)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                filterPosition === pos
                  ? 'bg-violet-500 text-white'
                  : 'bg-[#2A2A35] text-slate-300 hover:bg-[#2F2F3A]'
              )}
            >
              {pos === 'all' ? 'All' : pos}
            </button>
          ))}
        </div>
      </div>

      {sortedPlayers.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          No players found for this position.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-[#2A2A35]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                  Position
                </th>
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
                  ICT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border bg-[#25252B]">
              {sortedPlayers.map(({ player, position, isStarter }) => {
                const team = teams.find((t) => t.id === player.team);
                const positionType = positions.find((p) => p.id === player.element_type);
                const isCaptain = player.id === captainId;
                const isViceCaptain = player.id === viceCaptainId;
                const form = parseFloat(player.form || '0');
                const ictIndex = parseFloat(player.ict_index || '0');

                return (
                  <tr
                    key={player.id}
                    className={cn(
                      'hover:bg-[#2A2A35] transition-colors cursor-pointer',
                      !isStarter && 'opacity-75'
                    )}
                    onClick={() => handlePlayerClick(player.id)}
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'rounded border px-2 py-1 text-xs font-medium',
                            getPositionColor(player.element_type)
                          )}
                        >
                          {positionType?.singular_name_short || getPositionName(player.element_type)}
                        </span>
                        <span className="text-sm font-medium text-slate-300">
                          {isStarter ? position : `B${position - 11}`}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div>
                        <div className="flex items-center gap-2 font-medium text-white">
                          {player.web_name}
                          <NewsIndicator news={player.news} />
                          {isCaptain && (
                            <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs font-medium text-yellow-400 border border-yellow-500/30">
                              C
                            </span>
                          )}
                          {isViceCaptain && (
                            <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/30">
                              VC
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {player.first_name} {player.second_name}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                      {team?.short_name || `Team ${player.team}`}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                      {formatPrice(player.now_cost)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold text-white">
                      {player.total_points}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                      {form > 0 ? form.toFixed(1) : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                      {player.goals_scored}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                      {player.assists}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300">
                      {ictIndex > 0 ? ictIndex.toFixed(1) : '0.0'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

