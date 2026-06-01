"use server";

import { db } from "../db";
import { semester, department, major, subject, subjectPrerequisite, educationType, departmentPosition } from "../db/schemas/academic";
import { departmentEmployment } from "../db/schemas/system";
import { mainClass, mainClassMember } from "../db/schemas/course";
import { student } from "../db/schemas/user";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { eq, ne, desc, asc, isNull, sql, and } from "drizzle-orm";
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
  departmentPositionSchema,
  DepartmentPositionInput,
} from "../lib/validators/academic";
import { revalidatePath } from "next/cache";

export type ActionResponse = {
  success: boolean;
  error?: string;
  data?: unknown;
};

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

export async function unassignStaffFromDepartment(employeeId: string, departmentId: string) {
  await db
    .delete(departmentEmployment)
    .where(
      and(
        eq(departmentEmployment.employeeId, employeeId),
        eq(departmentEmployment.departmentId, departmentId)
      )
    );
  revalidatePath("/[locale]/admin/academic/departments/[id]", "page");
  return { success: true };
}

export async function getDepartmentPositions(departmentId: string) {
  return await db.query.departmentPosition.findMany({
    where: eq(departmentPosition.departmentId, departmentId),
    orderBy: [asc(departmentPosition.code)],
  });
}

export async function upsertDepartmentPosition(data: DepartmentPositionInput) {
  const validated = departmentPositionSchema.parse(data);
  const { id, ...values } = validated;

  let result;
  if (id) {
    [result] = await db
      .update(departmentPosition)
      .set(values)
      .where(eq(departmentPosition.id, id))
      .returning();
  } else {
    [result] = await db
      .insert(departmentPosition)
      .values({
        id: crypto.randomUUID(),
        ...values,
      })
      .returning();
  }

  revalidatePath("/[locale]/admin/academic/departments/[id]", "page");
  return result;
}

export async function deleteDepartmentPosition(id: string) {
  await db.delete(departmentPosition).where(eq(departmentPosition.id, id));
  revalidatePath("/[locale]/admin/academic/departments/[id]", "page");
  return { success: true };
}

export async function initializeDefaultPositions(departmentId: string, isAcademic: boolean) {
  const defaults = isAcademic 
    ? [
        { code: "TRUONG_KHOA", name: "Trưởng khoa", des: "Điều hành và quản lý chung toàn khoa" },
        { code: "PHO_KHOA", name: "Phó Trưởng khoa", des: "Hỗ trợ Trưởng khoa quản lý học thuật/khảo thí" },
        { code: "TRUONG_BO_MON", name: "Trưởng bộ môn", des: "Quản lý tổ chuyên môn học phần" },
        { code: "GIANG_VIEN", name: "Giảng viên", des: "Công tác giảng dạy và nghiên cứu khoa học" },
        { code: "TRO_GIANG", name: "Trợ giảng", des: "Hỗ trợ giảng dạy, chấm bài" },
        { code: "GIAO_VU", name: "Giáo vụ khoa", des: "Quản lý hồ sơ học tập và thời khóa biểu khoa" },
        { code: "NHAN_VIEN", name: "Nhân viên văn phòng", des: "Công tác hành chính hỗ trợ tại văn phòng khoa" },
      ]
    : [
        { code: "TRUONG_PHONG", name: "Trưởng phòng", des: "Chỉ đạo, quản lý và điều hành các hoạt động của phòng" },
        { code: "PHO_PHONG", name: "Phó Trưởng phòng", des: "Phụ trách các mảng công việc chuyên biệt theo phân công" },
        { code: "CHUYEN_VIEN", name: "Chuyên viên", des: "Nghiên cứu, tham mưu và thực thi các nghiệp vụ chuyên môn" },
        { code: "NHAN_VIEN", name: "Nhân viên", des: "Thực hiện các công việc văn thư, hỗ trợ hành chính" },
      ];

  await db.transaction(async (tx) => {
    for (const item of defaults) {
      // Check if code already exists for this department
      const existing = await tx.query.departmentPosition.findFirst({
        where: and(
          eq(departmentPosition.departmentId, departmentId),
          eq(departmentPosition.code, item.code)
        )
      });
      
      if (!existing) {
        await tx.insert(departmentPosition).values({
          id: crypto.randomUUID(),
          departmentId,
          code: item.code,
          name: item.name,
          des: item.des,
        });
      }
    }
  });

  revalidatePath("/[locale]/admin/academic/departments/[id]", "page");
  return { success: true };
}

export async function addStudentToClass(classId: string, studentId: string): Promise<ActionResponse> {
  try {
    await db.insert(mainClassMember).values({
      studentId,
      classId,
      roleId: 3, // Default role 'Member'
    });
    revalidatePath("/[locale]/academic/classes/[id]", "page");
    revalidatePath("/academic/classes/[id]");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add student to class:", error);
    return { success: false, error: error.message || "Failed to add student to class" };
  }
}

export async function removeStudentFromClass(classId: string, studentId: string): Promise<ActionResponse> {
  try {
    await db.delete(mainClassMember).where(
      and(
        eq(mainClassMember.studentId, studentId),
        eq(mainClassMember.classId, classId)
      )
    );
    revalidatePath("/[locale]/academic/classes/[id]", "page");
    revalidatePath("/academic/classes/[id]");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to remove student from class:", error);
    return { success: false, error: error.message || "Failed to remove student from class" };
  }
}

export async function getAvailableStudents() {
  const allStudents = await db.query.student.findMany({
    with: {
      profile: true,
      mainClassMembers: true,
    }
  });
  // Filter out students who are already members of any administrative class
  return allStudents.filter(s => !s.mainClassMembers || s.mainClassMembers.length === 0);
}
