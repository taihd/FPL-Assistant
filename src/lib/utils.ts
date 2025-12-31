import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price from tenths (e.g., 100 = £10.0m)
 */
export function formatPrice(price: number): string {
  return `£${(price / 10).toFixed(1)}m`;
}

/**
 * Get position name from element type
 */
export function getPositionName(elementType: number): string {
  const positions: Record<number, string> = {
    1: 'GK',
    2: 'DEF',
    3: 'MID',
    4: 'FWD',
  };
  return positions[elementType] || 'UNK';
}

/**
 * Get position full name from element type
 */
export function getPositionFullName(elementType: number): string {
  const positions: Record<number, string> = {
    1: 'Goalkeeper',
    2: 'Defender',
    3: 'Midfielder',
    4: 'Forward',
  };
  return positions[elementType] || 'Unknown';
}

/**
 * Determine if a stat is "higher is better" or "lower is better"
 * Returns true if higher is better, false if lower is better
 */
export function isHigherBetter(statName: string): boolean {
  const lowerIsBetterStats = [
    'price',
    'cost',
    'goalsconceded',
    'goals_conceded',
    'expected_goals_conceded',
    'xdc',
    // Note: defcon and defcon_average are NOT in this list because higher is better
  ];
  const statLower = statName.toLowerCase();
  return !lowerIsBetterStats.some((stat) => statLower.includes(stat));
}

/**
 * Find the best and worst values for a given stat across players
 * Returns an object with bestIndex and worstIndex arrays
 * If all values are the same, returns empty arrays (no highlighting)
 */
export function findBestAndWorst<T>(
  values: T[],
  getValue: (item: T) => number,
  higherIsBetter: boolean
): { bestIndices: number[]; worstIndices: number[] } {
  if (values.length === 0) {
    return { bestIndices: [], worstIndices: [] };
  }

  const numericValues = values.map((item, index) => ({
    value: getValue(item),
    index,
  }));

  const sorted = [...numericValues].sort((a, b) => {
    if (higherIsBetter) {
      return b.value - a.value; // Descending
    } else {
      return a.value - b.value; // Ascending
    }
  });

  const bestValue = sorted[0].value;
  const worstValue = sorted[sorted.length - 1].value;

  // If all values are the same, don't highlight anything
  if (bestValue === worstValue) {
    return { bestIndices: [], worstIndices: [] };
  }

  const bestIndices = numericValues
    .filter((item) => item.value === bestValue)
    .map((item) => item.index);

  const worstIndices = numericValues
    .filter((item) => item.value === worstValue)
    .map((item) => item.index);

  return { bestIndices, worstIndices };
}

