import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitRequest, processRequest } from "@/actions/workflow";

// Global mock state
const mockInsertValues = vi.fn();
const mockInsertReturning = vi.fn();
const mockUpdateSet = vi.fn();
const mockUpdateWhere = vi.fn();
const mockUpdateReturning = vi.fn();
const mockSelectLimit = vi.fn();
const mockFindFirst = vi.fn();

vi.mock("next-auth", () => ({
  getServerSession: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

// We need to mock Drizzle ORM's specific operators used in the action
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: vi.fn((col, val) => ({ eq: true, col, val })),
    and: vi.fn((...args) => ({ and: true, args })),
    isNull: vi.fn((col) => ({ isNull: true, col })),
    or: vi.fn((...args) => ({ or: true, args })),
    sql: vi.fn((strings, ...values) => ({ sql: true, strings, values }))
  };
});

vi.mock("@/db", () => {
  return {
    db: {
      insert: vi.fn((table) => ({
        values: vi.fn((vals) => {
          mockInsertValues(table, vals);
          return {
            returning: vi.fn(() => mockInsertReturning()),
            then: (resolve: unknown) => resolve([vals])
          };
        })
      })),
      update: vi.fn((table) => ({
        set: vi.fn((vals) => {
          mockUpdateSet(table, vals);
          return {
            where: vi.fn((cond) => {
              mockUpdateWhere(table, cond);
              return {
                returning: vi.fn(() => mockUpdateReturning()),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                then: (resolve: (data: any[]) => void) => resolve([])
              };
            })
          };
        })
      })),
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(() => {
                return {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  then: (resolve: (data: any[]) => void) => resolve(mockSelectLimit())
                }
              })
            }))
          }))
        }))
      })),
      query: {
        courseClass: {
          findFirst: vi.fn(() => mockFindFirst())
        }
      }
    }
  };
});

describe("Request Side Effects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits a request (student_absence) and sets targetId to teacherId", async () => {
    const { getServerSession } = await import("next-auth");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getServerSession as any).mockResolvedValue({ user: { id: "user1" } });

    mockFindFirst.mockResolvedValueOnce({ id: "c1", teacherId: "teacher1" });
    mockInsertReturning.mockReturnValueOnce([{ id: "req1", type: "student_absence", senderId: "user1" }]);

    const result = await submitRequest("student_absence", { classId: "c1" });

    expect(mockFindFirst).toHaveBeenCalled();
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.anything(), // table
      expect.objectContaining({
        type: "student_absence",
        targetId: "teacher1",
        data: { classId: "c1" },
        senderId: "user1"
      })
    );
    expect(mockInsertValues).toHaveBeenCalledTimes(3); // 1 request, 1 notification, 1 notificationRecipient
    expect(result).toHaveProperty("id", "req1");
  });

  it("processes a request (class_cancellation) and applies side effects", async () => {
    const { getServerSession } = await import("next-auth");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getServerSession as any).mockResolvedValue({ user: { id: "admin1" } });

    mockUpdateReturning.mockReturnValueOnce([{ 
      id: "req2", 
      type: "class_cancellation", 
      senderId: "user1", 
      data: { classId: "c1" } 
    }]);

    mockSelectLimit.mockReturnValueOnce([{ id: "student1" }]);

    await processRequest("req2", "approved", "Looks good");

    // Request status updated
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.anything(), // table
      expect.objectContaining({ status: "approved", comment: "Looks good" })
    );

    // Verify side effects
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.anything(), // enrollment table
      expect.objectContaining({ deletedAt: expect.any(String) })
    );

    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.anything(), // courseClass table
      expect.objectContaining({ currentSlot: expect.anything() })
    );

    expect(mockUpdateSet).toHaveBeenCalledTimes(3); // 1 request, 1 enrollment, 1 courseClass
  });
});
