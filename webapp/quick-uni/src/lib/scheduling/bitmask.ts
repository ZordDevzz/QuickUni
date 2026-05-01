// src/lib/scheduling/bitmask.ts
export const createMask = (start: number, end: number): number => {
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
  return (~occupiedMask) & 0x7FFF; // 15 bits of 1s
};
