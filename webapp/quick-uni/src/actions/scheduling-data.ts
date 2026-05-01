"use server";
import { db } from "../db";
import { weeklyTemplate } from "../db/schemas/schedule";
import { courseClass } from "../db/schemas/course";
import { semester } from "../db/schemas/academic";
import { eq, and, ne } from "drizzle-orm";
import { createMask, hasCollision } from "@/lib/scheduling/bitmask";

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

export async function validateWeeklyTemplateEdit(params: {
  id?: string;
  courseClassId: string;
  roomId: number;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
}) {
  const newMask = createMask(params.startPeriod, params.endPeriod);

  // 1. Check for Room collisions in weeklyTemplate
  const roomConflicts = await db.query.weeklyTemplate.findMany({
    where: (template, { and, eq, ne }) => and(
      eq(template.roomId, params.roomId),
      eq(template.dayOfWeek, params.dayOfWeek),
      params.id ? ne(template.id, params.id) : undefined
    )
  });

  for (const conflict of roomConflicts) {
    if (hasCollision(newMask, conflict.occupyMask)) {
      return { valid: false, reason: "Room is already occupied in this time slot" };
    }
  }

  // 2. Check for Teacher collisions
  // First, find the teacher for the courseClass we are trying to assign
  const targetClass = await db.query.courseClass.findFirst({
    where: (cc, { eq }) => eq(cc.id, params.courseClassId)
  });

  if (!targetClass) {
    return { valid: false, reason: "Invalid course class" };
  }

  const teacherId = targetClass.teacherId;

  // Find all weekly templates for this teacher
  const teacherConflicts = await db.query.weeklyTemplate.findMany({
    where: (template, { and, eq, ne, exists }) => and(
      eq(template.dayOfWeek, params.dayOfWeek),
      params.id ? ne(template.id, params.id) : undefined,
      exists(
        db.select()
          .from(courseClass)
          .where(and(
            eq(courseClass.id, template.courseClassId),
            eq(courseClass.teacherId, teacherId)
          ))
      )
    )
  });

  for (const conflict of teacherConflicts) {
    if (hasCollision(newMask, conflict.occupyMask)) {
      return { valid: false, reason: "Teacher is already busy in this time slot" };
    }
  }

  // 3. Check for Class collisions (a class cannot be in two places at once)
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

export async function getWeeklyTemplateByEntity(entityId: string, type: 'room' | 'teacher' | 'class') {
  try {
    if (type === 'room') {
      const roomId = parseInt(entityId);
      if (isNaN(roomId)) {
        throw new Error("Invalid room ID");
      }
      return await db.query.weeklyTemplate.findMany({
        where: (template, { eq }) => eq(template.roomId, roomId),
        with: WEEKLY_TEMPLATE_WITH_RELATIONS
      });
    }
    
    if (type === 'teacher') {
      // Filter templates where the course class is taught by this teacher
      return await db.query.weeklyTemplate.findMany({
        where: (template, { exists, and, eq }) => exists(
          db.select()
            .from(courseClass)
            .where(and(
              eq(courseClass.id, template.courseClassId),
              eq(courseClass.teacherId, entityId)
            ))
        ),
        with: WEEKLY_TEMPLATE_WITH_RELATIONS
      });
    }
    
    if (type === 'class') {
      return await db.query.weeklyTemplate.findMany({
        where: (template, { eq }) => eq(template.courseClassId, entityId),
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
