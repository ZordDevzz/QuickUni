import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPerson, getPeople } from '@/actions/people';
import { db } from '@/db';
import { revalidatePath } from 'next/cache';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { profile, student, employee } from '@/db/schemas/user';

const mockTx = vi.hoisted(() => ({
  insert: vi.fn().mockReturnThis(),
  values: vi.fn(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  query: {
    student: { findFirst: vi.fn() },
    employee: { findFirst: vi.fn() },
  }
}));

vi.mock('@/db', () => ({
  db: {
    transaction: vi.fn(async (cb) => {
      return cb(mockTx);
    }),
    query: {
      student: { findMany: vi.fn() },
      employee: { findMany: vi.fn() },
    }
  }
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('People Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a student and its profile atomically', async () => {
    const data = {
      code: "STU001",
      fullname: "John Doe",
      gender: "male" as const,
      dob: "2000-01-01",
      nationalId: "123456789",
      schemaId: 1,
    };

    await createPerson('student', data);

    expect(db.transaction).toHaveBeenCalled();
    expect(mockTx.insert).toHaveBeenCalledWith(profile);
    expect(mockTx.insert).toHaveBeenCalledWith(student);
    expect(mockTx.values).toHaveBeenCalledTimes(2);
    expect(revalidatePath).toHaveBeenCalledWith('/[locale]/academic/people/students', 'page');
  });

  it('should fetch students with profiles', async () => {
    await getPeople('student');
    expect(db.query.student.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        with: { profile: true },
      })
    );
  });
});