import type { Team, ElementType } from '@/types/fpl';
import { cn } from '@/lib/utils';

interface ComparisonFooterProps {
  selectedItems: Array<{
    id: number;
    name: string;
    label?: string; // For position tags or team abbreviations
    color?: string; // For custom color classes
  }>;
  onRemove: (id: number) => void;
  onClearAll: () => void;
  onCompare: () => void;
  type?: 'players' | 'teams';
  positions?: ElementType[];
  teams?: Team[];
}

const getPositionColor = (positionId: number): string => {
  switch (positionId) {
    case 1: // Goalkeeper
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    case 2: // Defender
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 3: // Midfielder
      return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
    case 4: // Forward
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

export function ComparisonFooter({
  selectedItems,
  onRemove,
  onClearAll,
  onCompare,
  type = 'players',
  positions = [],
}: ComparisonFooterProps) {
  if (selectedItems.length === 0) return null;

  const maxVisible = 15;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-dark-border bg-[#2A2A35] px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 overflow-x-auto">
          <span className="text-sm font-medium text-white whitespace-nowrap">
            Compare ({selectedItems.length}):
          </span>
          <div className="flex items-center gap-2 overflow-x-auto">
            {selectedItems.slice(0, maxVisible).map((item) => {
              // For players, try to get position info
              let positionTag = null;
              if (type === 'players' && positions.length > 0) {
                // Try to find position from label or by matching player data
                const position = positions.find((p) => p.singular_name_short === item.label);
                if (position) {
                  positionTag = (
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-medium',
                        getPositionColor(position.id)
                      )}
                    >
                      {position.singular_name_short}
                    </span>
                  );
                } else if (item.label) {
                  positionTag = (
                    <span className="rounded bg-slate-500/20 px-1.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/30">
                      {item.label}
                    </span>
                  );
                }
              } else if (type === 'teams' && item.label) {
                // For teams, show short name as label
                positionTag = (
                  <span className="rounded bg-slate-500/20 px-1.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/30">
                    {item.label}
                  </span>
                );
              }

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 rounded border border-dark-border bg-[#25252B] px-2 py-1 text-xs whitespace-nowrap"
                >
                  {positionTag}
                  <span className="text-white">{item.name}</span>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                    title="Remove from comparison"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
            {selectedItems.length > maxVisible && (
              <span className="text-xs text-slate-400 whitespace-nowrap">
                +{selectedItems.length - maxVisible} more
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            className="rounded border border-dark-border bg-[#25252B] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#2F2F3A] whitespace-nowrap"
          >
            Clear All
          </button>
          <button
            onClick={onCompare}
            className="rounded bg-violet-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-600 whitespace-nowrap"
          >
            {type === 'players' ? 'Compare Players' : 'Compare Teams'}
          </button>
        </div>
      </div>
    </div>
  );
}
