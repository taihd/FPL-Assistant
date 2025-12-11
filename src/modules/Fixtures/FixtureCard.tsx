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
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 2:
      return 'bg-lime-500/20 text-lime-400 border-lime-500/30';
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

export function FixtureCard({ fixture, homeTeam, awayTeam }: FixtureCardProps) {
  const isFinished = fixture.finished;
  const hasScore = fixture.team_h_score !== null && fixture.team_a_score !== null;

  return (
    <div className="rounded-lg border border-dark-border bg-[#25252B] p-4 transition-shadow hover:border-violet-500/50">
      <div className="flex items-center justify-between">
        {/* Home Team */}
        <div className="flex flex-1 items-center gap-3">
          <div className="text-right">
            <div className="font-semibold text-white">{homeTeam.name}</div>
            <div className="text-xs text-slate-400">{homeTeam.short_name}</div>
          </div>
          {hasScore && (
            <div className="text-2xl font-bold text-white">
              {fixture.team_h_score}
            </div>
          )}
        </div>

        {/* VS / Score */}
        <div className="mx-4 flex flex-col items-center gap-1">
          {!isFinished && !hasScore && (
            <span className="text-sm font-medium text-slate-400">vs</span>
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
            <div className="text-2xl font-bold text-white">
              {fixture.team_a_score}
            </div>
          )}
          <div>
            <div className="font-semibold text-white">{awayTeam.name}</div>
            <div className="text-xs text-slate-400">{awayTeam.short_name}</div>
          </div>
        </div>
      </div>

      {/* Difficulty Ratings */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-dark-border pt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Home Difficulty:</span>
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
          <span className="text-xs text-slate-400">Away Difficulty:</span>
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

