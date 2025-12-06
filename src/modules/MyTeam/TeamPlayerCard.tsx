import type { Player } from '@/types/fpl';
import { formatPrice, getPositionName } from '@/lib/utils';

interface TeamPlayerCardProps {
  player: Player;
  teamName: string;
  isStarter: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  position: number | undefined;
  onClick: () => void;
}

export function TeamPlayerCard({
  player,
  teamName,
  isStarter,
  isCaptain,
  isViceCaptain,
  position,
  onClick,
}: TeamPlayerCardProps) {
  const positionName = getPositionName(player.element_type);

  return (
    <button
      onClick={onClick}
      className="group rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-slate-400 hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
              {player.web_name}
            </h3>
            {isCaptain && (
              <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                C
              </span>
            )}
            {isViceCaptain && (
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                VC
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {positionName} • {teamName}
          </p>
        </div>
        {position && (
          <div
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              isStarter
                ? 'bg-green-100 text-green-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isStarter ? 'Starting' : `Bench ${position - 11}`}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t pt-2 text-sm">
        <div>
          <div className="text-xs text-slate-500">Points</div>
          <div className="font-semibold text-slate-900">{player.total_points}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Price</div>
          <div className="font-semibold text-slate-900">
            {formatPrice(player.now_cost)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Form</div>
          <div className="font-semibold text-slate-900">{player.form || 'N/A'}</div>
        </div>
      </div>
    </button>
  );
}

