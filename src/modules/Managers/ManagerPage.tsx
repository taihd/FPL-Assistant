import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import {
  getManagerInfo,
  getManagerHistory,
  getManagerTransfers,
  getBootstrapData,
} from '@/services/api';
import { ManagerHistoryChart } from './ManagerHistoryChart';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { ManagerInfo, ManagerHistory, ManagerTransfer, Player } from '@/types/fpl';

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

const CHIP_NAMES: Record<string, string> = {
  '3xc': 'Triple Captain',
  'wildcard': 'Wildcard',
  'freehit': 'Free Hit',
  'bboost': 'Bench Boost',
};

export function ManagerPage() {
  const { setScreen, setDataSnapshot } = useAppContext();
  const [managerId, setManagerId] = useState<string>('');
  const [managerInfo, setManagerInfo] = useState<ManagerInfo | null>(null);
  const [managerHistory, setManagerHistory] = useState<ManagerHistory | null>(null);
  const [transfers, setTransfers] = useState<ManagerTransfer[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setScreen('managers');
  }, [setScreen]);

  const loadManagerData = async () => {
    // Clear previous data
    setManagerInfo(null);
    setManagerHistory(null);
    setTransfers([]);
    setError(null);

    if (!managerId.trim()) {
      setError(new Error('Please enter a manager ID'));
      return;
    }

    const id = parseInt(managerId, 10);
    if (isNaN(id) || id <= 0) {
      setError(new Error('Manager ID must be a valid positive number'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Loading manager data for ID:', id);
      
      // Load bootstrap data for players
      console.log('Fetching bootstrap data...');
      const bootstrap = await getBootstrapData();
      setPlayers(bootstrap.elements);
      console.log('Bootstrap data loaded');

      // Load manager data
      console.log('Fetching manager data...');
      const [info, history, transfersData] = await Promise.all([
        getManagerInfo(id),
        getManagerHistory(id),
        getManagerTransfers(id),
      ]);

      console.log('Manager data loaded:', { info, history, transfers: transfersData });

      setManagerInfo(info);
      setManagerHistory(history);
      setTransfers(transfersData);

      // Update context for AI
      setDataSnapshot({
        managerId: id,
        managerInfo: info,
        managerHistory: history,
        transfers: transfersData,
      });
    } catch (err) {
      console.error('Failed to load manager data:', err);
      const errorMessage =
        err instanceof Error
          ? err
          : new Error('Failed to load manager data. Please check the manager ID and try again.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with manager ID:', managerId);
    loadManagerData();
  };

  const getPlayerName = (playerId: number): string => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.web_name : `Player ${playerId}`;
  };

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-white">Managers</h1>

      {/* Manager ID Input */}
      <div className="mb-6 rounded-lg border border-dark-border bg-[#25252B] p-4">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1">
            <label
              htmlFor="manager-id"
              className="mb-2 block text-sm font-medium text-white"
            >
              Manager ID
            </label>
            <input
              id="manager-id"
              type="text"
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              placeholder="Enter manager ID (e.g., 123456)"
              className="w-full rounded-md border border-dark-border bg-[#2A2A35] px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading || !managerId.trim()}
              className="rounded-md bg-violet-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load Manager'}
            </button>
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 p-6">
          <p className="mb-2 font-semibold text-red-400">Error</p>
          <p className="mb-4 text-sm text-red-300">{error.message}</p>
          <button
            onClick={() => setError(null)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Manager Info */}
      {managerInfo && !loading && (
        <div className="space-y-6">
          {/* Manager Overview */}
          <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              {managerInfo.player_first_name} {managerInfo.player_last_name}
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <div className="text-sm text-slate-400">Overall Points</div>
                <div className="text-2xl font-bold text-white">
                  {managerInfo.summary_overall_points.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Overall Rank</div>
                <div className="text-2xl font-bold text-white">
                  {managerInfo.summary_overall_rank
                    ? `#${managerInfo.summary_overall_rank.toLocaleString()}`
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Gameweek Points</div>
                <div className="text-2xl font-bold text-white">
                  {managerInfo.summary_event_points ?? 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Gameweek Rank</div>
                <div className="text-2xl font-bold text-white">
                  {managerInfo.summary_event_rank
                    ? `#${managerInfo.summary_event_rank.toLocaleString()}`
                    : 'N/A'}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-dark-border pt-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-slate-400">Team Value</div>
                <div className="font-semibold text-white">
                  {formatPrice(managerInfo.last_deadline_value)}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Bank</div>
                <div className="font-semibold text-white">
                  {formatPrice(managerInfo.last_deadline_bank)}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Region</div>
                <div className="font-semibold text-white">
                  {managerInfo.player_region_name}
                </div>
              </div>
            </div>
          </div>

          {/* History Chart */}
          {managerHistory && (
            <ManagerHistoryChart history={managerHistory} />
          )}

          {/* Chip Usage */}
          {managerHistory && managerHistory.chips.length > 0 && (
            <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Chip Usage</h3>
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

          {/* Transfers */}
          {transfers.length > 0 && (
            <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Transfer History ({transfers.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-border">
                      <th className="px-4 py-2 text-left font-semibold text-slate-400">
                        Gameweek
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-400">
                        Transferred Out
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-slate-400">
                        Transferred In
                      </th>
                      <th className="px-4 py-2 text-center font-semibold text-slate-400">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers
                      .sort((a, b) => b.event - a.event)
                      .map((transfer, index) => (
                        <tr key={index} className="border-b border-dark-border">
                          <td className="px-4 py-2 text-slate-300">{transfer.event}</td>
                          <td className="px-4 py-2">
                            <div className="font-medium text-white">
                              {getPlayerName(transfer.element_out)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {formatPrice(transfer.element_out_cost)}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="font-medium text-emerald-400">
                              {getPlayerName(transfer.element_in)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {formatPrice(transfer.element_in_cost)}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center text-slate-400">
                            {formatDate(transfer.time)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Leagues */}
          {managerInfo.leagues.classic.length > 0 && (
            <div className="rounded-lg border border-dark-border bg-[#25252B] p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Leagues</h3>
              <div className="space-y-2">
                {managerInfo.leagues.classic.slice(0, 5).map((league) => (
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
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!managerInfo && !loading && !error && (
        <div className="rounded-lg border border-dark-border bg-[#25252B] p-8 text-center">
          <p className="text-slate-300">
            Enter a manager ID to view their FPL statistics, history, and transfers.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            You can find your manager ID in your FPL profile URL or league standings.
          </p>
        </div>
      )}
    </div>
  );
}
