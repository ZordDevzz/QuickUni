import { describe, it, expect } from 'vitest';
import { solveWeekly } from './scheduler';

describe('Scheduler Service', () => {
  it('should generate a conflict-free weekly template', () => {
    const request = {
      classes: [
        { id: 'Class_A', teacherId: 'Teacher_1', periods: 4 },
        { id: 'Class_B', teacherId: 'Teacher_1', periods: 2 },
        { id: 'Class_C', teacherId: 'Teacher_2', periods: 3 },
      ],
      rooms: [{ id: 101 }, { id: 102 }],
      availability: new Map<string, number[]>(),
    };
    
    const result = solveWeekly(request);
    expect(result).not.toBeNull();
    expect(result?.length).toBe(3);
    
    // Verify results: Check no collisions between Class_A and Class_B for Teacher_1
    const a = result!.find(r => r.courseClassId === 'Class_A')!;
    const b = result!.find(r => r.courseClassId === 'Class_B')!;
    
    if (a.dayOfWeek === b.dayOfWeek) {
        expect(a.occupyMask & b.occupyMask).toBe(0);
    }
  });
});
