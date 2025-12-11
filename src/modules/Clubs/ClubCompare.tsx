import type { Team } from '@/types/fpl';

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
            {teams.map((team) => (
              <tr key={team.id} className="border-b border-dark-border">
                <td className="px-4 py-2 font-medium text-white">{team.name}</td>
                <td className="px-4 py-2 text-center text-slate-300">
                  {team.strength}
                </td>
                <td className="px-4 py-2 text-center text-slate-300">
                  {team.strength_attack_home}
                </td>
                <td className="px-4 py-2 text-center text-slate-300">
                  {team.strength_attack_away}
                </td>
                <td className="px-4 py-2 text-center text-slate-300">
                  {team.strength_defence_home}
                </td>
                <td className="px-4 py-2 text-center text-slate-300">
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

