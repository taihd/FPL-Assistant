import { getBootstrapData } from '@/services/api';
import { useEffect, useState } from 'react';
import type { PlayerFixture } from '@/types/player';
import type { Team } from '@/types/fpl';

interface PlayerFixturesProps {
  fixtures: PlayerFixture[];
}

const getDifficultyColor = (difficulty: number): string => {
  switch (difficulty) {
    case 1:
      return 'bg-lime-100 text-lime-800 border-lime-300';
    case 2:
      return 'bg-green-100 text-green-800 border-green-300';
    case 3:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 4:
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 5:
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

const getDifficultyLabel = (difficulty: number): string => {
  switch (difficulty) {
    case 1:
      return 'Very Easy';
    case 2:
      return 'Easy';
    case 3:
      return 'Medium';
    case 4:
      return 'Hard';
    case 5:
      return 'Very Hard';
    default:
      return 'Unknown';
  }
};

export function PlayerFixtures({ fixtures }: PlayerFixturesProps) {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    getBootstrapData().then((data) => setTeams(data.teams));
  }, []);

  // Get next 5 upcoming fixtures
  const upcomingFixtures = fixtures
    .filter((f) => !f.finished && f.event)
    .sort((a, b) => (a.event || 0) - (b.event || 0))
    .slice(0, 5);

  if (upcomingFixtures.length === 0) {
    return (
      <div className="py-4 text-center text-slate-500">
        No upcoming fixtures available.
      </div>
    );
  }

  const getTeamName = (teamId: number): string => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.short_name : `Team ${teamId}`;
  };

  return (
    <div className="space-y-3">
      {upcomingFixtures.map((fixture) => (
        <div
          key={fixture.id}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">
                GW {fixture.event}
              </span>
              {fixture.is_home ? (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                  H
                </span>
              ) : (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  A
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {fixture.is_home
                ? `${getTeamName(fixture.team_h)} vs ${getTeamName(fixture.team_a)}`
                : `${getTeamName(fixture.team_a)} vs ${getTeamName(fixture.team_h)}`}
            </div>
            {fixture.kickoff_time && (
              <div className="mt-1 text-xs text-slate-500">
                {new Date(fixture.kickoff_time).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            )}
          </div>
          <div
            className={`rounded-md border px-3 py-1.5 text-center ${getDifficultyColor(fixture.difficulty)}`}
          >
            <div className="text-xs font-medium">
              {getDifficultyLabel(fixture.difficulty)}
            </div>
            <div className="text-xs">({fixture.difficulty})</div>
          </div>
        </div>
      ))}
    </div>
  );
}

