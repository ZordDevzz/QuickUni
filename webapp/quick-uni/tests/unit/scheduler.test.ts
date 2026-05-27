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
        { id: 'Class_1', teacherId: 'Teacher_1', periods: 5 },
        { id: 'Class_2', teacherId: 'Teacher_2', periods: 5 },
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
        { id: 'Class_1', teacherId: 'Teacher_1', periods: 1, allowWeekend: true },
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
        { id: 'Class_1', teacherId: 'Teacher_1', periods: 1, allowEvening: true, allowWeekend: true },
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

  it('should block weekend scheduling by default', () => {
    // Weekdays are entirely blocked, weekends are free.
    // Class has allowWeekend = false or undefined.
    // It should NOT schedule since weekdays are full and weekend is blocked.
    const globalAvailability = new Array(7).fill(0);
    for (let d = 1; d <= 5; d++) {
      globalAvailability[d] = 0x7FFF; // Block Mon-Fri entirely
    }
    // Days 6 (Sat) and 0 (Sun) are completely free (value 0).

    const request: ScheduleRequest = {
      classes: [
        { id: 'Class_1', teacherId: 'Teacher_1', periods: 2 }, // allowWeekend is false by default
      ],
      rooms: [{ id: 101 }],
      availability: new Map<string, number[]>([
        ['global', globalAvailability]
      ]),
    };

    const result = solveWeekly(request);
    expect(result).toBeNull(); // Cannot schedule because weekend is blocked by default
  });

  it('should allow weekend scheduling if allowWeekend is true', () => {
    // Weekdays are entirely blocked, weekends are free.
    // Class has allowWeekend = true.
    // It should schedule successfully on the weekend.
    const globalAvailability = new Array(7).fill(0);
    for (let d = 1; d <= 5; d++) {
      globalAvailability[d] = 0x7FFF; // Block Mon-Fri entirely
    }

    const request: ScheduleRequest = {
      classes: [
        { id: 'Class_1', teacherId: 'Teacher_1', periods: 2, allowWeekend: true },
      ],
      rooms: [{ id: 101 }],
      availability: new Map<string, number[]>([
        ['global', globalAvailability]
      ]),
    };

    const result = solveWeekly(request);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    const day = result![0].dayOfWeek;
    expect(day === 6 || day === 0).toBe(true);
  });

  it('should prioritize weekdays over weekends even if allowWeekend is true', () => {
    // Both weekdays and weekends are completely free.
    // Class has allowWeekend = true.
    // It should still prioritize Monday-Friday (days 1-5).
    const request: ScheduleRequest = {
      classes: [
        { id: 'Class_1', teacherId: 'Teacher_1', periods: 2, allowWeekend: true },
      ],
      rooms: [{ id: 101 }],
      availability: new Map<string, number[]>(),
    };

    const result = solveWeekly(request);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    const day = result![0].dayOfWeek;
    expect(day >= 1 && day <= 5).toBe(true);
  });

  it('should allow overlapping room and teacher time slots if date intervals do not overlap (gối đầu)', () => {
    const request: ScheduleRequest = {
      classes: [
        // Class_A and Class_B share same room & teacher, but their date ranges are completely distinct
        { id: 'Class_A', teacherId: 'Teacher_1', periods: 4, startDate: '2026-01-01', endDate: '2026-03-31' },
        { id: 'Class_B', teacherId: 'Teacher_1', periods: 4, startDate: '2026-04-01', endDate: '2026-06-30' },
      ],
      rooms: [{ id: 101 }], // Only 1 room available
      availability: new Map<string, number[]>(),
    };

    const result = solveWeekly(request);
    expect(result).not.toBeNull();
    expect(result?.length).toBe(2);

    const a = result!.find(r => r.courseClassId === 'Class_A')!;
    const b = result!.find(r => r.courseClassId === 'Class_B')!;

    // Since they don't overlap in dates, they can be scheduled on the EXACT SAME day, room, and periods!
    expect(a.dayOfWeek).toBe(b.dayOfWeek);
    expect(a.roomId).toBe(b.roomId);
    expect(a.startPeriod).toBe(b.startPeriod);
    expect(a.occupyMask).toBe(b.occupyMask);
  });
});
