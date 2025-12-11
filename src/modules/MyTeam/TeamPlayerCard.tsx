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

  const getPositionColor = (positionName: string): string => {
    switch (positionName) {
      case 'FWD':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MID':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'DEF':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'GK':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <button
      onClick={onClick}
      className="group rounded-lg border border-dark-border bg-[#2A2A35] p-4 text-left transition-all hover:border-violet-500/50 hover:bg-[#2F2F3A]"
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white group-hover:text-violet-300">
              {player.web_name}
            </h3>
            {isCaptain && (
              <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400 border border-yellow-500/30">
                C
              </span>
            )}
            {isViceCaptain && (
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/30">
                VC
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded border px-2 py-0.5 text-xs font-medium ${getPositionColor(positionName)}`}>
              {positionName}
            </span>
            <p className="text-sm text-slate-400">
              {teamName}
            </p>
          </div>
        </div>
        {position && (
          <div
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              isStarter
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
            }`}
          >
            {isStarter ? 'Starting' : `Bench ${position - 11}`}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-dark-border pt-2 text-sm">
        <div>
          <div className="text-xs text-slate-400">Points</div>
          <div className="font-semibold text-white">{player.total_points}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Price</div>
          <div className="font-semibold text-white">
            {formatPrice(player.now_cost)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400">Form</div>
          <div className="font-semibold text-white">{player.form || 'N/A'}</div>
        </div>
      </div>
    </button>
  );
}

