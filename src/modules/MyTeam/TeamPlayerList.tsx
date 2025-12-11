import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamContext } from '@/context/TeamContext';
import { getBootstrapData } from '@/services/api';
import type { Player, Team } from '@/types/fpl';
import { getPositionName } from '@/lib/utils';
import { TeamPlayerCard } from './TeamPlayerCard';

interface TeamPlayerListProps {
  players: Player[];
}

export function TeamPlayerList({ players }: TeamPlayerListProps) {
  const { teamPicks } = useTeamContext();
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [teams, setTeams] = useState<Team[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getBootstrapData().then((data) => setTeams(data.teams));
  }, []);

  // Get captain and vice-captain IDs
  const captainId = teamPicks?.picks.find((p) => p.is_captain)?.element;
  const viceCaptainId = teamPicks?.picks.find((p) => p.is_vice_captain)?.element;

  // Filter players by position
  const filteredPlayers = players.filter((player) => {
    if (filterPosition === 'all') return true;
    return getPositionName(player.element_type) === filterPosition;
  });

  // Separate starters (position 1-11) and bench (position 12-15)
  const starters = filteredPlayers
    .filter((player) => {
      const pick = teamPicks?.picks.find((p) => p.element === player.id);
      return pick && pick.position <= 11;
    })
    .sort((a, b) => {
      const pickA = teamPicks?.picks.find((p) => p.element === a.id);
      const pickB = teamPicks?.picks.find((p) => p.element === b.id);
      return (pickA?.position ?? 99) - (pickB?.position ?? 99);
    });

  const bench = filteredPlayers
    .filter((player) => {
      const pick = teamPicks?.picks.find((p) => p.element === player.id);
      return pick && pick.position > 11;
    })
    .sort((a, b) => {
      const pickA = teamPicks?.picks.find((p) => p.element === a.id);
      const pickB = teamPicks?.picks.find((p) => p.element === b.id);
      return (pickA?.position ?? 99) - (pickB?.position ?? 99);
    });

  const handlePlayerClick = (playerId: number) => {
    navigate(`/my-team/player/${playerId}`);
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
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filterPosition === pos
                  ? 'bg-violet-500 text-white'
                  : 'bg-[#2A2A35] text-slate-300 hover:bg-[#2F2F3A]'
              }`}
            >
              {pos === 'all' ? 'All' : pos}
            </button>
          ))}
        </div>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          No players found for this position.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Starting XI */}
          {starters.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-white">
                Starting XI ({starters.length})
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {starters.map((player) => {
                  const pick = teamPicks?.picks.find((p) => p.element === player.id);
                  const isCaptain = player.id === captainId;
                  const isViceCaptain = player.id === viceCaptainId;

                  return (
                    <TeamPlayerCard
                      key={player.id}
                      player={player}
                      teamName={teams.find((t) => t.id === player.team)?.short_name || `Team ${player.team}`}
                      isStarter={true}
                      isCaptain={isCaptain}
                      isViceCaptain={isViceCaptain}
                      position={pick?.position}
                      onClick={() => handlePlayerClick(player.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Bench */}
          {bench.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-white">
                Bench ({bench.length})
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bench.map((player) => {
                  const pick = teamPicks?.picks.find((p) => p.element === player.id);

                  return (
                    <TeamPlayerCard
                      key={player.id}
                      player={player}
                      teamName={teams.find((t) => t.id === player.team)?.short_name || `Team ${player.team}`}
                      isStarter={false}
                      isCaptain={false}
                      isViceCaptain={false}
                      position={pick?.position}
                      onClick={() => handlePlayerClick(player.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

