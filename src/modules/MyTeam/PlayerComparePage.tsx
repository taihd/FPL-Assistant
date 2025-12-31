import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { getBootstrapData, getPlayerSummary } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { NewsIndicator } from '@/components/NewsIndicator';
import type { Player, Team } from '@/types/fpl';
import type { PlayerSummary } from '@/types/player';
import {
  formatPrice,
  getPositionFullName,
  isHigherBetter,
  findBestAndWorst,
} from '@/lib/utils';

export function PlayerComparePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setScreen, setDataSnapshot } = useAppContext();

  const [players, setPlayers] = useState<Player[]>([]);
  const [playerSummaries, setPlayerSummaries] = useState<Map<number, PlayerSummary>>(new Map());
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setScreen('my-team-compare');
    loadComparisonData();
  }, [searchParams, setScreen]);

  const loadComparisonData = async () => {
    const playerIdsParam = searchParams.get('players');
    if (!playerIdsParam) {
      setError(new Error('No players specified for comparison'));
      setLoading(false);
      return;
    }

    const playerIds = playerIdsParam
      .split(',')
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0);

    if (playerIds.length === 0) {
      setError(new Error('Invalid player IDs'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bootstrap = await getBootstrapData();
      setTeams(bootstrap.teams);

      // Find players in bootstrap data
      const foundPlayers = playerIds
        .map((id) => bootstrap.elements.find((p) => p.id === id))
        .filter((p): p is Player => p !== undefined);

      if (foundPlayers.length === 0) {
        throw new Error('No valid players found');
      }

      setPlayers(foundPlayers);

      // Load player summaries in parallel
      const summaries = await Promise.allSettled(
        foundPlayers.map((p) => getPlayerSummary(p.id))
      );

      const summariesMap = new Map<number, PlayerSummary>();
      summaries.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          summariesMap.set(foundPlayers[index].id, result.value);
        }
      });

      setPlayerSummaries(summariesMap);

      // Update context for AI
      setDataSnapshot({
        comparingPlayers: foundPlayers,
        playerSummaries: Array.from(summariesMap.values()),
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err
          : new Error('Failed to load comparison data. Please try again.');
      setError(errorMessage);
      console.error('Error loading comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTeamShortName = (teamId: number): string => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.short_name : `Team ${teamId}`;
  };

  if (loading) {
    return (
      <div>
        <button
          onClick={() => navigate('/my-team')}
          className="mb-4 text-sm text-slate-300 hover:text-white"
        >
          ← Back to My Team
        </button>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || players.length === 0) {
    return (
      <div>
        <button
          onClick={() => navigate('/my-team')}
          className="mb-4 text-sm text-slate-300 hover:text-white"
        >
          ← Back to My Team
        </button>
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-400">Error Loading Comparison</h2>
          <p className="mb-4 text-sm text-red-300">
            {error?.message || 'No players found for comparison'}
          </p>
          <button
            onClick={() => navigate('/my-team')}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Back to My Team
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate('/my-team')}
        className="mb-4 text-sm text-slate-300 hover:text-white"
      >
        ← Back to My Team
      </button>

      <h1 className="mb-6 text-3xl font-bold text-white">Player Comparison</h1>

      {/* Comparison Table */}
      <ComparisonTable
        players={players}
        playerSummaries={playerSummaries}
        getTeamShortName={getTeamShortName}
      />

      {/* Upcoming Fixtures Comparison */}
      {players.length > 0 && (
        <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Upcoming Fixtures</h2>
          <div className="space-y-4">
            {players.map((player) => {
              const summary = playerSummaries.get(player.id);
              if (!summary || summary.fixtures.length === 0) return null;

              const upcomingFixtures = summary.fixtures
                .filter((f) => !f.finished && f.event)
                .sort((a, b) => (a.event || 0) - (b.event || 0))
                .slice(0, 5);

              if (upcomingFixtures.length === 0) return null;

              return (
                <div
                  key={player.id}
                  className="border-t border-dark-border pt-4 first:border-t-0 first:pt-0"
                >
                  <h3 className="mb-2 text-sm font-semibold text-white">
                    {player.web_name} ({getTeamShortName(player.team)})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {upcomingFixtures.map((fixture) => {
                      const opponentTeam = teams.find(
                        (t) => t.id === (fixture.is_home ? fixture.team_a : fixture.team_h)
                      );
                      const opponentName = opponentTeam
                        ? opponentTeam.short_name
                        : `Team ${fixture.is_home ? fixture.team_a : fixture.team_h}`;
                      const homeAway = fixture.is_home ? 'H' : 'A';

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

                      return (
                        <div
                          key={fixture.id}
                          className={`rounded-md border px-2 py-1 text-xs ${getDifficultyColor(fixture.difficulty)}`}
                        >
                          GW {fixture.event} vs {opponentName} ({homeAway}) -{' '}
                          {fixture.difficulty}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface ComparisonTableProps {
  players: Player[];
  playerSummaries: Map<number, PlayerSummary>;
  getTeamShortName: (teamId: number) => string;
}

function ComparisonTable({
  players,
  playerSummaries,
  getTeamShortName,
}: ComparisonTableProps) {
  // Calculate best/worst for each stat
  const statComparisons = useMemo(() => {
    const getStatValue = (stat: string, index: number): number => {
      const player = players[index];
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
        case 'cleanSheets':
          return player.clean_sheets;
        case 'ict':
          return parseFloat(player.ict_index || '0');
        case 'influence':
          return parseFloat(player.influence || '0');
        case 'creativity':
          return parseFloat(player.creativity || '0');
        case 'threat':
          return parseFloat(player.threat || '0');
        case 'minutes':
          return player.minutes;
        case 'goalsConceded':
          return player.goals_conceded;
        case 'bonus':
          return player.bonus;
        case 'bps':
          return player.bps;
        case 'defensiveContribution': {
          // Use defensive_contribution from history if available, otherwise calculate from clean_sheets
          const summary = playerSummaries.get(player.id);
          if (summary && summary.history.length > 0) {
            // Check if defensive_contribution field exists in history
            const hasDefConField = summary.history.some(
              (h) => h.defensive_contribution !== undefined
            );
            if (hasDefConField) {
              return summary.history.reduce(
                (sum, h) => sum + (h.defensive_contribution || 0),
                0
              );
            }
            // Fallback to clean_sheets if defensive_contribution doesn't exist
            return summary.history.reduce((sum, h) => sum + h.clean_sheets, 0);
          }
          return player.clean_sheets;
        }
        case 'avgMinutes': {
          const summary = playerSummaries.get(player.id);
          const starts =
            summary && summary.history.length > 0
              ? summary.history.filter((h) => h.starts !== undefined && h.starts > 0).length
              : summary && summary.history.length > 0
                ? summary.history.filter((h) => h.minutes > 0).length
                : 0;
          return starts > 0 ? player.minutes / starts : 0;
        }
        case 'starts': {
          const summary = playerSummaries.get(player.id);
          return summary && summary.history.length > 0
            ? summary.history.reduce(
                (sum, h) => sum + (h.starts || (h.minutes >= 60 ? 1 : 0)),
                0
              )
            : 0;
        }
        case 'xg': {
          const summary = playerSummaries.get(player.id);
          return summary && summary.history.length > 0
            ? summary.history.reduce(
                (sum, h) => sum + parseFloat(h.expected_goals || '0'),
                0
              )
            : 0;
        }
        case 'xa': {
          const summary = playerSummaries.get(player.id);
          return summary && summary.history.length > 0
            ? summary.history.reduce(
                (sum, h) => sum + parseFloat(h.expected_assists || '0'),
                0
              )
            : 0;
        }
        case 'xgi': {
          const summary = playerSummaries.get(player.id);
          return summary && summary.history.length > 0
            ? summary.history.reduce(
                (sum, h) => sum + parseFloat(h.expected_goal_involvements || '0'),
                0
              )
            : 0;
        }
        case 'xdc': {
          const summary = playerSummaries.get(player.id);
          return summary && summary.history.length > 0
            ? summary.history.reduce(
                (sum, h) => sum + parseFloat(h.expected_goals_conceded || '0'),
                0
              )
            : 0;
        }
        case 'defconAverage': {
          const summary = playerSummaries.get(player.id);
          if (!summary || summary.history.length === 0) return -Infinity; // Use -Infinity so N/A won't be highlighted (higher is better)
          
          const gamesPlayed = summary.history.filter((h) => h.minutes > 0).length;
          if (gamesPlayed === 0) return -Infinity;

          const hasDefConField = summary.history.some(
            (h) => h.defensive_contribution !== undefined
          );
          
          if (!hasDefConField) return -Infinity; // Use -Infinity so N/A won't be highlighted (higher is better)

          const totalDefCon = summary.history.reduce(
            (sum, h) => sum + (h.defensive_contribution || 0),
            0
          );

          return totalDefCon / gamesPlayed;
        }
        default:
          return 0;
      }
    };

    const stats = [
      'price',
      'points',
      'form',
      'ict',
      'ownership',
      'minutes',
      'avgMinutes',
      'starts',
      'goals',
      'assists',
      'xg',
      'xa',
      'xgi',
      'threat',
      'creativity',
      'influence',
      'cleanSheets',
      'goalsConceded',
      'xdc',
      'defensiveContribution',
      'defconAverage',
      'bonus',
      'bps',
    ];

    const comparisons: Record<
      string,
      { bestIndices: number[]; worstIndices: number[] }
    > = {};

    stats.forEach((stat) => {
      const indices = players.map((_, index) => index);
      comparisons[stat] = findBestAndWorst(
        indices,
        (index: number) => getStatValue(stat, index),
        isHigherBetter(stat)
      );
    });

    return comparisons;
  }, [players, playerSummaries]);

  const getCellClassName = (
    statName: string,
    index: number,
    baseClasses: string
  ): string => {
    const comparison = statComparisons[statName];
    if (!comparison) return baseClasses;

    if (comparison.bestIndices.includes(index)) {
      return `${baseClasses} font-bold text-green-400`;
    }
    if (comparison.worstIndices.includes(index)) {
      return `${baseClasses} opacity-50`;
    }
    return baseClasses;
  };

  return (
    <div className="mb-6 rounded-lg border border-dark-border bg-[#25252B] p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-border">
          <thead className="bg-[#2A2A35]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                Stat
              </th>
              {players.map((player) => (
                <th
                  key={player.id}
                  className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400"
                >
                  <div>
                    <div className="flex items-center justify-center gap-2 font-semibold text-white">
                      {player.web_name}
                      <NewsIndicator news={player.news} />
                    </div>
                    <div className="text-xs font-normal text-slate-400">
                      {getTeamShortName(player.team)}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border bg-[#25252B]">
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Position
              </td>
              {players.map((player) => (
                <td
                  key={player.id}
                  className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300"
                >
                  {getPositionFullName(player.element_type)}
                </td>
              ))}
            </tr>

            {/* General Stats Section */}
            <tr className="bg-[#1F1F26]">
              <td
                colSpan={players.length + 1}
                className="px-4 py-2 text-sm font-bold text-white"
              >
                General Stats
              </td>
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Price
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'price',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {formatPrice(player.now_cost)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Total Points
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'points',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm font-semibold text-white'
                  )}
                >
                  {player.total_points}
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Form
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'form',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {player.form || 'N/A'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Selected By
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'ownership',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {parseFloat(player.selected_by_percent).toFixed(1)}%
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Total Minutes
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'minutes',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {player.minutes.toLocaleString()}
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Avg Minutes (by Starts)
              </td>
              {players.map((player, index) => {
                const summary = playerSummaries.get(player.id);
                const starts =
                  summary && summary.history.length > 0
                    ? summary.history.filter((h) => h.starts !== undefined && h.starts > 0).length
                    : summary && summary.history.length > 0
                      ? summary.history.filter((h) => h.minutes > 0).length
                      : 0;
                const avgMinutes = starts > 0 ? (player.minutes / starts).toFixed(1) : '0.0';
                return (
                  <td
                    key={player.id}
                    className={getCellClassName(
                      'avgMinutes',
                      index,
                      'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                    )}
                  >
                    {avgMinutes}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Starts
              </td>
              {players.map((player, index) => {
                const summary = playerSummaries.get(player.id);
                const starts =
                  summary && summary.history.length > 0
                    ? summary.history.reduce(
                        (sum, h) => sum + (h.starts || (h.minutes >= 60 ? 1 : 0)),
                        0
                      )
                    : 0;
                return (
                  <td
                    key={player.id}
                    className={getCellClassName(
                      'starts',
                      index,
                      'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                    )}
                  >
                    {starts}
                  </td>
                );
              })}
            </tr>

            {/* Offensive Stats Section */}
            <tr className="bg-[#1F1F26]">
              <td
                colSpan={players.length + 1}
                className="px-4 py-2 text-sm font-bold text-white"
              >
                Offensive Stats
              </td>
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Goals
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'goals',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {player.goals_scored}
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Assists
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'assists',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {player.assists}
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                xG (Expected Goals)
              </td>
              {players.map((player, index) => {
                const summary = playerSummaries.get(player.id);
                const xg =
                  summary && summary.history.length > 0
                    ? summary.history.reduce(
                        (sum, h) => sum + parseFloat(h.expected_goals || '0'),
                        0
                      )
                    : 0;
                return (
                  <td
                    key={player.id}
                    className={getCellClassName(
                      'xg',
                      index,
                      'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                    )}
                  >
                    {xg.toFixed(2)}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                xA (Expected Assists)
              </td>
              {players.map((player, index) => {
                const summary = playerSummaries.get(player.id);
                const xa =
                  summary && summary.history.length > 0
                    ? summary.history.reduce(
                        (sum, h) => sum + parseFloat(h.expected_assists || '0'),
                        0
                      )
                    : 0;
                return (
                  <td
                    key={player.id}
                    className={getCellClassName(
                      'xa',
                      index,
                      'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                    )}
                  >
                    {xa.toFixed(2)}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                xGI (Expected Goal Involvements)
              </td>
              {players.map((player, index) => {
                const summary = playerSummaries.get(player.id);
                const xgi =
                  summary && summary.history.length > 0
                    ? summary.history.reduce(
                        (sum, h) => sum + parseFloat(h.expected_goal_involvements || '0'),
                        0
                      )
                    : 0;
                return (
                  <td
                    key={player.id}
                    className={getCellClassName(
                      'xgi',
                      index,
                      'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                    )}
                  >
                    {xgi.toFixed(2)}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Threat
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'threat',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {parseFloat(player.threat).toFixed(1)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Creativity
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'creativity',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {parseFloat(player.creativity).toFixed(1)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Influence
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'influence',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {parseFloat(player.influence).toFixed(1)}
                </td>
              ))}
            </tr>

            {/* Defensive Stats Section */}
            <tr className="bg-[#1F1F26]">
              <td
                colSpan={players.length + 1}
                className="px-4 py-2 text-sm font-bold text-white"
              >
                Defensive Stats
              </td>
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Clean Sheets
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'cleanSheets',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {player.clean_sheets}
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Goals Conceded
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'goalsConceded',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {player.goals_conceded}
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                xDC (Expected Goals Conceded)
              </td>
              {players.map((player, index) => {
                const summary = playerSummaries.get(player.id);
                const xdc =
                  summary && summary.history.length > 0
                    ? summary.history.reduce(
                        (sum, h) => sum + parseFloat(h.expected_goals_conceded || '0'),
                        0
                      )
                    : 0;
                return (
                  <td
                    key={player.id}
                    className={getCellClassName(
                      'xdc',
                      index,
                      'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                    )}
                  >
                    {xdc.toFixed(2)}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                DefCon (Total)
              </td>
              {players.map((player, index) => {
                const summary = playerSummaries.get(player.id);
                let defensiveContribution = player.clean_sheets;
                if (summary && summary.history.length > 0) {
                  // Check if defensive_contribution field exists
                  const hasDefConField = summary.history.some(
                    (h) => h.defensive_contribution !== undefined
                  );
                  if (hasDefConField) {
                    defensiveContribution = summary.history.reduce(
                      (sum, h) => sum + (h.defensive_contribution || 0),
                      0
                    );
                  } else {
                    defensiveContribution = summary.history.reduce(
                      (sum, h) => sum + h.clean_sheets,
                      0
                    );
                  }
                }
                return (
                  <td
                    key={player.id}
                    className={getCellClassName(
                      'defensiveContribution',
                      index,
                      'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                    )}
                  >
                    {defensiveContribution}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                DefCon (Average)
              </td>
              {players.map((player, index) => {
                const summary = playerSummaries.get(player.id);
                const gamesPlayed =
                  summary && summary.history.length > 0
                    ? summary.history.filter((h) => h.minutes > 0).length
                    : 0;
                let defensiveContribution = 0;
                let hasDefConField = false;
                if (summary && summary.history.length > 0) {
                  // Check if defensive_contribution field exists
                  hasDefConField = summary.history.some(
                    (h) => h.defensive_contribution !== undefined
                  );
                  if (hasDefConField) {
                    defensiveContribution = summary.history.reduce(
                      (sum, h) => sum + (h.defensive_contribution || 0),
                      0
                    );
                  }
                }
                const avgDefensiveContribution =
                  !hasDefConField
                    ? 'N/A'
                    : gamesPlayed > 0
                      ? (defensiveContribution / gamesPlayed).toFixed(2)
                      : '0.00';
                return (
                  <td
                    key={player.id}
                    className={getCellClassName(
                      'defconAverage',
                      index,
                      'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                    )}
                  >
                    {avgDefensiveContribution}
                  </td>
                );
              })}
            </tr>

            {/* Bonus Stats Section */}
            <tr className="bg-[#1F1F26]">
              <td
                colSpan={players.length + 1}
                className="px-4 py-2 text-sm font-bold text-white"
              >
                Bonus Stats
              </td>
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                Bonus Points
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'bonus',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {player.bonus}
                </td>
              ))}
            </tr>
            <tr>
              <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                BPS (Bonus Points System)
              </td>
              {players.map((player, index) => (
                <td
                  key={player.id}
                  className={getCellClassName(
                    'bps',
                    index,
                    'whitespace-nowrap px-4 py-3 text-center text-sm text-slate-300'
                  )}
                >
                  {player.bps}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

