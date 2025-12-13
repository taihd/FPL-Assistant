import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useTeamContext } from '@/context/TeamContext';
import { getBootstrapData, getPlayerSummary } from '@/services/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ComparisonFooter } from '@/components/ComparisonFooter';
import { NewsIndicator } from '@/components/NewsIndicator';
import { PlayerHistoryChart } from './PlayerHistoryChart';
import { PlayerFixtures } from './PlayerFixtures';
import { PositionComparison } from './PositionComparison';
import { PlayerSearch } from './PlayerSearch';
import type { Player, Team, ElementType } from '@/types/fpl';
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
  const [positions, setPositions] = useState<ElementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);

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
      setPositions(bootstrap.element_types);

      // Find player in bootstrap data
      const foundPlayer = bootstrap.elements.find((p) => p.id === id);
      if (!foundPlayer) {
        throw new Error('Player not found');
      }

      setPlayer(foundPlayer);
      setPlayerSummary(summary);

      // Initialize selected players with current player
      setSelectedForCompare([id]);

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
          className="mb-4 text-sm text-slate-300 hover:text-white"
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
          className="mb-4 text-sm text-slate-300 hover:text-white"
        >
          ← Back to My Team
        </button>
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-400">Error Loading Player</h2>
          <p className="mb-4 text-sm text-red-300">
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
    <div className={selectedForCompare.length > 0 ? 'pb-20' : ''}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/my-team')}
        className="mb-4 text-sm text-slate-300 hover:text-white"
      >
        ← Back to My Team
      </button>

      {/* Player Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h1 className="text-3xl font-bold text-white">
              {player.web_name}
            </h1>
            <NewsIndicator news={player.news} />
          </div>
          <p className="text-slate-300">
            {player.first_name} {player.second_name}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {getPositionFullName(player.element_type)} • {getTeamName(player.team)}
          </p>
        </div>
        {teamPlayers?.some((p) => p.id === player.id) && (
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400 border border-green-500/30">
            In My Team
          </span>
        )}
      </div>

      {/* Player Stats - Compact Table */}
      <div className="mb-6 rounded-lg border border-dark-border bg-[#25252B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-border">
            <thead className="bg-[#2A2A35]">
              <tr>
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Category
                </th>
                <th className="px-3 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Stat
                </th>
                <th className="px-3 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border bg-[#25252B]">
              {/* General Stats */}
              <tr className="bg-[#2A2A35]/20">
                <td className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300" colSpan={3}>
                  General Stats
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Price</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {formatPrice(player.now_cost)}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Total Points</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {player.total_points}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Form</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {player.form || 'N/A'}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">ICT Index</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {parseFloat(player.ict_index).toFixed(1)}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Selected By</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {parseFloat(player.selected_by_percent).toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Total Minutes</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {player.minutes.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Avg Minutes (by Starts)</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {playerSummary && playerSummary.history.length > 0
                    ? (() => {
                        const starts = playerSummary.history.reduce(
                          (sum, h) => sum + (h.starts || (h.minutes >= 60 ? 1 : 0)),
                          0
                        );
                        return starts > 0 ? (player.minutes / starts).toFixed(1) : '0.0';
                      })()
                    : '0.0'}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Starts</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {playerSummary && playerSummary.history.length > 0
                    ? playerSummary.history.reduce(
                        (sum, h) => sum + (h.starts || (h.minutes >= 60 ? 1 : 0)),
                        0
                      )
                    : 0}
                </td>
              </tr>

              {/* Offensive Stats */}
              <tr className="bg-[#2A2A35]/20">
                <td className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300" colSpan={3}>
                  Offensive Stats
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Goals</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {player.goals_scored}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Assists</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {player.assists}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">xG</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {playerSummary && playerSummary.history.length > 0
                    ? playerSummary.history
                        .reduce((sum, h) => sum + parseFloat(h.expected_goals || '0'), 0)
                        .toFixed(2)
                    : '0.00'}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">xA</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {playerSummary && playerSummary.history.length > 0
                    ? playerSummary.history
                        .reduce((sum, h) => sum + parseFloat(h.expected_assists || '0'), 0)
                        .toFixed(2)
                    : '0.00'}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">xGI</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {playerSummary && playerSummary.history.length > 0
                    ? playerSummary.history
                        .reduce(
                          (sum, h) => sum + parseFloat(h.expected_goal_involvements || '0'),
                          0
                        )
                        .toFixed(2)
                    : '0.00'}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Threat</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {parseFloat(player.threat).toFixed(1)}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Creativity</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {parseFloat(player.creativity).toFixed(1)}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Influence</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {parseFloat(player.influence).toFixed(1)}
                </td>
              </tr>

              {/* Defensive Stats */}
              <tr className="bg-[#2A2A35]/20">
                <td className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300" colSpan={3}>
                  Defensive Stats
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Clean Sheets</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {player.clean_sheets}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Goals Conceded</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {player.goals_conceded}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">xDC</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {playerSummary && playerSummary.history.length > 0
                    ? playerSummary.history
                        .reduce(
                          (sum, h) => sum + parseFloat(h.expected_goals_conceded || '0'),
                          0
                        )
                        .toFixed(2)
                    : '0.00'}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">DefCon (Total)</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {playerSummary && playerSummary.history.length > 0
                    ? (() => {
                        const hasDefConField = playerSummary.history.some(
                          (h) => h.defensive_contribution !== undefined
                        );
                        if (hasDefConField) {
                          return playerSummary.history.reduce(
                            (sum, h) => sum + (h.defensive_contribution || 0),
                            0
                          );
                        }
                        return playerSummary.history.reduce((sum, h) => sum + h.clean_sheets, 0);
                      })()
                    : player.clean_sheets}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">DefCon (Average)</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {playerSummary && playerSummary.history.length > 0
                    ? (() => {
                        const gamesPlayed = playerSummary.history.filter((h) => h.minutes > 0)
                          .length;
                        const hasDefConField = playerSummary.history.some(
                          (h) => h.defensive_contribution !== undefined
                        );
                        let totalDefCon = 0;
                        if (hasDefConField) {
                          totalDefCon = playerSummary.history.reduce(
                            (sum, h) => sum + (h.defensive_contribution || 0),
                            0
                          );
                        } else {
                          totalDefCon = playerSummary.history.reduce(
                            (sum, h) => sum + h.clean_sheets,
                            0
                          );
                        }
                        return gamesPlayed > 0 ? (totalDefCon / gamesPlayed).toFixed(2) : '0.00';
                      })()
                    : '0.00'}
                </td>
              </tr>

              {/* Bonus Stats */}
              <tr className="bg-[#2A2A35]/20">
                <td className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300" colSpan={3}>
                  Bonus Stats
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">Bonus Points</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {player.bonus}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-1 text-xs text-slate-400"></td>
                <td className="px-3 py-1 text-xs text-slate-400">BPS</td>
                <td className="px-3 py-1 text-right text-xs font-semibold text-white">
                  {player.bps}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Points History Chart */}
      {playerSummary && playerSummary.history.length > 0 && (
        <div className="mb-6 rounded-lg border border-dark-border bg-[#25252B] p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Points History (Last 10 Gameweeks)
          </h2>
          <PlayerHistoryChart history={playerSummary.history} />
        </div>
      )}

      {/* Upcoming Fixtures */}
      {playerSummary && playerSummary.fixtures.length > 0 && (
        <div className="mb-6 rounded-lg border border-dark-border bg-[#25252B] p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Upcoming Fixtures</h2>
          <PlayerFixtures fixtures={playerSummary.fixtures} />
        </div>
      )}

      {/* Position Comparison & Search */}
      {player && allPlayers.length > 0 && (
        <div className="mb-6 rounded-lg border border-dark-border bg-[#25252B] p-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-white">
              Top Players in Same Position
            </h2>
            {selectedForCompare.length > 1 && (
              <button
                onClick={() => {
                  navigate(`/my-team/compare?players=${selectedForCompare.join(',')}`);
                }}
                className="rounded-md bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-600"
              >
                Compare {selectedForCompare.length} Players
              </button>
            )}
          </div>

          {/* Player Search */}
          <div className="mb-4">
            <PlayerSearch
              onAddToCompare={(playerId) => {
                if (!selectedForCompare.includes(playerId)) {
                  setSelectedForCompare([...selectedForCompare, playerId]);
                }
              }}
              selectedPlayerIds={selectedForCompare}
              excludePlayerId={player.id}
              samePositionOnly={true}
              positionType={player.element_type}
            />
          </div>


          <PositionComparison
            currentPlayer={player}
            teams={teams}
            allPlayers={allPlayers}
            positions={positions}
            limit={10}
            selectedForCompare={selectedForCompare}
            onAddToCompare={(playerId) => {
              if (!selectedForCompare.includes(playerId)) {
                setSelectedForCompare([...selectedForCompare, playerId]);
              }
            }}
          />
        </div>
      )}

      {/* Recent Performance */}
      {playerSummary && playerSummary.history.length > 0 && (
        <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Recent Performance (Last 10 Gameweeks)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-border">
              <thead className="bg-[#2A2A35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    GW
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Opponent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Points
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Goals
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Assists
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Def Con
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Bonus
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Minutes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border bg-[#25252B]">
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
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-white">
                          {h.round}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <span>{opponentName}</span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                                h.was_home
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                              }`}
                            >
                              {homeAway}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                          {h.total_points}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                          {h.goals_scored}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                          {h.assists}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                          {h.defensive_contribution !== undefined
                            ? h.defensive_contribution
                            : h.clean_sheets}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                          {h.bonus}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
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

      {/* Comparison Footer */}
      {selectedForCompare.length > 0 && (
        <ComparisonFooter
          selectedItems={selectedForCompare.map((playerId) => {
            const selectedPlayer = allPlayers.find((p) => p.id === playerId);
            const position = positions.find((p) => p.id === selectedPlayer?.element_type);
            return {
              id: playerId,
              name: selectedPlayer?.web_name || `Player ${playerId}`,
              label: position?.singular_name_short,
            };
          })}
          onRemove={(playerId) => {
            setSelectedForCompare(selectedForCompare.filter((id) => id !== playerId));
          }}
          onClearAll={() => setSelectedForCompare([player.id])}
          onCompare={() => {
            if (selectedForCompare.length > 1) {
              navigate(`/my-team/compare?players=${selectedForCompare.join(',')}`);
            }
          }}
          type="players"
          positions={positions}
        />
      )}
    </div>
  );
}

