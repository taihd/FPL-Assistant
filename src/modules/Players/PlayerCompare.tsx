import type { Player, Team, ElementType } from '@/types/fpl';

interface PlayerCompareProps {
  players: Array<{
    player: Player;
    team: Team;
    position: ElementType;
  }>;
}

const formatPrice = (cost: number): string => {
  return `£${(cost / 10).toFixed(1)}m`;
};

export function PlayerCompare({ players }: PlayerCompareProps) {
  if (players.length === 0) {
    return (
      <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
        <p className="text-center text-slate-300">Select players to compare</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Player Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="px-4 py-2 text-left font-semibold text-slate-400">Player</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">Team</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">Price</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">Points</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">Pts/G</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">Form</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">Own%</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">Goals</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">Assists</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">ICT</th>
            </tr>
          </thead>
          <tbody>
            {players.map(({ player, team, position }) => {
              const ownership = parseFloat(player.selected_by_percent);
              const form = parseFloat(player.form || '0');
              const pointsPerGame = parseFloat(player.points_per_game || '0');

              return (
                <tr key={player.id} className="border-b border-dark-border">
                  <td className="px-4 py-2">
                    <div>
                      <div className="font-medium text-white">{player.web_name}</div>
                      <div className="text-xs text-slate-400">
                        {position.singular_name_short}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center text-slate-300">
                    {team.short_name}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-300">
                    {formatPrice(player.now_cost)}
                  </td>
                  <td className="px-4 py-2 text-center font-semibold text-white">
                    {player.total_points}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-300">
                    {pointsPerGame}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-300">{form}</td>
                  <td className="px-4 py-2 text-center text-slate-300">
                    {ownership}%
                  </td>
                  <td className="px-4 py-2 text-center text-slate-300">
                    {player.goals_scored}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-300">
                    {player.assists}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-300">
                    {player.ict_index}
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

