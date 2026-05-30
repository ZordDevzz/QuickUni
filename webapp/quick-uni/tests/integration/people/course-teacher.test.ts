import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTeacherClasses, getClassStudents } from "@/actions/course";
import { getServerSession } from "next-auth";
import { db } from "@/db";

// Mocking dependencies
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/services/auth", () => ({
  authOptions: {},
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      employee: {
        findFirst: vi.fn(),
      },
      courseClass: {
        findMany: vi.fn(),
      },
      enrollment: {
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

describe("Teacher Workspace Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTeacherClasses", () => {
    it("should throw error if unauthorized", async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      await expect(getTeacherClasses(1)).rejects.toThrow("Unauthorized");
    });

    it("should return empty array if no employee found", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } });
      vi.mocked(db.query.employee.findFirst).mockResolvedValue(undefined);
      
      const result = await getTeacherClasses(1);
      expect(result).toEqual([]);
    });

    it("should fetch classes for the teacher", async () => {
      vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } });
      vi.mocked(db.query.employee.findFirst).mockResolvedValue({ 
        id: "emp-1",
        code: "EMP001",
        profileId: "prof-1",
        createAt: new Date().toISOString(),
        updateAt: null,
        deletedAt: null
      });
      vi.mocked(db.query.courseClass.findMany).mockResolvedValue([{ 
        id: "class-1", 
        code: "C1",
        teacherId: "emp-1",
        subjectId: "sub-1",
        cap: 30,
        currentSlot: 0,
        status: "opened",
        type: 1,
        semesterId: 1,
        minSessionPeriods: 2,
        allowEvening: false,
        allowWeekend: false,
        startDate: null,
        endDate: null,
        preferredStartPeriod: null,
        createAt: new Date().toISOString(),
        updateAt: null,
        deletedAt: null
      }]);
      
      const result = await getTeacherClasses(1);
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("C1");
    });
  });

  describe("getClassStudents", () => {
    it("should fetch students for a given class", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockResult: any = [
        { id: 1, student: { id: "s1", profile: { fullname: "Student 1" } } }
      ];
      vi.mocked(db.query.enrollment.findMany).mockResolvedValue(mockResult);
      
      const result = await getClassStudents("class-1");
      expect(result).toHaveLength(1);
      expect(result[0].student.profile.fullname).toBe("Student 1");
    });
  });
});
