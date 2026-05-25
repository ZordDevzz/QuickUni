"use server";

import { db } from "../db";
import { semester } from "../db/schemas/academic";
import { eq, ne, desc } from "drizzle-orm";
import { semesterSchema, SemesterInput } from "../lib/validators/academic";
import { revalidatePath } from "next/cache";

export async function getSemesters() {
  return await db.query.semester.findMany({
    orderBy: [desc(semester.startDate)],
  });
}

export async function createSemester(data: SemesterInput) {
  const validated = semesterSchema.parse(data);
  
  return await db.transaction(async (tx) => {
    if (validated.isCurrent) {
      await tx.update(semester).set({ isCurrent: false }).where(eq(semester.isCurrent, true));
    }
    
    const [result] = await tx.insert(semester).values(validated).returning();
    revalidatePath("/[locale]/admin/academic/semesters", "page");
    return result;
  });
}

export async function updateSemester(id: number, data: SemesterInput) {
  const validated = semesterSchema.parse(data);
  
  return await db.transaction(async (tx) => {
    if (validated.isCurrent) {
      await tx.update(semester).set({ isCurrent: false }).where(ne(semester.id, id));
    }
    
    const [result] = await tx.update(semester)
      .set(validated)
      .where(eq(semester.id, id))
      .returning();
    revalidatePath("/[locale]/admin/academic/semesters", "page");
    return result;
  });
}

export async function toggleCurrentSemester(id: number) {
  return await db.transaction(async (tx) => {
    const current = await tx.query.semester.findFirst({ where: eq(semester.id, id) });
    if (!current) throw new Error("Semester not found");

    await tx.update(semester).set({ isCurrent: false }).where(ne(semester.id, id));
    
    const [result] = await tx.update(semester)
      .set({ isCurrent: true })
      .where(eq(semester.id, id))
      .returning();
    
    revalidatePath("/[locale]/admin/academic/semesters", "page");
    return result;
  });
}

export async function deleteSemester(id: number) {
  const current = await db.query.semester.findFirst({ where: eq(semester.id, id) });
  if (current?.isCurrent) {
    throw new Error("Cannot delete the current semester");
  }
  
  await db.delete(semester).where(eq(semester.id, id));
  revalidatePath("/[locale]/admin/academic/semesters", "page");
  return { success: true };
}
