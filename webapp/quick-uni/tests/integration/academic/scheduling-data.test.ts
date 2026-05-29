import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRooms, getTeachers, getCourseClasses, getWeeklyTemplateByEntity } from '@/actions/scheduling-data';
import { db } from '@/db';

vi.mock('@/db', () => ({
  db: {
    query: {
      room: {
        findMany: vi.fn(),
      },
      employee: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      courseClass: {
        findMany: vi.fn(),
      },
      weeklyTemplate: {
        findMany: vi.fn(),
      },
    },
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(),
      })),
    })),
  },
}));

describe('scheduling-data actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRooms should call findMany', async () => {
    await getRooms();
    expect(db.query.room.findMany).toHaveBeenCalled();
  });

  it('getTeachers should call findMany', async () => {
    await getTeachers();
    expect(db.query.employee.findMany).toHaveBeenCalled();
  });

  it('getCourseClasses should call findMany with semesterId', async () => {
    await getCourseClasses(1);
    expect(db.query.courseClass.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.any(Function),
      })
    );
  });

  it('getWeeklyTemplateByEntity should call findMany for room', async () => {
    await getWeeklyTemplateByEntity('101', 'room', 1);
    expect(db.query.weeklyTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.any(Function),
      })
    );
  });

  it('getWeeklyTemplateByEntity should call findMany for teacher', async () => {
    await getWeeklyTemplateByEntity('teacher-uuid', 'teacher', 1);
    expect(db.query.weeklyTemplate.findMany).toHaveBeenCalled();
  });

  it('getWeeklyTemplateByEntity should call findMany for class', async () => {
    await getWeeklyTemplateByEntity('class-uuid', 'class', 1);
    expect(db.query.weeklyTemplate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.any(Function),
      })
    );
  });
});
