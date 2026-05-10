"use server";

import { db } from "@/db";
import { courseClass, courseClassType } from "@/db/schemas/course";
import { employee } from "@/db/schemas/user";
import { subject, semester } from "@/db/schemas/academic";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  CourseClassInsertInput, 
  CourseClassUpdateInput,
  courseClassInsertSchema,
  courseClassUpdateSchema
} from "@/lib/validators/course";
import { randomUUID } from "crypto";

export type ActionResponse = {
  success: boolean;
  error?: string;
};

// --- Dependencies ---

export async function getCourseClassFormDependencies() {
  const [teachers, subjects, semesters, types] = await Promise.all([
    db.query.employee.findMany({ with: { profile: true } }),
    db.query.subject.findMany({ where: isNull(subject.deletedAt), orderBy: (s, { asc }) => [asc(s.code)] }),
    db.query.semester.findMany({ orderBy: (s, { desc }) => [desc(s.startDate)] }),
    db.query.courseClassType.findMany(),
  ]);

  return { teachers, subjects, semesters, types };
}

// --- Course Classes ---

export async function getCourseClassesWithRelations() {
  return await db.query.courseClass.findMany({
    where: isNull(courseClass.deletedAt),
    orderBy: (cc, { asc }) => [asc(cc.code)],
    with: {
      subject: true,
      semester: true,
      employee: {
        with: {
          profile: true
        }
      }
    }
  });
}

export async function createCourseClassAction(data: CourseClassInsertInput): Promise<ActionResponse> {
  try {
    const validatedData = courseClassInsertSchema.parse(data);
    await db.insert(courseClass).values({
      ...validatedData,
      id: randomUUID()
    });
    revalidatePath("/admin/courses/classes");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create course class:", error);
    return { success: false, error: error?.message || "Failed to create course class" };
  }
}

export async function updateCourseClassAction(id: string, data: CourseClassUpdateInput): Promise<ActionResponse> {
  try {
    const validatedData = courseClassUpdateSchema.parse(data);
    await db.update(courseClass)
      .set({ ...validatedData, updateAt: new Date().toISOString() })
      .where(eq(courseClass.id, id));
    revalidatePath("/admin/courses/classes");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update course class:", error);
    return { success: false, error: error?.message || "Failed to update course class" };
  }
}

export async function deleteCourseClassAction(id: string): Promise<ActionResponse> {
  try {
    await db.update(courseClass)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(courseClass.id, id));
    revalidatePath("/admin/courses/classes");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete course class:", error);
    return { success: false, error: error?.message || "Failed to delete course class." };
  }
}
