// src/lib/scheduling/bitmask.ts
export const TOTAL_PERIODS_MASK = 0x7FFF; // 15 bits of 1s

export const createMask = (start: number, end: number): number => {
  if (start < 1 || start > 15 || end < 1 || end > 15) {
    throw new Error('Start and end must be between 1 and 15');
  }
  if (start > end) {
    throw new Error('Start must be less than or equal to end');
  }
  let mask = 0;
  for (let i = start - 1; i <= end - 1; i++) {
    mask |= (1 << i);
  }
  return mask;
};

export const hasCollision = (maskA: number, maskB: number): boolean => {
  return (maskA & maskB) !== 0;
};

export const getAvailableSlots = (occupiedMask: number): number => {
  return (~occupiedMask) & TOTAL_PERIODS_MASK;
};
