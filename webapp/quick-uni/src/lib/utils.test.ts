import { describe, it, expect } from 'vitest';
import { stringToHslColor } from './utils';

describe('stringToHslColor', () => {
  it('should return stable HSL color for the same string', () => {
    const color1 = stringToHslColor('subject-123');
    const color2 = stringToHslColor('subject-123');
    expect(color1).toBe(color2);
  });
});
