// src/lib/scheduling/slot-finder.ts
import { hasCollision, createMask } from './bitmask';

/**
 * Finds all available start periods for a contiguous slot of a given duration.
 * A day has 15 periods (1-15).
 * 
 * @param occupiedMask - Bitmask representing occupied periods
 * @param duration - Number of contiguous periods required
 * @returns Array of starting periods (1-based)
 */
export const MAX_PERIODS = 15;

export function findEmptySlots(occupiedMask: number, duration: number): number[] {
  if (duration <= 0 || duration > MAX_PERIODS) {
    return [];
  }

  const possibleStarts: number[] = [];
  // Max period is 15. If duration is 3, last possible start is 13 (13, 14, 15)
  // MAX_PERIODS - duration + 1
  for (let start = 1; start <= MAX_PERIODS - duration + 1; start++) {
    const candidateMask = createMask(start, start + duration - 1);
    if (!hasCollision(occupiedMask, candidateMask)) {
      possibleStarts.push(start);
    }
  }
  return possibleStarts;
}
