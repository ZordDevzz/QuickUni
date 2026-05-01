// src/lib/scheduling/slot-finder.test.ts
import { describe, it, expect } from 'vitest';
import { findEmptySlots } from './slot-finder';
import { createMask } from './bitmask';

describe('Slot Finder', () => {
  it('should find all available slots for duration', () => {
    const occupied = createMask(1, 5) | createMask(10, 15);
    const slots = findEmptySlots(occupied, 3);
    expect(slots).toEqual([6, 7]); // Period 6-8 and 7-9 are free (starts at 6, 7)
  });

  it('should return empty array if no slots are available', () => {
    const occupied = createMask(1, 15); // Entire day is full
    const slots = findEmptySlots(occupied, 1);
    expect(slots).toEqual([]);
  });

  it('should handle full duration request', () => {
    const occupied = 0;
    const slots = findEmptySlots(occupied, 15);
    expect(slots).toEqual([1]);
  });

  it('should return empty array for invalid duration (0)', () => {
    const slots = findEmptySlots(0, 0);
    expect(slots).toEqual([]);
  });

  it('should return empty array for duration > 15 (16)', () => {
    const slots = findEmptySlots(0, 16);
    expect(slots).toEqual([]);
  });

  it('should handle duration 15 when free', () => {
    const slots = findEmptySlots(0, 15);
    expect(slots).toEqual([1]);
  });
});
