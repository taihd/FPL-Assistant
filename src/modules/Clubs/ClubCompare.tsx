import type { Team } from '@/types/fpl';
import { isHigherBetter, findBestAndWorst } from '@/lib/utils';

interface ClubCompareProps {
  teams: Team[];
}

export function ClubCompare({ teams }: ClubCompareProps) {
  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
        <p className="text-center text-slate-300">Select teams to compare</p>
      </div>
    );
  }

  // Calculate best/worst for each stat (all higher is better for team stats)
  const strengthBestWorst = findBestAndWorst(
    teams,
    (team) => team.strength,
    isHigherBetter('strength')
  );
  const attackHomeBestWorst = findBestAndWorst(
    teams,
    (team) => team.strength_attack_home,
    isHigherBetter('attack')
  );
  const attackAwayBestWorst = findBestAndWorst(
    teams,
    (team) => team.strength_attack_away,
    isHigherBetter('attack')
  );
  const defenceHomeBestWorst = findBestAndWorst(
    teams,
    (team) => team.strength_defence_home,
    isHigherBetter('defence')
  );
  const defenceAwayBestWorst = findBestAndWorst(
    teams,
    (team) => team.strength_defence_away,
    isHigherBetter('defence')
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
      <h3 className="mb-4 text-lg font-semibold text-white">Team Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="px-4 py-2 text-left font-semibold text-slate-400">Team</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">
                Strength
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">
                Attack (H)
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">
                Attack (A)
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">
                Defence (H)
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-400">
                Defence (A)
              </th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={team.id} className="border-b border-dark-border">
                <td className="px-4 py-2 font-medium text-white">{team.name}</td>
                <td
                  className={getCellClassName(
                    strengthBestWorst,
                    index,
                    'px-4 py-2 text-center text-slate-300'
                  )}
                >
                  {team.strength}
                </td>
                <td
                  className={getCellClassName(
                    attackHomeBestWorst,
                    index,
                    'px-4 py-2 text-center text-slate-300'
                  )}
                >
                  {team.strength_attack_home}
                </td>
                <td
                  className={getCellClassName(
                    attackAwayBestWorst,
                    index,
                    'px-4 py-2 text-center text-slate-300'
                  )}
                >
                  {team.strength_attack_away}
                </td>
                <td
                  className={getCellClassName(
                    defenceHomeBestWorst,
                    index,
                    'px-4 py-2 text-center text-slate-300'
                  )}
                >
                  {team.strength_defence_home}
                </td>
                <td
                  className={getCellClassName(
                    defenceAwayBestWorst,
                    index,
                    'px-4 py-2 text-center text-slate-300'
                  )}
                >
                  {team.strength_defence_away}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

