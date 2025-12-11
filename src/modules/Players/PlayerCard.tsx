import type { Player, Team, ElementType } from '@/types/fpl';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
  team: Team;
  position: ElementType;
}

const formatPrice = (cost: number): string => {
  return `£${(cost / 10).toFixed(1)}m`;
};

const getPositionColor = (positionId: number): string => {
  switch (positionId) {
    case 1: // Goalkeeper
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 2: // Defender
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 3: // Midfielder
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 4: // Forward
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

export function PlayerCard({ player, team, position }: PlayerCardProps) {
  const ownership = parseFloat(player.selected_by_percent);
  const form = parseFloat(player.form || '0');
  const pointsPerGame = parseFloat(player.points_per_game || '0');

  return (
    <div className="rounded-lg border border-dark-border bg-[#25252B] p-6 transition-shadow hover:border-violet-500/50">
      {/* Header */}
      <div className="mb-4 border-b border-dark-border pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">
                {player.web_name}
              </h3>
              <span
                className={cn(
                  'rounded border px-2 py-1 text-xs font-medium',
                  getPositionColor(player.element_type)
                )}
              >
                {position.singular_name_short}
              </span>
            </div>
            <p className="text-sm text-slate-400">
              {player.first_name} {player.second_name}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-300">{team.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {formatPrice(player.now_cost)}
            </div>
            <div className="text-sm text-slate-400">Price</div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {player.total_points}
          </div>
          <div className="text-xs text-slate-400">Total Points</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{pointsPerGame}</div>
          <div className="text-xs text-slate-400">Points/Game</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{form}</div>
          <div className="text-xs text-slate-400">Form</div>
        </div>
      </div>

      {/* Ownership & Transfers */}
      <div className="mb-4 grid grid-cols-2 gap-4 border-t border-dark-border pt-4">
        <div>
          <div className="text-sm text-slate-400">Ownership</div>
          <div className="font-semibold text-white">{ownership}%</div>
        </div>
        <div>
          <div className="text-sm text-slate-400">Transfers In</div>
          <div className="font-semibold text-emerald-400">
            +{player.transfers_in.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Player Stats Grid */}
      <div className="grid grid-cols-2 gap-3 border-t border-dark-border pt-4 text-sm">
        <div>
          <span className="text-slate-400">Goals:</span>{' '}
          <span className="font-semibold text-white">{player.goals_scored}</span>
        </div>
        <div>
          <span className="text-slate-400">Assists:</span>{' '}
          <span className="font-semibold text-white">{player.assists}</span>
        </div>
        <div>
          <span className="text-slate-400">Clean Sheets:</span>{' '}
          <span className="font-semibold text-white">{player.clean_sheets}</span>
        </div>
        <div>
          <span className="text-slate-400">Bonus:</span>{' '}
          <span className="font-semibold text-white">{player.bonus}</span>
        </div>
        {player.element_type === 1 && (
          <div>
            <span className="text-slate-400">Saves:</span>{' '}
            <span className="font-semibold text-white">{player.saves}</span>
          </div>
        )}
        <div>
          <span className="text-slate-400">Minutes:</span>{' '}
          <span className="font-semibold text-white">
            {player.minutes.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ICT Index */}
      <div className="mt-4 border-t border-dark-border pt-4">
        <div className="mb-2 text-xs font-semibold text-slate-400">ICT Index</div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <div className="text-slate-400">Total</div>
            <div className="font-semibold text-white">{player.ict_index}</div>
          </div>
          <div>
            <div className="text-slate-400">Influence</div>
            <div className="font-semibold text-white">{player.influence}</div>
          </div>
          <div>
            <div className="text-slate-400">Creativity</div>
            <div className="font-semibold text-white">{player.creativity}</div>
          </div>
          <div>
            <div className="text-slate-400">Threat</div>
            <div className="font-semibold text-white">{player.threat}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

