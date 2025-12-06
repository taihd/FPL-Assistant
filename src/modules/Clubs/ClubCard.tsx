import type { Team, Fixture } from '@/types/fpl';
import { cn } from '@/lib/utils';

interface ClubCardProps {
  team: Team;
  fixtures: Fixture[];
  allTeams: Team[];
}

const getDifficultyColor = (difficulty: number): string => {
  switch (difficulty) {
    case 1:
      return 'bg-green-100 text-green-800';
    case 2:
      return 'bg-lime-100 text-lime-800';
    case 3:
      return 'bg-yellow-100 text-yellow-800';
    case 4:
      return 'bg-orange-100 text-orange-800';
    case 5:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

export function ClubCard({ team, fixtures, allTeams }: ClubCardProps) {
  // Get fixtures for this team (both home and away)
  const teamFixtures = fixtures.filter(
    (f) => f.team_h === team.id || f.team_a === team.id
  );

  // Separate past and upcoming fixtures
  const now = new Date();
  const pastFixtures = teamFixtures
    .filter((f) => f.finished || (f.kickoff_time && new Date(f.kickoff_time) < now))
    .slice(-5); // Last 5 fixtures

  const upcomingFixtures = teamFixtures
    .filter(
      (f) =>
        !f.finished &&
        f.kickoff_time &&
        new Date(f.kickoff_time) >= now
    )
    .slice(0, 5); // Next 5 fixtures

  const getOpponent = (fixture: Fixture): Team | undefined => {
    const opponentId = fixture.team_h === team.id ? fixture.team_a : fixture.team_h;
    return allTeams.find((t) => t.id === opponentId);
  };

  const isHome = (fixture: Fixture): boolean => fixture.team_h === team.id;

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Club Header */}
      <div className="mb-4 border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{team.name}</h3>
            <p className="text-sm text-slate-500">{team.short_name}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Overall Strength</div>
            <div className="text-lg font-semibold text-slate-900">{team.strength}</div>
          </div>
        </div>

        {/* Strength Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-500">Attack (Home)</div>
            <div className="font-semibold text-slate-900">
              {team.strength_attack_home}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Attack (Away)</div>
            <div className="font-semibold text-slate-900">
              {team.strength_attack_away}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Defence (Home)</div>
            <div className="font-semibold text-slate-900">
              {team.strength_defence_home}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Defence (Away)</div>
            <div className="font-semibold text-slate-900">
              {team.strength_defence_away}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Fixtures */}
      {upcomingFixtures.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-slate-700">
            Next {upcomingFixtures.length} Fixtures
          </h4>
          <div className="space-y-2">
            {upcomingFixtures.map((fixture) => {
              const opponent = getOpponent(fixture);
              if (!opponent) return null;

              const difficulty = isHome(fixture)
                ? fixture.team_h_difficulty
                : fixture.team_a_difficulty;

              return (
                <div
                  key={fixture.id}
                  className="flex items-center justify-between rounded border p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded px-2 py-1 text-xs font-medium', getDifficultyColor(difficulty))}>
                      {difficulty}
                    </span>
                    <span className="text-slate-600">
                      {isHome(fixture) ? 'vs' : '@'} {opponent.short_name}
                    </span>
                  </div>
                  {fixture.kickoff_time && (
                    <span className="text-xs text-slate-400">
                      {new Date(fixture.kickoff_time).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Fixtures */}
      {pastFixtures.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-slate-700">
            Recent Results
          </h4>
          <div className="space-y-2">
            {pastFixtures.map((fixture) => {
              const opponent = getOpponent(fixture);
              if (!opponent) return null;

              const isHomeGame = isHome(fixture);
              const teamScore = isHomeGame ? fixture.team_h_score : fixture.team_a_score;
              const opponentScore = isHomeGame
                ? fixture.team_a_score
                : fixture.team_h_score;

              return (
                <div
                  key={fixture.id}
                  className="flex items-center justify-between rounded border p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">
                      {isHomeGame ? 'vs' : '@'} {opponent.short_name}
                    </span>
                  </div>
                  {teamScore !== null && opponentScore !== null && (
                    <span
                      className={cn(
                        'font-semibold',
                        teamScore > opponentScore
                          ? 'text-green-600'
                          : teamScore < opponentScore
                          ? 'text-red-600'
                          : 'text-slate-600'
                      )}
                    >
                      {teamScore} - {opponentScore}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Details Link - Future enhancement */}
      {/* <div className="mt-4 border-t pt-4">
        <Link
          to={`/clubs/${team.id}`}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          View full fixture list →
        </Link>
      </div> */}
    </div>
  );
}

