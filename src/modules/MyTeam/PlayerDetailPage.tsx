import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useTeamContext } from '@/context/TeamContext';
import { getBootstrapData, getPlayerSummary } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PlayerHistoryChart } from './PlayerHistoryChart';
import { PlayerFixtures } from './PlayerFixtures';
import { PositionComparison } from './PositionComparison';
import type { Player, Team } from '@/types/fpl';
import type { PlayerSummary } from '@/types/player';
import { formatPrice, getPositionFullName } from '@/lib/utils';

export function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { setScreen, setDataSnapshot } = useAppContext();
  const { teamPlayers } = useTeamContext();

  const [player, setPlayer] = useState<Player | null>(null);
  const [playerSummary, setPlayerSummary] = useState<PlayerSummary | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setScreen('my-team-player');
    loadPlayerData();
  }, [playerId, setScreen]);

  const loadPlayerData = async () => {
    if (!playerId) {
      setError(new Error('Player ID is required'));
      setLoading(false);
      return;
    }

    const id = parseInt(playerId, 10);
    if (isNaN(id)) {
      setError(new Error('Invalid player ID'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load bootstrap data and player summary in parallel
      const [bootstrap, summary] = await Promise.all([
        getBootstrapData(),
        getPlayerSummary(id),
      ]);

      setTeams(bootstrap.teams);
      setAllPlayers(bootstrap.elements);

      // Find player in bootstrap data
      const foundPlayer = bootstrap.elements.find((p) => p.id === id);
      if (!foundPlayer) {
        throw new Error('Player not found');
      }

      setPlayer(foundPlayer);
      setPlayerSummary(summary);

      // Update context for AI
      setDataSnapshot({
        playerId: id,
        player: foundPlayer,
        playerSummary: summary,
        isInMyTeam: (teamPlayers?.some((p) => p.id === id) ?? false),
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err
          : new Error('Failed to load player data. Please try again.');
      setError(errorMessage);
      console.error('Error loading player:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId: number): string => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : `Team ${teamId}`;
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

  if (error || !player) {
    return (
      <div>
        <button
          onClick={() => navigate('/my-team')}
          className="mb-4 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Back to My Team
        </button>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-900">Error Loading Player</h2>
          <p className="mb-4 text-sm text-red-800">
            {error?.message || 'Player not found'}
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

      {/* Player Info Card */}
      <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-slate-900">
              {player.web_name}
            </h1>
            <p className="text-slate-600">
              {player.first_name} {player.second_name}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {getPositionFullName(player.element_type)} • {getTeamName(player.team)}
            </p>
          </div>
          {teamPlayers?.some((p) => p.id === player.id) && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              In My Team
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-sm text-slate-500">Total Points</div>
            <div className="text-2xl font-bold text-slate-900">{player.total_points}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Price</div>
            <div className="text-2xl font-bold text-slate-900">
              {formatPrice(player.now_cost)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Form</div>
            <div className="text-2xl font-bold text-slate-900">{player.form || 'N/A'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Ownership</div>
            <div className="text-2xl font-bold text-slate-900">
              {parseFloat(player.selected_by_percent).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-4">
          <div>
            <div className="text-sm text-slate-500">Goals</div>
            <div className="font-semibold text-slate-900">{player.goals_scored}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Assists</div>
            <div className="font-semibold text-slate-900">{player.assists}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Clean Sheets</div>
            <div className="font-semibold text-slate-900">{player.clean_sheets}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">ICT Index</div>
            <div className="font-semibold text-slate-900">
              {parseFloat(player.ict_index).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Points History Chart */}
      {playerSummary && playerSummary.history.length > 0 && (
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Points History (Last 10 Gameweeks)
          </h2>
          <PlayerHistoryChart history={playerSummary.history} />
        </div>
      )}

      {/* Upcoming Fixtures */}
      {playerSummary && playerSummary.fixtures.length > 0 && (
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Upcoming Fixtures</h2>
          <PlayerFixtures fixtures={playerSummary.fixtures} />
        </div>
      )}

      {/* Position Comparison */}
      {player && allPlayers.length > 0 && (
        <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Top Players in Same Position
          </h2>
          <PositionComparison
            currentPlayer={player}
            teams={teams}
            allPlayers={allPlayers}
            limit={10}
          />
        </div>
      )}

      {/* Recent Performance */}
      {playerSummary && playerSummary.history.length > 0 && (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Recent Performance (Last 10 Gameweeks)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    GW
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Opponent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Points
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Goals
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Assists
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Def Con
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Bonus
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    Minutes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {playerSummary.history
                  .filter((h) => h.round)
                  .sort((a, b) => b.round - a.round)
                  .slice(0, 10)
                  .map((h) => {
                    const opponentTeam = teams.find((t) => t.id === h.opponent_team);
                    const opponentName = opponentTeam ? opponentTeam.short_name : `Team ${h.opponent_team}`;
                    const homeAway = h.was_home ? 'H' : 'A';
                    
                    return (
                      <tr key={`${h.fixture}-${h.round}`}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                          {h.round}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{opponentName}</span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                                h.was_home
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {homeAway}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                          {h.total_points}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                          {h.goals_scored}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                          {h.assists}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                          {h.goals_conceded}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                          {h.bonus}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-900">
                          {h.minutes}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

