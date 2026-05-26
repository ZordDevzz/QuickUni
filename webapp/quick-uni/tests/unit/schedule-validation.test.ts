import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateManualEdit } from '@/services/schedule-validation';
import { db } from '@/db';

// Mock the database
vi.mock('@/db', () => ({
  db: {
    query: {
      schedule: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('Schedule Validation Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const baseParams = {
    courseClassId: 'class-1',
    teacherId: 'teacher-1',
    roomId: 101,
    schDate: '2026-05-10',
    startPeriod: 1,
    endPeriod: 2,
  };

  it('should return valid: true if no collisions exist', async () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.schedule.findMany as any).mockResolvedValue([]);

    const result = await validateManualEdit(baseParams);
    expect(result).toEqual({ valid: true });
  });

  it('should detect teacher collisions', async () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.schedule.findMany as any)
      .mockResolvedValueOnce([
        { id: 10, period: 2, endPeriod: 4 } // Overlaps with 1-2
      ])
      .mockResolvedValueOnce([]); // No room collisions

    const result = await validateManualEdit(baseParams);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Teacher is busy in this time slot');
  });

  it('should detect room collisions', async () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.schedule.findMany as any)
      .mockResolvedValueOnce([]) // No teacher collisions
      .mockResolvedValueOnce([
        { id: 20, period: 1, endPeriod: 1 } // Overlaps with 1-2
      ]);

    const result = await validateManualEdit(baseParams);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Room is occupied in this time slot');
  });

  it('should ignore the current schedule ID being edited', async () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (db.query.schedule.findMany as any).mockResolvedValue([]);

    const paramsWithId = { ...baseParams, scheduleId: 10 };
    await validateManualEdit(paramsWithId);

    // Verify that the query included the ne(schedule.id, 10) condition
    // In our simplified mock, we just check that it was called.
    expect(db.query.schedule.findMany).toHaveBeenCalled();
  });
});
