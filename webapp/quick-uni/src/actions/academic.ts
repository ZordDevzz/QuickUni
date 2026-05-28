"use server";

import { db } from "../db";
import { semester, department, major, subject, subjectPrerequisite, educationType } from "../db/schemas/academic";
import { departmentEmployment } from "../db/schemas/system";
import { mainClass } from "../db/schemas/course";
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
  subjectSchema,
  SubjectInput,
  mainClassSchema,
  MainClassInput,
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

export async function getSubjects() {
  return await db.query.subject.findMany({
    where: isNull(subject.deletedAt),
    orderBy: [asc(subject.code)],
    with: {
      subjectPrerequisites_subjectId: {
        with: {
          subject_prerequisiteId: true,
        },
      },
    },
  });
}

export async function upsertSubject(data: SubjectInput) {
  const validated = subjectSchema.parse(data);
  const { id, prerequisites, ...values } = validated;

  return await db.transaction(async (tx) => {
    let subjectId: string;
    
    if (id) {
      subjectId = id;
      await tx
        .update(subject)
        .set({ ...values, updateAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(subject.id, id));
        
      await tx
        .delete(subjectPrerequisite)
        .where(eq(subjectPrerequisite.subjectId, id));
    } else {
      subjectId = crypto.randomUUID();
      await tx
        .insert(subject)
        .values({
          id: subjectId,
          ...values,
        });
    }

    if (prerequisites && prerequisites.length > 0) {
      await tx
        .insert(subjectPrerequisite)
        .values(
          prerequisites.map((p) => ({
            subjectId,
            prerequisiteId: p.prerequisiteId,
            type: p.type,
          }))
        );
    }

    revalidatePath("/[locale]/academic/subjects", "page");
    revalidatePath("/academic/subjects");
    return { success: true };
  });
}

export async function deleteSubject(id: string) {
  await db
    .update(subject)
    .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(subject.id, id));

  revalidatePath("/[locale]/academic/subjects", "page");
  revalidatePath("/academic/subjects");
  return { success: true };
}

export async function getMajors() {
  return await db.query.major.findMany({
    where: (m, { isNull }) => isNull(m.deletedAt),
    orderBy: (m, { asc }) => [asc(m.code)],
    with: {
      department: true,
    }
  });
}

export async function getMainClasses() {
  return await db.query.mainClass.findMany({
    orderBy: (mc, { asc }) => [asc(mc.code)],
    with: {
      major: {
        with: {
          department: true,
        }
      }
    }
  });
}

export async function getEducationTypes() {
  return await db.query.educationType.findMany({
    orderBy: (et, { asc }) => [asc(et.name)],
  });
}

export async function upsertMainClass(data: MainClassInput) {
  const validated = mainClassSchema.parse(data);
  const { id, ...values } = validated;

  let result;
  if (id) {
    [result] = await db
      .update(mainClass)
      .set(values)
      .where(eq(mainClass.id, id))
      .returning();
  } else {
    [result] = await db
      .insert(mainClass)
      .values({
        id: crypto.randomUUID(),
        ...values,
      })
      .returning();
  }

  revalidatePath("/[locale]/academic/classes", "page");
  revalidatePath("/[locale]/academic/classes/[id]", "page");
  return result;
}

export async function deleteMainClass(id: string) {
  await db.delete(mainClass).where(eq(mainClass.id, id));
  revalidatePath("/[locale]/academic/classes", "page");
  return { success: true };
}

export async function getMainClassDetails(id: string) {
  return await db.query.mainClass.findFirst({
    where: eq(mainClass.id, id),
    with: {
      major: {
        with: {
          department: true,
        }
      },
      educationType: true,
      employee: {
        with: {
          profile: true,
        }
      },
      mainClassMembers: {
        with: {
          student: {
            with: {
              profile: true,
            }
          }
        }
      }
    }
  });
}
