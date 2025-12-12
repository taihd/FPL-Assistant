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
      return 'bg-lime-500/20 text-lime-400 border-lime-500/30';
    case 2:
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 3:
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 4:
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 5:
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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
      <div className="py-4 text-center text-slate-400">
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
          className="flex items-center justify-between rounded-lg border border-dark-border bg-[#2A2A35] p-4"
        >
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium text-slate-400">
                GW {fixture.event}
              </span>
              {fixture.is_home ? (
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/30">
                  H
                </span>
              ) : (
                <span className="rounded bg-slate-500/20 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/30">
                  A
                </span>
              )}
            </div>
            <div className="text-sm font-semibold text-white">
              {fixture.is_home
                ? `${getTeamName(fixture.team_h)} vs ${getTeamName(fixture.team_a)}`
                : `${getTeamName(fixture.team_a)} vs ${getTeamName(fixture.team_h)}`}
            </div>
            {fixture.kickoff_time && (
              <div className="mt-1 text-xs text-slate-400">
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

