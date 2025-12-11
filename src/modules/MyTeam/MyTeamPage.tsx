import { useEffect, useState } from 'react';
import { useTeamContext } from '@/context/TeamContext';
import { useAppContext } from '@/context/AppContext';
import { getManagerHistory, getManagerTransfers, getBootstrapData } from '@/services/api';
import { TeamSetup } from './TeamSetup';
import { TeamOverview } from './TeamOverview';
import { TeamPlayerList } from './TeamPlayerList';
import { ManagerHistoryChart } from '../Managers/ManagerHistoryChart';
import { CollapsibleSection } from './CollapsibleSection';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { ManagerHistory, ManagerTransfer, Player } from '@/types/fpl';

const CHIP_NAMES: Record<string, string> = {
  '3xc': 'Triple Captain',
  'wildcard': 'Wildcard',
  'freehit': 'Free Hit',
  'bboost': 'Bench Boost',
};

const formatPrice = (cost: number): string => {
  return `£${(cost / 10).toFixed(1)}m`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function MyTeamPage() {
  const {
    managerId,
    managerInfo,
    teamPlayers,
    teamPicks,
    isLoading,
    error,
    refreshTeam,
  } = useTeamContext();
  const { setScreen, setDataSnapshot } = useAppContext();

  const [managerHistory, setManagerHistory] = useState<ManagerHistory | null>(null);
  const [transfers, setTransfers] = useState<ManagerTransfer[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load manager history and transfers when manager ID is available
  useEffect(() => {
    if (managerId && !managerHistory && !loadingHistory) {
      setLoadingHistory(true);
      Promise.all([
        getManagerHistory(managerId),
        getManagerTransfers(managerId),
        getBootstrapData(),
      ])
        .then(([history, transfersData, bootstrap]) => {
          setManagerHistory(history);
          setTransfers(transfersData);
          setPlayers(bootstrap.elements);
        })
        .catch((err) => {
          console.error('Failed to load manager history:', err);
        })
        .finally(() => {
          setLoadingHistory(false);
        });
    }
  }, [managerId, managerHistory, loadingHistory]);

  useEffect(() => {
    setScreen('my-team');
    if (managerInfo && teamPlayers) {
      // Get captain and vice-captain
      const captainId = teamPicks?.picks.find((p) => p.is_captain)?.element;
      const viceCaptainId = teamPicks?.picks.find((p) => p.is_vice_captain)?.element;
      
      setDataSnapshot({
        managerId,
        managerInfo,
        teamPlayers,
        teamPicks: teamPicks || null,
        playerCount: teamPlayers.length,
        // Include player summaries for better AI context
        playerNames: teamPlayers.map(p => ({
          id: p.id,
          name: p.web_name,
          position: p.element_type,
          points: p.total_points,
          price: p.now_cost,
          form: p.form,
          goals: p.goals_scored,
          assists: p.assists,
          isCaptain: p.id === captainId,
          isViceCaptain: p.id === viceCaptainId,
        })),
        captain: captainId ? teamPlayers.find(p => p.id === captainId)?.web_name : null,
        viceCaptain: viceCaptainId ? teamPlayers.find(p => p.id === viceCaptainId)?.web_name : null,
      });
    }
  }, [setScreen, setDataSnapshot, managerId, managerInfo, teamPlayers, teamPicks]);

  // Show setup if no team is loaded
  if (!managerId) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-white">My Team</h1>
        <TeamSetup />
      </div>
    );
  }

  // Show loading state
  if (isLoading && !managerInfo) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-white">My Team</h1>
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state
  if (error && !managerInfo) {
    return (
      <div>
        <h1 className="mb-6 text-3xl font-bold text-white">My Team</h1>
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-400">Error Loading Team</h2>
          <p className="mb-4 text-sm text-red-300">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show team
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Team</h1>
        <button
          onClick={refreshTeam}
          disabled={isLoading}
          className="rounded-md bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Team'}
        </button>
      </div>

      {managerInfo && <TeamOverview managerInfo={managerInfo} />}
      {teamPlayers && <TeamPlayerList players={teamPlayers} />}

      {/* Manager History Chart */}
      {managerHistory && (
        <div className="mt-6">
          <ManagerHistoryChart history={managerHistory} />
        </div>
      )}

      {/* Chip Usage */}
      {managerHistory && managerHistory.chips.length > 0 && (
        <div className="mt-6 rounded-lg border border-dark-border bg-[#25252B] p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Chip Usage</h2>
          <div className="space-y-2">
            {managerHistory.chips.map((chip, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded border border-dark-border bg-[#2A2A35] p-3"
              >
                <div>
                  <div className="font-medium text-white">
                    {CHIP_NAMES[chip.name] || chip.name}
                  </div>
                  <div className="text-sm text-slate-400">
                    Gameweek {chip.event}
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {formatDate(chip.time)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer History - Collapsible */}
      {transfers.length > 0 && (
        <div className="mt-6">
          <CollapsibleSection title={`Transfer History (${transfers.length})`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-border">
                <thead className="bg-[#2A2A35]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                      Gameweek
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                      Transferred Out
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                      Transferred In
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-400">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border bg-[#25252B]">
                  {transfers
                    .sort((a, b) => b.event - a.event)
                    .map((transfer, index) => {
                      const getPlayerName = (playerId: number): string => {
                        const player = players.find((p) => p.id === playerId);
                        return player ? player.web_name : `Player ${playerId}`;
                      };

                      return (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-300">
                            {transfer.event}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="font-medium text-white">
                              {getPlayerName(transfer.element_out)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {formatPrice(transfer.element_out_cost)}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="font-medium text-emerald-400">
                              {getPlayerName(transfer.element_in)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {formatPrice(transfer.element_in_cost)}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-slate-400">
                            {formatDate(transfer.time)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Leagues Rank - Collapsible */}
      {managerInfo && managerInfo.leagues.classic.length > 0 && (
        <div className="mt-6">
          <CollapsibleSection title={`Leagues (${managerInfo.leagues.classic.length})`}>
            <div className="space-y-2">
              {managerInfo.leagues.classic.map((league) => (
                <div
                  key={league.id}
                  className="flex items-center justify-between rounded border border-dark-border bg-[#2A2A35] p-3"
                >
                  <div>
                    <div className="font-medium text-white">{league.name}</div>
                    <div className="text-sm text-slate-400">{league.league_type}</div>
                  </div>
                  {league.entry_rank && (
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        Rank: {league.entry_rank}
                      </div>
                      <div className="text-xs text-slate-400">
                        of {league.max_entries || 'N/A'}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}

