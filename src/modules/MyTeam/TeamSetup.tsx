import { useState } from 'react';
import { useTeamContext } from '@/context/TeamContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function TeamSetup() {
  const { loadTeam, isLoading, error } = useTeamContext();
  const [managerId, setManagerId] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!managerId.trim()) {
      setLocalError('Please enter a Manager ID');
      return;
    }

    const id = parseInt(managerId, 10);
    if (isNaN(id) || id <= 0) {
      setLocalError('Manager ID must be a positive number');
      return;
    }

    try {
      await loadTeam(id);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to load team');
    }
  };

  const displayError = error || localError;

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold text-slate-900">Set Up Your Team</h2>
      <p className="mb-6 text-sm text-slate-600">
        Enter your FPL Manager ID to load your team. You can find your Manager ID in your FPL profile URL
        (e.g., https://fantasy.premierleague.com/entry/123456/event/1 - your ID is 123456).
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="manager-id"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Manager ID
          </label>
          <input
            id="manager-id"
            type="text"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            placeholder="Enter your Manager ID (e.g., 123456)"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
            disabled={isLoading}
          />
        </div>

        {displayError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {typeof displayError === 'string' ? displayError : displayError.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !managerId.trim()}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              Loading Team...
            </span>
          ) : (
            'Save Team'
          )}
        </button>
      </form>
    </div>
  );
}

