"use server";

import { db } from "../db";
import { 
  courseClass, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  courseClassType, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  employee, 
  subject, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  semester, 
  enrollment, 
  profile,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  student,
  courseMaterial,
  grade,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  gradeType,
  weeklyTemplate,
  department,
  major
} from "../db/schema";
import { eq, and, isNull, exists } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  CourseClassInsertInput, 
  CourseClassUpdateInput,
  courseClassInsertSchema,
  courseClassUpdateSchema
} from "../lib/validators/course";
import { randomUUID } from "crypto";
import { authOptions } from "../services/auth";
import { getServerSession } from "next-auth";
import { asc } from "drizzle-orm";
import { generateRosterExcel } from "../services/excel";

export type ActionResponse = {
  success: boolean;
  error?: string;
  data?: unknown;
};

// --- Dependencies ---

export async function getCourseClassFormDependencies() {
  const [teachers, subjects, semesters, types, departments, majors] = await Promise.all([
    db.query.employee.findMany({ with: { profile: true } }),
    db.query.subject.findMany({ where: isNull(subject.deletedAt), orderBy: (s, { asc }) => [asc(s.code)] }),
    db.query.semester.findMany({ orderBy: (s, { desc }) => [desc(s.startDate)] }),
    db.query.courseClassType.findMany(),
    db.query.department.findMany({ where: isNull(department.deletedAt), orderBy: (d, { asc }) => [asc(d.name)] }),
    db.query.major.findMany({ where: isNull(major.deletedAt), orderBy: (m, { asc }) => [asc(m.code)] }),
  ]);

  return { teachers, subjects, semesters, types, departments, majors };
}

// --- Course Classes ---

export async function getTeacherClasses(semesterId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const emp = await db.query.employee.findFirst({
    where: (emp, { exists }) => exists(
      db.select()
        .from(profile)
        .where(
          and(
            eq(profile.id, emp.profileId),
            eq(profile.accountId, session.user.id)
          )
        )
    )
  });

  if (!emp) return [];

  return await db.query.courseClass.findMany({
    where: and(
      eq(courseClass.teacherId, emp.id),
      eq(courseClass.semesterId, semesterId),
      isNull(courseClass.deletedAt)
    ),
    with: {
      subject: true,
    }
  });
}

export async function getClassStudents(classId: string) {
  return await db.query.enrollment.findMany({
    where: and(
      eq(enrollment.courseClassId, classId),
      isNull(enrollment.deletedAt)
    ),
    with: {
      student: {
        with: {
          profile: true
        }
      }
    },
    orderBy: (e) => [asc(e.createAt)]
  });
}

export async function getCourseClassesWithRelations() {
  const currentSemester = await db.query.semester.findFirst({
    where: eq(semester.isCurrent, true)
  });

  if (!currentSemester) return [];

  return await db.query.courseClass.findMany({
    where: and(
      isNull(courseClass.deletedAt),
      eq(courseClass.semesterId, currentSemester.id)
    ),
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
    revalidatePath("/[locale]/academic/courses/classes", "page");
    revalidatePath("/academic/courses/classes");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create course class:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create course class";
    return { success: false, error: errorMessage };
  }
}

export async function updateCourseClassAction(id: string, data: CourseClassUpdateInput): Promise<ActionResponse> {
  try {
    const validatedData = courseClassUpdateSchema.parse(data);
    await db.update(courseClass)
      .set({ ...validatedData, updateAt: new Date().toISOString() })
      .where(eq(courseClass.id, id));
    revalidatePath("/[locale]/academic/courses/classes", "page");
    revalidatePath("/academic/courses/classes");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update course class:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update course class";
    return { success: false, error: errorMessage };
  }
}

export async function deleteCourseClassAction(id: string): Promise<ActionResponse> {
  try {
    await db.update(courseClass)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(courseClass.id, id));
    revalidatePath("/[locale]/academic/courses/classes", "page");
    revalidatePath("/academic/courses/classes");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete course class:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete course class.";
    return { success: false, error: errorMessage };
  }
}

export async function exportRosterAction(classId: string): Promise<ActionResponse> {
  try {
    const students = await getClassStudents(classId);
    const buffer = await generateRosterExcel(students);
    
    return { 
      success: true, 
      data: buffer.toString("base64")
    };
  } catch (error: unknown) {
    console.error("Failed to export roster:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to export roster";
    return { success: false, error: errorMessage };
  }
}

// --- Student Actions ---

export async function getStudentEnrollments(semesterId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const stu = await db.query.student.findFirst({
    where: (stu, { exists }) => exists(
      db.select()
        .from(profile)
        .where(
          and(
            eq(profile.id, stu.profileId),
            eq(profile.accountId, session.user.id)
          )
        )
    )
  });

  if (!stu) return [];

  return await db.query.enrollment.findMany({
    where: (en, { and, eq, exists, isNull }) => and(
      eq(en.studentId, stu.id),
      isNull(en.deletedAt),
      exists(
        db.select()
          .from(courseClass)
          .where(
            and(
              eq(courseClass.id, en.courseClassId),
              eq(courseClass.semesterId, semesterId),
              isNull(courseClass.deletedAt)
            )
          )
      )
    ),
    with: {
      courseClass: {
        with: {
          subject: true,
          employee: {
            with: {
              profile: true
            }
          }
        }
      }
    }
  });
}

export async function getStudentClassDetails(classId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const stu = await db.query.student.findFirst({
    where: (stu, { exists }) => exists(
      db.select()
        .from(profile)
        .where(
          and(
            eq(profile.id, stu.profileId),
            eq(profile.accountId, session.user.id)
          )
        )
    )
  });

  if (!stu) throw new Error("Student not found");

  const enroll = await db.query.enrollment.findFirst({
    where: and(
      eq(enrollment.studentId, stu.id),
      eq(enrollment.courseClassId, classId),
      isNull(enrollment.deletedAt)
    )
  });

  if (!enroll) throw new Error("Not enrolled in this class");

  const [materials, grades, schedule] = await Promise.all([
    db.query.courseMaterial.findMany({
      where: eq(courseMaterial.courseClassId, classId)
    }),
    db.query.grade.findMany({
      where: and(
        eq(grade.enrollmentId, enroll.id),
        isNull(grade.deletedAt)
      ),
      with: {
        gradeType: true
      }
    }),
    db.query.weeklyTemplate.findMany({
      where: eq(weeklyTemplate.courseClassId, classId)
    })
  ]);

  return { materials, grades, schedule };
}

