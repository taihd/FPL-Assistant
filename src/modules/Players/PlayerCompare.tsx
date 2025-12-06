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
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-center text-slate-600">Select players to compare</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Player Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left font-semibold text-slate-700">Player</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">Team</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">Price</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">Points</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">Pts/G</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">Form</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">Own%</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">Goals</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">Assists</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">ICT</th>
            </tr>
          </thead>
          <tbody>
            {players.map(({ player, team, position }) => {
              const ownership = parseFloat(player.selected_by_percent);
              const form = parseFloat(player.form || '0');
              const pointsPerGame = parseFloat(player.points_per_game || '0');

              return (
                <tr key={player.id} className="border-b">
                  <td className="px-4 py-2">
                    <div>
                      <div className="font-medium text-slate-900">{player.web_name}</div>
                      <div className="text-xs text-slate-500">
                        {position.singular_name_short}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center text-slate-600">
                    {team.short_name}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-600">
                    {formatPrice(player.now_cost)}
                  </td>
                  <td className="px-4 py-2 text-center font-semibold text-slate-900">
                    {player.total_points}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-600">
                    {pointsPerGame}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-600">{form}</td>
                  <td className="px-4 py-2 text-center text-slate-600">
                    {ownership}%
                  </td>
                  <td className="px-4 py-2 text-center text-slate-600">
                    {player.goals_scored}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-600">
                    {player.assists}
                  </td>
                  <td className="px-4 py-2 text-center text-slate-600">
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

