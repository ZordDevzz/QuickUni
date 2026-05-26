import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getSemesters, 
  createSemester, 
  toggleCurrentSemester, 
  deleteSemester 
} from "@/actions/academic";
import { db } from "@/db";
import { semester } from "@/db/schemas/academic";
import { revalidatePath } from 'next/cache';

vi.mock('@/db', () => {
  const mockTx = {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([{ id: 1 }]),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([{ id: 1, isCurrent: true }]),
      })),
    })),
    query: {
      semester: {
        findFirst: vi.fn(),
      },
    },
  };

  return {
    db: {
      query: {
        semester: {
          findMany: vi.fn(),
          findFirst: vi.fn(),
        },
      },
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([{ id: 1 }]),
      })),
      transaction: vi.fn((cb) => cb(mockTx)),
    },
  };
});

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('academic semester actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSemesters should fetch semesters ordered by startDate desc', async () => {
    await getSemesters();
    expect(db.query.semester.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: expect.any(Array),
      })
    );
  });

  it('createSemester should unset other current semesters if isCurrent is true', async () => {
    const data = {
      code: '2023.1',
      name: 'Học kỳ 1 năm học 2023-2024',
      academicYear: 2023,
      startDate: '2023-09-01',
      endDate: '2024-01-31',
      isCurrent: true,
    };

    // Access the mock transaction object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedTx: any;
    vi.mocked(db.transaction).mockImplementationOnce(async (cb) => {
      capturedTx = {
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn().mockResolvedValue([{ id: 1 }]),
          })),
        })),
        insert: vi.fn(() => ({
          values: vi.fn(() => ({
            returning: vi.fn().mockResolvedValue([{ ...data, id: 1 }]),
          })),
        })),
      };
      return cb(capturedTx);
    });

    await createSemester(data);

    expect(db.transaction).toHaveBeenCalled();
    expect(capturedTx.update).toHaveBeenCalledWith(semester);
    expect(capturedTx.insert).toHaveBeenCalledWith(semester);
    expect(revalidatePath).toHaveBeenCalled();
  });

  it('toggleCurrentSemester should set isCurrent to true and unset others', async () => {
    const id = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let capturedTx: any;
    vi.mocked(db.transaction).mockImplementationOnce(async (cb) => {
      capturedTx = {
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn(() => ({
              returning: vi.fn().mockResolvedValue([{ id, isCurrent: true }]),
            })),
          })),
        })),
        query: {
          semester: {
            findFirst: vi.fn().mockResolvedValue({ id, isCurrent: false }),
          },
        },
      };
      return cb(capturedTx);
    });

    await toggleCurrentSemester(id);

    expect(db.transaction).toHaveBeenCalled();
    expect(capturedTx.update).toHaveBeenCalledTimes(2); // One for unsetting others, one for setting target
    expect(revalidatePath).toHaveBeenCalled();
  });

  it('deleteSemester should throw error if deleting current semester', async () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(db.query.semester.findFirst).mockResolvedValueOnce({ id: 1, isCurrent: true } as any);

    await expect(deleteSemester(1)).rejects.toThrow('Cannot delete the current semester');
  });
});
