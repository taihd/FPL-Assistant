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

