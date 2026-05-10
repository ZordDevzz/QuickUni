import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getCourseClassFormDependencies, 
  getCourseClassesWithRelations,
  createCourseClassAction,
  updateCourseClassAction,
  deleteCourseClassAction
} from './course';
import { db } from '@/db';
import { revalidatePath } from 'next/cache';

vi.mock('@/db', () => ({
  db: {
    query: {
      employee: { findMany: vi.fn() },
      subject: { findMany: vi.fn() },
      semester: { findMany: vi.fn() },
      courseClassType: { findMany: vi.fn() },
      courseClass: { findMany: vi.fn() },
    },
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue({}),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue({}),
      })),
    })),
  },
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('course actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCourseClassFormDependencies should fetch all dependencies', async () => {
    await getCourseClassFormDependencies();
    expect(db.query.employee.findMany).toHaveBeenCalled();
    expect(db.query.subject.findMany).toHaveBeenCalled();
    expect(db.query.semester.findMany).toHaveBeenCalled();
    expect(db.query.courseClassType.findMany).toHaveBeenCalled();
  });

  it('getCourseClassesWithRelations should fetch course classes with relations', async () => {
    await getCourseClassesWithRelations();
    expect(db.query.courseClass.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        with: expect.objectContaining({
          subject: true,
          semester: true,
          employee: expect.any(Object),
        }),
      })
    );
  });

  it('createCourseClassAction should insert new course class', async () => {
    const data = {
      code: 'CS101-L01',
      teacherId: '00000000-0000-0000-0000-000000000001',
      subjectId: '00000000-0000-0000-0000-000000000002',
      cap: 30,
      type: 1,
      semesterId: 1,
      status: 'opened'
    };
    const response = await createCourseClassAction(data);
    expect(db.insert).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/courses/classes');
    expect(response.success).toBe(true);
  });

  it('updateCourseClassAction should update existing course class', async () => {
    const id = '00000000-0000-0000-0000-000000000003';
    const data = { cap: 35 };
    const response = await updateCourseClassAction(id, data);
    expect(db.update).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/courses/classes');
    expect(response.success).toBe(true);
  });

  it('deleteCourseClassAction should soft-delete course class', async () => {
    const id = '00000000-0000-0000-0000-000000000003';
    const response = await deleteCourseClassAction(id);
    expect(db.update).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith('/admin/courses/classes');
    expect(response.success).toBe(true);
  });
});
