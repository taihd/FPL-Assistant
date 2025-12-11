import type { Player, Team, ElementType } from '@/types/fpl';
import { formatPrice, isHigherBetter, findBestAndWorst } from '@/lib/utils';

interface PlayerCompareProps {
  players: Array<{
    player: Player;
    team: Team;
    position: ElementType;
  }>;
}

export function PlayerCompare({ players }: PlayerCompareProps) {
  if (players.length === 0) {
    return (
      <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
        <p className="text-center text-slate-300">Select players to compare</p>
      </div>
    );
  }

  // Calculate best/worst for each stat
  const getStatValue = (
    item: { player: Player; team: Team; position: ElementType },
    stat: string
  ): number => {
    const { player } = item;
    switch (stat) {
      case 'price':
        return player.now_cost;
      case 'points':
        return player.total_points;
      case 'pointsPerGame':
        return parseFloat(player.points_per_game || '0');
      case 'form':
        return parseFloat(player.form || '0');
      case 'ownership':
        return parseFloat(player.selected_by_percent);
      case 'goals':
        return player.goals_scored;
      case 'assists':
        return player.assists;
      case 'ict':
        return parseFloat(player.ict_index || '0');
      case 'minutes':
        return player.minutes;
      case 'cleanSheets':
        return player.clean_sheets;
      default:
        return 0;
    }
  };

  const priceBestWorst = findBestAndWorst(
    players,
    (item) => getStatValue(item, 'price'),
    isHigherBetter('price')
  );
  const pointsBestWorst = findBestAndWorst(
    players,
    (item) => getStatValue(item, 'points'),
    isHigherBetter('points')
  );
  const pointsPerGameBestWorst = findBestAndWorst(
    players,
    (item) => getStatValue(item, 'pointsPerGame'),
    isHigherBetter('pointsPerGame')
  );
  const formBestWorst = findBestAndWorst(
    players,
    (item) => getStatValue(item, 'form'),
    isHigherBetter('form')
  );
  const ownershipBestWorst = findBestAndWorst(
    players,
    (item) => getStatValue(item, 'ownership'),
    isHigherBetter('ownership')
  );
  const goalsBestWorst = findBestAndWorst(
    players,
    (item) => getStatValue(item, 'goals'),
    isHigherBetter('goals')
  );
  const assistsBestWorst = findBestAndWorst(
    players,
    (item) => getStatValue(item, 'assists'),
    isHigherBetter('assists')
  );
  const ictBestWorst = findBestAndWorst(
    players,
    (item) => getStatValue(item, 'ict'),
    isHigherBetter('ict')
  );
  const minutesBestWorst = findBestAndWorst(
    players,
    (item) => getStatValue(item, 'minutes'),
    isHigherBetter('minutes')
  );
  const cleanSheetsBestWorst = findBestAndWorst(
    players,
    (item) => getStatValue(item, 'cleanSheets'),
    isHigherBetter('cleanSheets')
  );

  const getCellClassName = (
    statBestWorst: { bestIndices: number[]; worstIndices: number[] },
    index: number,
    baseClasses: string
  ): string => {
    if (statBestWorst.bestIndices.includes(index)) {
      return `${baseClasses} font-bold text-green-400`;
    }
    if (statBestWorst.worstIndices.includes(index)) {
      return `${baseClasses} opacity-50`;
    }
    return baseClasses;
  };

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
              <th className="px-4 py-2 text-center font-semibold text-slate-400">Clean Sheets</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">Minutes</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">ICT</th>
            </tr>
          </thead>
          <tbody>
            {players.map(({ player, team, position }, index) => {
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
                  <td
                    className={getCellClassName(
                      priceBestWorst,
                      index,
                      'px-4 py-2 text-center text-slate-300'
                    )}
                  >
                    {formatPrice(player.now_cost)}
                  </td>
                  <td
                    className={getCellClassName(
                      pointsBestWorst,
                      index,
                      'px-4 py-2 text-center font-semibold text-white'
                    )}
                  >
                    {player.total_points}
                  </td>
                  <td
                    className={getCellClassName(
                      pointsPerGameBestWorst,
                      index,
                      'px-4 py-2 text-center text-slate-300'
                    )}
                  >
                    {pointsPerGame}
                  </td>
                  <td
                    className={getCellClassName(
                      formBestWorst,
                      index,
                      'px-4 py-2 text-center text-slate-300'
                    )}
                  >
                    {form}
                  </td>
                  <td
                    className={getCellClassName(
                      ownershipBestWorst,
                      index,
                      'px-4 py-2 text-center text-slate-300'
                    )}
                  >
                    {ownership}%
                  </td>
                  <td
                    className={getCellClassName(
                      goalsBestWorst,
                      index,
                      'px-4 py-2 text-center text-slate-300'
                    )}
                  >
                    {player.goals_scored}
                  </td>
                  <td
                    className={getCellClassName(
                      assistsBestWorst,
                      index,
                      'px-4 py-2 text-center text-slate-300'
                    )}
                  >
                    {player.assists}
                  </td>
                  <td
                    className={getCellClassName(
                      cleanSheetsBestWorst,
                      index,
                      'px-4 py-2 text-center text-slate-300'
                    )}
                  >
                    {player.clean_sheets}
                  </td>
                  <td
                    className={getCellClassName(
                      minutesBestWorst,
                      index,
                      'px-4 py-2 text-center text-slate-300'
                    )}
                  >
                    {player.minutes.toLocaleString()}
                  </td>
                  <td
                    className={getCellClassName(
                      ictBestWorst,
                      index,
                      'px-4 py-2 text-center text-slate-300'
                    )}
                  >
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

