import { describe, it, expect, vi, beforeEach } from 'vitest';
import { publishTemplateToSchedule } from './schedule-publish';
import { db } from '../db';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('../db', () => ({
  db: {
    query: {
      semester: {
        findFirst: vi.fn(),
      },
      holidayBlacklist: {
        findMany: vi.fn(),
      },
      weeklyTemplate: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

describe('publishTemplateToSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return success: false if semester is not found', async () => {
    (db.query.semester.findFirst as any).mockResolvedValue(null);

    const result = await publishTemplateToSchedule(1);
    expect(result).toEqual({ success: false, error: 'Semester not found' });
  });

  it('should publish templates to schedule, excluding holidays', async () => {
    const semester = {
      id: 1,
      startDate: '2024-01-01', // Monday
      endDate: '2024-01-07',   // Sunday
    };

    const holidays = [
      { startDate: '2024-01-01', endDate: '2024-01-01', name: 'New Year' }, // Monday
    ];

    const templates = [
      {
        courseClassId: 'class-1',
        roomId: 101,
        dayOfWeek: 1, // Monday (should be skipped due to holiday)
        startPeriod: 1,
        endPeriod: 2,
      },
      {
        courseClassId: 'class-2',
        roomId: 102,
        dayOfWeek: 2, // Tuesday
        startPeriod: 3,
        endPeriod: 4,
      },
    ];

    (db.query.semester.findFirst as any).mockResolvedValue(semester);
    (db.query.holidayBlacklist.findMany as any).mockResolvedValue(holidays);
    (db.query.weeklyTemplate.findMany as any).mockResolvedValue(templates);

    const mockValues = vi.fn();
    (db.insert as any).mockReturnValue({ values: mockValues });
    (db.delete as any).mockReturnValue({ where: vi.fn() });

    await publishTemplateToSchedule(1);

    expect(mockValues).toHaveBeenCalled();
    const insertedValues = mockValues.mock.calls[0][0];
    
    // We expect only class-2 on Tuesday 2024-01-02
    // class-1 on Monday 2024-01-01 is skipped because it's a holiday
    expect(insertedValues.length).toBe(1);
    expect(insertedValues[0]).toMatchObject({
      courseClassId: 'class-2',
      roomId: 102,
      schDate: '2024-01-02',
    });
  });
});
