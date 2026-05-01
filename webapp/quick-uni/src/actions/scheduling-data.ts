"use server";
import { db } from "../db";
import { weeklyTemplate } from "../db/schemas/schedule";
import { courseClass } from "../db/schemas/course";
import { eq, and } from "drizzle-orm";

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
      where: eq(courseClass.semesterId, semesterId),
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

export async function getWeeklyTemplateByEntity(entityId: string, type: 'room' | 'teacher' | 'class') {
  try {
    if (type === 'room') {
      const roomId = parseInt(entityId);
      if (isNaN(roomId)) {
        throw new Error("Invalid room ID");
      }
      return await db.query.weeklyTemplate.findMany({
        where: eq(weeklyTemplate.roomId, roomId),
        with: WEEKLY_TEMPLATE_WITH_RELATIONS
      });
    }
    
    if (type === 'teacher') {
      // Filter templates where the course class is taught by this teacher
      return await db.query.weeklyTemplate.findMany({
        where: (template, { exists }) => exists(
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
        where: eq(weeklyTemplate.courseClassId, entityId),
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
