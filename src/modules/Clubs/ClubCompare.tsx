import type { Team } from '@/types/fpl';

interface ClubCompareProps {
  teams: Team[];
}

export function ClubCompare({ teams }: ClubCompareProps) {
  if (teams.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <p className="text-center text-slate-600">Select teams to compare</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Team Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left font-semibold text-slate-700">Team</th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">
                Strength
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">
                Attack (H)
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">
                Attack (A)
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">
                Defence (H)
              </th>
              <th className="px-4 py-2 text-center font-semibold text-slate-700">
                Defence (A)
              </th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id} className="border-b">
                <td className="px-4 py-2 font-medium text-slate-900">{team.name}</td>
                <td className="px-4 py-2 text-center text-slate-600">
                  {team.strength}
                </td>
                <td className="px-4 py-2 text-center text-slate-600">
                  {team.strength_attack_home}
                </td>
                <td className="px-4 py-2 text-center text-slate-600">
                  {team.strength_attack_away}
                </td>
                <td className="px-4 py-2 text-center text-slate-600">
                  {team.strength_defence_home}
                </td>
                <td className="px-4 py-2 text-center text-slate-600">
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

