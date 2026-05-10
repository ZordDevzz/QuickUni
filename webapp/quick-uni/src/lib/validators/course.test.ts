import { describe, it, expect } from "vitest";
import { courseClassInsertSchema } from "./course";

describe("courseClassInsertSchema", () => {
  it("should validate a valid course class input", () => {
    const validData = {
      code: "CS101",
      teacherId: "550e8400-e29b-41d4-a716-446655440000",
      subjectId: "550e8400-e29b-41d4-a716-446655440001",
      cap: 30,
      type: 1,
      semesterId: 1,
      status: "opened",
    };
    const result = courseClassInsertSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail if code is missing", () => {
    const invalidData = {
      teacherId: "550e8400-e29b-41d4-a716-446655440000",
      subjectId: "550e8400-e29b-41d4-a716-446655440001",
      cap: 30,
      type: 1,
      semesterId: 1,
    };
    const result = courseClassInsertSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find(i => i.path.includes("code"))?.message).toBe("Code is required");
    }
  });

  it("should fail if cap is less than 1", () => {
    const invalidData = {
      code: "CS101",
      teacherId: "550e8400-e29b-41d4-a716-446655440000",
      subjectId: "550e8400-e29b-41d4-a716-446655440001",
      cap: 0,
      type: 1,
      semesterId: 1,
    };
    const result = courseClassInsertSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find(i => i.path.includes("cap"))?.message).toBe("Capacity must be greater than 0");
    }
  });
});
