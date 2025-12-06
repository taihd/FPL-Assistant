import type { ManagerInfo } from '@/types/fpl';
import { formatPrice } from '@/lib/utils';

interface TeamOverviewProps {
  managerInfo: ManagerInfo;
}

export function TeamOverview({ managerInfo }: TeamOverviewProps) {
  return (
    <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">
        {managerInfo.player_first_name} {managerInfo.player_last_name}
      </h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <div className="text-sm text-slate-500">Team Value</div>
          <div className="text-2xl font-bold text-slate-900">
            {formatPrice(managerInfo.last_deadline_value)}
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-500">Bank</div>
          <div className="text-2xl font-bold text-slate-900">
            {formatPrice(managerInfo.last_deadline_bank)}
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-500">Total Points</div>
          <div className="text-2xl font-bold text-slate-900">
            {managerInfo.summary_overall_points?.toLocaleString() ?? 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-500">Overall Rank</div>
          <div className="text-2xl font-bold text-slate-900">
            {managerInfo.summary_overall_rank
              ? `#${managerInfo.summary_overall_rank.toLocaleString()}`
              : 'N/A'}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-3">
        <div>
          <div className="text-sm text-slate-500">Gameweek Points</div>
          <div className="font-semibold text-slate-900">
            {managerInfo.summary_event_points?.toLocaleString() ?? 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-500">Gameweek Rank</div>
          <div className="font-semibold text-slate-900">
            {managerInfo.summary_event_rank
              ? `#${managerInfo.summary_event_rank.toLocaleString()}`
              : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-sm text-slate-500">Region</div>
          <div className="font-semibold text-slate-900">
            {managerInfo.player_region_name}
          </div>
        </div>
      </div>
    </div>
  );
}

