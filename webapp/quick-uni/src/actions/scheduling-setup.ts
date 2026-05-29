"use server";

import { db } from "../db";
import { room, availability } from "../db/schemas/schedule";
import { employee } from "../db/schemas/user";
import { courseClass } from "../db/schemas/course";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getRoomsSetup() {
  try {
    return await db.query.room.findMany({
      with: {
        building: true
      },
      orderBy: (r, { asc }) => [asc(r.code)]
    });
  } catch (error) {
    console.error("Error in getRoomsSetup:", error);
    throw new Error("Failed to fetch rooms setup");
  }
}

export async function updateRoomAvailabilityAction(id: number, isAvailable: boolean) {
  try {
    await db.update(room)
      .set({ isAvailable })
      .where(eq(room.id, id));
    revalidatePath("/admin/schedule");
    revalidatePath("/[locale]/academic/schedule", "page");
    return { success: true };
  } catch (error) {
    console.error("Error in updateRoomAvailabilityAction:", error);
    return { success: false, error: "Failed to update room availability" };
  }
}

export async function getTeachersSetup() {
  try {
    const rawTeachers = await db.query.employee.findMany({
      with: {
        profile: {
          with: {
            account: {
              with: {
                userSystemRoles: true
              }
            }
          }
        }
      }
    });

    const teachers = rawTeachers.filter((emp) => {
      const roles = emp.profile?.account?.userSystemRoles || [];
      const hasAdminOrAcademicOffice = roles.some((r) => {
        const roleId = Number(r.systemRole);
        return roleId === 1 || roleId === 4;
      });
      return !hasAdminOrAcademicOffice;
    });

    const teacherAvailabilities = await db.query.availability.findMany({
      where: eq(availability.entityType, "teacher")
    });

    return teachers.map(t => {
      const availMasks = new Array(7).fill(0);
      teacherAvailabilities
        .filter(a => a.entityId === t.id)
        .forEach(a => {
          availMasks[a.dayOfWeek] = a.occupiedMask;
        });

      return {
        id: t.id,
        code: t.code,
        name: t.profile?.fullname || t.code,
        busyMasks: availMasks
      };
    });
  } catch (error) {
    console.error("Error in getTeachersSetup:", error);
    throw new Error("Failed to fetch teachers setup");
  }
}

export async function updateTeacherSetupAction(
  teacherId: string,
  busyMasks: number[]
) {
  try {
    // Update availability masks for the teacher
    await db.transaction(async (tx) => {
      // Clear old availability
      await tx.delete(availability).where(
        and(
          eq(availability.entityId, teacherId),
          eq(availability.entityType, "teacher")
        )
      );

      // Insert new occupied/busy masks
      const toInsert = busyMasks
        .map((mask, dayOfWeek) => ({
          entityId: teacherId,
          entityType: "teacher" as const,
          dayOfWeek,
          occupiedMask: mask
        }))
        .filter(item => item.occupiedMask > 0); // Only store if there are occupied periods

      if (toInsert.length > 0) {
        await tx.insert(availability).values(toInsert);
      }
    });

    revalidatePath("/admin/schedule");
    revalidatePath("/[locale]/academic/schedule", "page");
    return { success: true };
  } catch (error) {
    console.error("Error in updateTeacherSetupAction:", error);
    return { success: false, error: "Failed to update teacher setup" };
  }
}

export async function getCourseClassesSetup(semesterId: number) {
  try {
    return await db.query.courseClass.findMany({
      where: and(
        eq(courseClass.semesterId, semesterId),
        isNull(courseClass.deletedAt)
      ),
      with: {
        subject: true,
        employee: {
          with: {
            profile: true
          }
        }
      },
      orderBy: (cc, { asc }) => [asc(cc.code)]
    });
  } catch (error) {
    console.error("Error in getCourseClassesSetup:", error);
    throw new Error("Failed to fetch course classes setup");
  }
}

export async function updateCourseClassSetupAction(
  id: string,
  minSessionPeriods: number,
  allowEvening: boolean,
  allowWeekend?: boolean,
  preferredStartPeriod?: number | null
) {
  try {
    await db.update(courseClass)
      .set({ 
        minSessionPeriods, 
        allowEvening, 
        allowWeekend: allowWeekend ?? false,
        preferredStartPeriod: preferredStartPeriod ?? null
      })
      .where(eq(courseClass.id, id));
    revalidatePath("/admin/schedule");
    revalidatePath("/[locale]/academic/schedule", "page");
    return { success: true };
  } catch (error) {
    console.error("Error in updateCourseClassSetupAction:", error);
    return { success: false, error: "Failed to update course class setup" };
  }
}
