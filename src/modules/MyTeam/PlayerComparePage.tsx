import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { getBootstrapData, getPlayerSummary } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { Player, Team } from '@/types/fpl';
import type { PlayerSummary } from '@/types/player';
import { formatPrice, getPositionFullName } from '@/lib/utils';

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
          className="mb-4 text-sm text-slate-600 hover:text-slate-900"
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
          className="mb-4 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to My Team
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-900">Error Loading Comparison</h2>
          <p className="mb-4 text-sm text-red-800">
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
        className="mb-4 text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to My Team
      </button>

      <h1 className="mb-6 text-3xl font-bold text-slate-900">Player Comparison</h1>

      {/* Comparison Table */}
      <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Stat
                </th>
                {players.map((player) => (
                  <th
                    key={player.id}
                    className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{player.web_name}</div>
                      <div className="text-xs font-normal text-slate-500">
                        {getTeamShortName(player.team)}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Position
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {getPositionFullName(player.element_type)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Price
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {formatPrice(player.now_cost)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Total Points
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm font-semibold text-slate-900"
                  >
                    {player.total_points}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Points per Game
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {parseFloat(player.points_per_game || '0').toFixed(1)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Form
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {player.form || 'N/A'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Ownership
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {parseFloat(player.selected_by_percent).toFixed(1)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Goals
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {player.goals_scored}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Assists
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {player.assists}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Clean Sheets
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {player.clean_sheets}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  ICT Index
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {parseFloat(player.ict_index).toFixed(1)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Influence
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {parseFloat(player.influence).toFixed(1)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Creativity
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {parseFloat(player.creativity).toFixed(1)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                  Threat
                </td>
                {players.map((player) => (
                  <td
                    key={player.id}
                    className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-600"
                  >
                    {parseFloat(player.threat).toFixed(1)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Fixtures Comparison */}
      {players.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Upcoming Fixtures</h2>
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
                <div key={player.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">
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

                      return (
                        <div
                          key={fixture.id}
                          className={`rounded-md border px-2 py-1 text-xs ${getDifficultyColor(fixture.difficulty)}`}
                        >
                          GW {fixture.event} vs {opponentName} ({homeAway}) - {fixture.difficulty}
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

