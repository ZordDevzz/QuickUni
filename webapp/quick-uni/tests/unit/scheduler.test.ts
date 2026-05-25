import { describe, it, expect } from 'vitest';
import { solveWeekly, ScheduleRequest } from '@/services/scheduler';

describe('Scheduler Service', () => {
  it('should generate a conflict-free weekly template', () => {
    const request: ScheduleRequest = {
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

  it('should not allow two different teachers in the same room at the same time', () => {
    const request: ScheduleRequest = {
      classes: [
        { id: 'Class_1', teacherId: 'Teacher_1', periods: 10 },
        { id: 'Class_2', teacherId: 'Teacher_2', periods: 10 },
      ],
      rooms: [{ id: 101 }], // Only one room
      availability: new Map<string, number[]>(),
    };

    const result = solveWeekly(request);
    expect(result).not.toBeNull();
    expect(result?.length).toBe(2);

    const c1 = result!.find(r => r.courseClassId === 'Class_1')!;
    const c2 = result!.find(r => r.courseClassId === 'Class_2')!;

    // Since there's only one room, they MUST be on different days OR at different times if on the same day
    if (c1.dayOfWeek === c2.dayOfWeek) {
      expect(c1.occupyMask & c2.occupyMask).toBe(0);
    }
  });

  it('should respect teacher availability masks', () => {
    // Teacher 1 is busy all week except for the first period of the first day
    const teacher1Availability = new Array(7).fill(0x7FFF); // Busy all day (periods 1-15)
    teacher1Availability[0] = 0x7FFE; // Only period 1 is free on day 0 (0x7FFE = 111 1111 1111 1110)

    const request: ScheduleRequest = {
      classes: [
        { id: 'Class_1', teacherId: 'Teacher_1', periods: 1 },
      ],
      rooms: [{ id: 101 }],
      availability: new Map<string, number[]>([
        ['Teacher_1', teacher1Availability]
      ]),
    };

    const result = solveWeekly(request);
    expect(result).not.toBeNull();
    const c1 = result!.find(r => r.courseClassId === 'Class_1')!;
    expect(c1.dayOfWeek).toBe(0);
    expect(c1.startPeriod).toBe(1);
  });

  it('should respect room availability masks', () => {
    // Room 101 is busy all week except for the last period of the last day
    const room101Availability = new Array(7).fill(0x7FFF);
    room101Availability[6] = 0x3FFF; // Only period 15 is free on day 6 (0x3FFF = 011 1111 1111 1111)

    const request: ScheduleRequest = {
      classes: [
        { id: 'Class_1', teacherId: 'Teacher_1', periods: 1 },
      ],
      rooms: [{ id: 101 }],
      availability: new Map<string, number[]>([
        ['101', room101Availability]
      ]),
    };

    const result = solveWeekly(request);
    expect(result).not.toBeNull();
    const c1 = result!.find(r => r.courseClassId === 'Class_1')!;
    expect(c1.dayOfWeek).toBe(6);
    expect(c1.startPeriod).toBe(15);
  });

  it('should return null for an impossible schedule (too many classes)', () => {
    // 1 room, 1 day (via global availability), 15 periods total
    // Try to schedule 2 classes of 10 periods each -> impossible
    const globalAvailability = new Array(7).fill(0x7FFF);
    globalAvailability[0] = 0; // Only day 0 is free

    const request: ScheduleRequest = {
      classes: [
        { id: 'Class_1', teacherId: 'Teacher_1', periods: 10 },
        { id: 'Class_2', teacherId: 'Teacher_2', periods: 10 },
      ],
      rooms: [{ id: 101 }],
      availability: new Map<string, number[]>([
        ['global', globalAvailability]
      ]),
    };

    const result = solveWeekly(request);
    expect(result).toBeNull();
  });
});
