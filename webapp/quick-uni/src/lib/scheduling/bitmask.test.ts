// src/lib/scheduling/bitmask.test.ts
import { describe, it, expect } from 'vitest';
import { createMask, hasCollision, getAvailableSlots } from './bitmask';

describe('Bitmask Utils', () => {
  it('should create correct mask for range', () => {
    expect(createMask(1, 3)).toBe(7); // 1 | 2 | 4 (binary 111)
    expect(createMask(2, 2)).toBe(2); // binary 010
  });

  it('should detect collisions', () => {
    expect(hasCollision(createMask(1, 3), createMask(3, 5))).toBe(true);
    expect(hasCollision(createMask(1, 2), createMask(3, 4))).toBe(false);
  });

  it('should return available slots mask', () => {
    const occupied = createMask(1, 5); // 31
    expect(getAvailableSlots(occupied)).toBe(0x7FFF ^ 31);
  });

  it('should throw error for invalid range', () => {
    expect(() => createMask(0, 5)).toThrow('Start and end must be between 1 and 15');
    expect(() => createMask(1, 16)).toThrow('Start and end must be between 1 and 15');
    expect(() => createMask(5, 3)).toThrow('Start must be less than or equal to end');
  });

  it('should handle edge cases for single bits', () => {
    expect(createMask(1, 1)).toBe(1); // 2^0
    expect(createMask(15, 15)).toBe(0x4000); // 2^14
  });

  it('should create full mask for 1-15 range', () => {
    expect(createMask(1, 15)).toBe(0x7FFF);
  });
});
