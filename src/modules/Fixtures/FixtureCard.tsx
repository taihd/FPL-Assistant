import type { Fixture, Team } from '@/types/fpl';
import { cn } from '@/lib/utils';

interface FixtureCardProps {
  fixture: Fixture;
  homeTeam: Team;
  awayTeam: Team;
}

const getDifficultyColor = (difficulty: number): string => {
  switch (difficulty) {
    case 1:
      return 'bg-green-100 text-green-800 border-green-300';
    case 2:
      return 'bg-lime-100 text-lime-800 border-lime-300';
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

export function FixtureCard({ fixture, homeTeam, awayTeam }: FixtureCardProps) {
  const isFinished = fixture.finished;
  const hasScore = fixture.team_h_score !== null && fixture.team_a_score !== null;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex flex-1 items-center gap-3">
          <div className="text-right">
            <div className="font-semibold text-slate-900">{homeTeam.name}</div>
            <div className="text-xs text-slate-500">{homeTeam.short_name}</div>
          </div>
          {hasScore && (
            <div className="text-2xl font-bold text-slate-900">
              {fixture.team_h_score}
            </div>
          )}
        </div>

        {/* VS / Score */}
        <div className="mx-4 flex flex-col items-center gap-1">
          {!isFinished && !hasScore && (
            <span className="text-sm font-medium text-slate-500">vs</span>
          )}
          {fixture.kickoff_time && (
            <span className="text-xs text-slate-400">
              {new Date(fixture.kickoff_time).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-1 items-center gap-3">
          {hasScore && (
            <div className="text-2xl font-bold text-slate-900">
              {fixture.team_a_score}
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-900">{awayTeam.name}</div>
            <div className="text-xs text-slate-500">{awayTeam.short_name}</div>
          </div>
        </div>
      </div>

      {/* Difficulty Ratings */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Home Difficulty:</span>
          <span
            className={cn(
              'rounded border px-2 py-1 text-xs font-medium',
              getDifficultyColor(fixture.team_h_difficulty)
            )}
          >
            {fixture.team_h_difficulty} - {getDifficultyLabel(fixture.team_h_difficulty)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Away Difficulty:</span>
          <span
            className={cn(
              'rounded border px-2 py-1 text-xs font-medium',
              getDifficultyColor(fixture.team_a_difficulty)
            )}
          >
            {fixture.team_a_difficulty} - {getDifficultyLabel(fixture.team_a_difficulty)}
          </span>
        </div>
      </div>
    </div>
  );
}

