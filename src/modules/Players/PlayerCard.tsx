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
      return 'bg-blue-100 text-blue-800';
    case 2: // Defender
      return 'bg-green-100 text-green-800';
    case 3: // Midfielder
      return 'bg-yellow-100 text-yellow-800';
    case 4: // Forward
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

export function PlayerCard({ player, team, position }: PlayerCardProps) {
  const ownership = parseFloat(player.selected_by_percent);
  const form = parseFloat(player.form || '0');
  const pointsPerGame = parseFloat(player.points_per_game || '0');

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-4 border-b pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900">
                {player.web_name}
              </h3>
              <span
                className={cn(
                  'rounded px-2 py-1 text-xs font-medium',
                  getPositionColor(player.element_type)
                )}
              >
                {position.singular_name_short}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              {player.first_name} {player.second_name}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700">{team.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">
              {formatPrice(player.now_cost)}
            </div>
            <div className="text-sm text-slate-500">Price</div>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">
            {player.total_points}
          </div>
          <div className="text-xs text-slate-500">Total Points</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{pointsPerGame}</div>
          <div className="text-xs text-slate-500">Points/Game</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{form}</div>
          <div className="text-xs text-slate-500">Form</div>
        </div>
      </div>

      {/* Ownership & Transfers */}
      <div className="mb-4 grid grid-cols-2 gap-4 border-t pt-4">
        <div>
          <div className="text-sm text-slate-500">Ownership</div>
          <div className="font-semibold text-slate-900">{ownership}%</div>
        </div>
        <div>
          <div className="text-sm text-slate-500">Transfers In</div>
          <div className="font-semibold text-green-600">
            +{player.transfers_in.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Player Stats Grid */}
      <div className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
        <div>
          <span className="text-slate-500">Goals:</span>{' '}
          <span className="font-semibold text-slate-900">{player.goals_scored}</span>
        </div>
        <div>
          <span className="text-slate-500">Assists:</span>{' '}
          <span className="font-semibold text-slate-900">{player.assists}</span>
        </div>
        <div>
          <span className="text-slate-500">Clean Sheets:</span>{' '}
          <span className="font-semibold text-slate-900">{player.clean_sheets}</span>
        </div>
        <div>
          <span className="text-slate-500">Bonus:</span>{' '}
          <span className="font-semibold text-slate-900">{player.bonus}</span>
        </div>
        {player.element_type === 1 && (
          <div>
            <span className="text-slate-500">Saves:</span>{' '}
            <span className="font-semibold text-slate-900">{player.saves}</span>
          </div>
        )}
        <div>
          <span className="text-slate-500">Minutes:</span>{' '}
          <span className="font-semibold text-slate-900">
            {player.minutes.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ICT Index */}
      <div className="mt-4 border-t pt-4">
        <div className="mb-2 text-xs font-semibold text-slate-500">ICT Index</div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <div className="text-slate-500">Total</div>
            <div className="font-semibold text-slate-900">{player.ict_index}</div>
          </div>
          <div>
            <div className="text-slate-500">Influence</div>
            <div className="font-semibold text-slate-900">{player.influence}</div>
          </div>
          <div>
            <div className="text-slate-500">Creativity</div>
            <div className="font-semibold text-slate-900">{player.creativity}</div>
          </div>
          <div>
            <div className="text-slate-500">Threat</div>
            <div className="font-semibold text-slate-900">{player.threat}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

