"use server";
import { db } from "../db";
import { weeklyTemplate, availability, holidayBlacklist } from "../db/schemas/schedule";
import { courseClass } from "../db/schemas/course";
import { eq, and, ne, asc, exists } from "drizzle-orm";
import { createMask, hasCollision } from "../lib/scheduling/bitmask";

const WEEKLY_TEMPLATE_WITH_RELATIONS = {
  room: true,
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
} as const;

export async function getRooms() {
  try {
    return await db.query.room.findMany({
      with: {
        building: true
      }
    });
  } catch (error) {
    console.error("Error in getRooms:", error);
    throw new Error("Failed to fetch rooms");
  }
}

export async function getSemesters() {
  try {
    return await db.query.semester.findMany({
      orderBy: (s, { desc }) => [desc(s.startDate)]
    });
  } catch (error) {
    console.error("Error in getSemesters:", error);
    throw new Error("Failed to fetch semesters");
  }
}

export async function getTeachers() {
  try {
    return await db.query.employee.findMany({
      with: { 
        profile: true 
      }
    });
  } catch (error) {
    console.error("Error in getTeachers:", error);
    throw new Error("Failed to fetch teachers");
  }
}

export async function getCourseClasses(semesterId: number) {
  try {
    return await db.query.courseClass.findMany({
      where: (cc, { eq }) => eq(cc.semesterId, semesterId),
      with: { 
        subject: true,
        employee: {
          with: {
            profile: true
          }
        }
      }
    });
  } catch (error) {
    console.error("Error in getCourseClasses:", error);
    throw new Error("Failed to fetch course classes");
  }
}

export async function getCurrentSemester() {
  try {
    const semesterData = await db.query.semester.findFirst({
      where: (s, { eq }) => eq(s.isCurrent, true)
    });
    return semesterData;
  } catch (error) {
    console.error("Error in getCurrentSemester:", error);
    throw new Error("Failed to fetch current semester");
  }
}

export async function upsertWeeklyTemplate(data: Omit<typeof weeklyTemplate.$inferInsert, 'occupyMask'>) {
  try {
    const mask = createMask(data.startPeriod, data.endPeriod);
    const finalData = { ...data, occupyMask: mask } as typeof weeklyTemplate.$inferInsert;

    if (data.id) {
      await db.update(weeklyTemplate)
        .set(finalData)
        .where(eq(weeklyTemplate.id, data.id));
      return { success: true, id: data.id };
    } else {
      const result = await db.insert(weeklyTemplate).values(finalData).returning({ id: weeklyTemplate.id });
      return { success: true, id: result[0].id };
    }
  } catch (error) {
    console.error("Error in upsertWeeklyTemplate:", error);
    throw new Error("Failed to save weekly template");
  }
}

