import { useState, useMemo, useEffect } from 'react';
import { getBootstrapData } from '@/services/api';
import type { Player, Team } from '@/types/fpl';
import { getPositionName } from '@/lib/utils';

interface PlayerSearchProps {
  onAddToCompare: (playerId: number) => void;
  selectedPlayerIds: number[];
  excludePlayerId?: number;
  samePositionOnly?: boolean;
  positionType?: number; // Element type (1=GK, 2=DEF, 3=MID, 4=FWD)
}

export function PlayerSearch({
  onAddToCompare,
  selectedPlayerIds,
  excludePlayerId,
  samePositionOnly = false,
  positionType,
}: PlayerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load players on mount
  useEffect(() => {
    getBootstrapData().then((data) => {
      setPlayers(data.elements);
      setTeams(data.teams);
    });
  }, []);

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return players
      .filter((p) => {
        if (excludePlayerId && p.id === excludePlayerId) return false;
        // Filter by position if samePositionOnly is true
        if (samePositionOnly && positionType !== undefined && p.element_type !== positionType) {
          return false;
        }
        return (
          p.web_name.toLowerCase().includes(query) ||
          p.first_name.toLowerCase().includes(query) ||
          p.second_name.toLowerCase().includes(query)
        );
      })
      .slice(0, 10); // Limit to 10 results
  }, [searchQuery, players, excludePlayerId, samePositionOnly, positionType]);

  const getTeamName = (teamId: number): string => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.short_name : `Team ${teamId}`;
  };

  const handleSelectPlayer = (playerId: number) => {
    if (!selectedPlayerIds.includes(playerId)) {
      onAddToCompare(playerId);
    }
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search for a player to compare..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
          {isOpen && searchQuery.trim() && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.id);
              return (
                <button
                  key={player.id}
                  onClick={() => handleSelectPlayer(player.id)}
                  disabled={isSelected}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-50 ${
                    isSelected ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{player.web_name}</div>
                        <div className="text-xs text-slate-500">
                          {getPositionName(player.element_type)} • {getTeamName(player.team)} • {player.total_points} pts • £{(player.now_cost/10).toFixed(1)}m
                        </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs text-slate-400">Added</span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-2 text-sm text-slate-500">No players found</div>
          )}
        </div>
      )}
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

