"use server";

import { db } from "../db";
import { semester, department, major } from "../db/schemas/academic";
import { departmentEmployment } from "../db/schemas/system";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { eq, ne, desc, asc, isNull, sql } from "drizzle-orm";
import {
  semesterSchema,
  SemesterInput,
  departmentSchema,
  DepartmentInput,
  majorSchema,
  MajorInput,
  departmentEmploymentSchema,
  DepartmentEmploymentInput,
} from "../lib/validators/academic";
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

export async function getDepartments() {
  return await db.query.department.findMany({
    orderBy: (d, { asc }) => [asc(d.name)],
    where: (d, { isNull }) => isNull(d.deletedAt),
  });
}

export async function getDepartmentDetails(id: string) {
  return await db.query.department.findFirst({
    where: eq(department.id, id),
    with: {
      majors: {
        where: (m, { isNull }) => isNull(m.deletedAt),
      },
      departmentEmployments: {
        with: {
          employee: {
            with: {
              profile: true,
            },
          },
        },
      },
    },
  });
}

export async function upsertDepartment(data: DepartmentInput) {
  const validated = departmentSchema.parse(data);
  const { id, ...values } = validated;

  let result;
  if (id) {
    [result] = await db
      .update(department)
      .set({ ...values, updateAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(department.id, id))
      .returning();
  } else {
    [result] = await db
      .insert(department)
      .values({
        id: crypto.randomUUID(),
        ...values,
      })
      .returning();
  }

  revalidatePath("/[locale]/admin/academic/departments", "page");
  return result;
}

export async function upsertMajor(data: MajorInput) {
  const validated = majorSchema.parse(data);
  const { id, ...values } = validated;

  let result;
  if (id) {
    [result] = await db
      .update(major)
      .set({ ...values, updateAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(major.id, id))
      .returning();
  } else {
    [result] = await db
      .insert(major)
      .values({
        id: crypto.randomUUID(),
        ...values,
      })
      .returning();
  }

  revalidatePath("/[locale]/admin/academic/departments/[id]", "page");
  revalidatePath("/[locale]/admin/academic/departments", "page");
  return result;
}

export async function assignStaffToDepartment(data: DepartmentEmploymentInput) {
  const validated = departmentEmploymentSchema.parse(data);

  const [result] = await db
    .insert(departmentEmployment)
    .values(validated)
    .onConflictDoUpdate({
      target: [departmentEmployment.employeeId, departmentEmployment.departmentId],
      set: {
        assignDate: validated.assignDate,
        unassignDate: validated.unassignDate,
        roleCode: validated.roleCode,
        roleName: validated.roleName,
      },
    })
    .returning();

  revalidatePath("/[locale]/admin/academic/departments/[id]", "page");
  return result;
}