export async function deleteWeeklyTemplate(id: string) {
  try {
    await db.delete(weeklyTemplate).where(eq(weeklyTemplate.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteWeeklyTemplate:", error);
    throw new Error("Failed to delete weekly template");
  }
}

export async function toggleAvailabilityAction(params: {
  entityId: string,
  entityType: 'teacher' | 'room' | 'subject' | 'global',
  dayOfWeek: number,
  slotMask: number
}) {
  try {
    const existing = await db.query.availability.findFirst({
      where: (a, { and, eq }) => and(
        eq(a.entityId, params.entityId),
        eq(a.entityType, params.entityType),
        eq(a.dayOfWeek, params.dayOfWeek)
      )
    });

    if (existing) {
      const newMask = existing.occupiedMask ^ params.slotMask;
      await db.update(availability)
        .set({ occupiedMask: newMask })
        .where(eq(availability.id, existing.id));
    } else {
      await db.insert(availability).values({
        entityId: params.entityId,
        entityType: params.entityType,
        dayOfWeek: params.dayOfWeek,
        occupiedMask: params.slotMask
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error in toggleAvailabilityAction:", error);
    return { success: false, error: "Failed to toggle availability" };
  }
}

export async function validateWeeklyTemplateEdit(params: {
  id?: string;
  courseClassId: string;
  roomId: number;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
}) {
  const newMask = createMask(params.startPeriod, params.endPeriod);

  // First, find the semester for the courseClass we are trying to assign
  const targetClass = await db.query.courseClass.findFirst({
    where: (cc, { eq }) => eq(cc.id, params.courseClassId)
  });

  if (!targetClass) {
    return { valid: false, reason: "Invalid course class" };
  }

  const semesterId = targetClass.semesterId;
  const teacherId = targetClass.teacherId;

  // 1. Check for Room collisions in weeklyTemplate (scoped to semester)
  const roomConflicts = await db.query.weeklyTemplate.findMany({
    where: (template, { and, eq, ne, exists }) => and(
      eq(template.roomId, params.roomId),
      eq(template.dayOfWeek, params.dayOfWeek),
      params.id ? ne(template.id, params.id) : undefined,
      exists(
        db.select()
          .from(courseClass)
          .where(and(
            eq(courseClass.id, template.courseClassId),
            eq(courseClass.semesterId, semesterId)
          ))
      )
    )
  });

  for (const conflict of roomConflicts) {
    if (hasCollision(newMask, conflict.occupyMask)) {
      return { valid: false, reason: "Room is already occupied in this time slot" };
    }
  }

  // 2. Check for Teacher collisions (scoped to semester)
  const teacherConflicts = await db.query.weeklyTemplate.findMany({
    where: (template, { and, eq, ne, exists }) => and(
      eq(template.dayOfWeek, params.dayOfWeek),
      params.id ? ne(template.id, params.id) : undefined,
      exists(
        db.select()
          .from(courseClass)
          .where(and(
            eq(courseClass.id, template.courseClassId),
            eq(courseClass.teacherId, teacherId),
            eq(courseClass.semesterId, semesterId)
          ))
      )
    )
  });

  for (const conflict of teacherConflicts) {
    if (hasCollision(newMask, conflict.occupyMask)) {
      return { valid: false, reason: "Teacher is already busy in this time slot" };
    }
  }

  // 3. Check for Class collisions (scoped to semester, though class is already semester-bound)
  const classConflicts = await db.query.weeklyTemplate.findMany({
    where: (template, { and, eq, ne }) => and(
      eq(template.courseClassId, params.courseClassId),
      eq(template.dayOfWeek, params.dayOfWeek),
      params.id ? ne(template.id, params.id) : undefined
    )
  });

  for (const conflict of classConflicts) {
    if (hasCollision(newMask, conflict.occupyMask)) {
      return { valid: false, reason: "Course class is already scheduled in this time slot" };
    }
  }

  return { valid: true };
}

export async function getAvailability(entityId: string, type: 'teacher' | 'room' | 'subject' | 'global') {
  try {
    return await db.query.availability.findMany({
      where: (a, { and, eq }) => and(eq(a.entityId, entityId), eq(a.entityType, type))
    });
  } catch (error) {
    console.error("Error in getAvailability:", error);
    throw new Error("Failed to fetch availability");
  }
}

export async function getHolidays() {
  try {
    return await db.query.holidayBlacklist.findMany({
      orderBy: (h, { asc }) => [asc(h.startDate)]
    });
  } catch (error) {
    console.error("Error in getHolidays:", error);
    throw new Error("Failed to fetch holidays");
  }
}

export async function addHolidayAction(params: { startDate: string, endDate: string, name?: string, semesterId?: number }) {
  try {
    await db.insert(holidayBlacklist).values({
      startDate: params.startDate,
      endDate: params.endDate,
      name: params.name,
      semesterId: params.semesterId,
      isGlobal: !params.semesterId
    });
    return { success: true };
  } catch (error) {
    console.error("Error in addHolidayAction:", error);
    return { success: false, error: "Failed to add holiday" };
  }
}

export async function deleteHolidayAction(id: number) {
  try {
    await db.delete(holidayBlacklist).where(eq(holidayBlacklist.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error in deleteHolidayAction:", error);
    return { success: false, error: "Failed to delete holiday" };
  }
}

export async function getWeeklyTemplateByEntity(entityId: string, type: 'room' | 'teacher' | 'class', semesterId: number | null) {
  if (!semesterId) return [];
  try {
    if (type === 'room') {
      const roomId = parseInt(entityId);
      if (isNaN(roomId)) {
        throw new Error("Invalid room ID");
      }
      return await db.query.weeklyTemplate.findMany({
        where: (template, { and, eq, exists }) => and(
          eq(template.roomId, roomId),
          exists(
            db.select()
              .from(courseClass)
              .where(and(
                eq(courseClass.id, template.courseClassId),
                eq(courseClass.semesterId, semesterId)
              ))
          )
        ),
        with: WEEKLY_TEMPLATE_WITH_RELATIONS
      });
    }
    
    if (type === 'teacher') {
      // Filter templates where the course class is taught by this teacher AND in this semester
      return await db.query.weeklyTemplate.findMany({
        where: (template, { exists, and, eq }) => exists(
          db.select()
            .from(courseClass)
            .where(and(
              eq(courseClass.id, template.courseClassId),
              eq(courseClass.teacherId, entityId),
              eq(courseClass.semesterId, semesterId)
            ))
        ),
        with: WEEKLY_TEMPLATE_WITH_RELATIONS
      });
    }
    
    if (type === 'class') {
      return await db.query.weeklyTemplate.findMany({
        where: (template, { and, eq, exists }) => and(
          eq(template.courseClassId, entityId),
          exists(
            db.select()
              .from(courseClass)
              .where(and(
                eq(courseClass.id, template.courseClassId),
                eq(courseClass.semesterId, semesterId)
              ))
          )
        ),
        with: WEEKLY_TEMPLATE_WITH_RELATIONS
      });
    }
    
    return [];
  } catch (error) {
    console.error("Error in getWeeklyTemplateByEntity:", error);
    if (error instanceof Error) throw error;
    throw new Error("Failed to fetch weekly templates");
  }
}
