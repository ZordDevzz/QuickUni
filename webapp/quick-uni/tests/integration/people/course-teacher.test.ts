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
      vi.mocked(db.query.employee.findFirst).mockResolvedValue({ id: "emp-1" });
      vi.mocked(db.query.courseClass.findMany).mockResolvedValue([{ id: "class-1", code: "C1" }]);
      
      const result = await getTeacherClasses(1);
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe("C1");
    });
  });

  describe("getClassStudents", () => {
    it("should fetch students for a given class", async () => {
      vi.mocked(db.query.enrollment.findMany).mockResolvedValue([
        { id: "e1", student: { id: "s1", profile: { fullname: "Student 1" } } }
      ]);
      
      const result = await getClassStudents("class-1");
      expect(result).toHaveLength(1);
      expect(result[0].student.profile.fullname).toBe("Student 1");
    });
  });
});
