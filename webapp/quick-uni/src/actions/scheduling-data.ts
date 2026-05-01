"use server";
import { db } from "../db";
import { room, weeklyTemplate } from "../db/schemas/schedule";
import { employee } from "../db/schemas/user";
import { courseClass } from "../db/schemas/course";
import { eq, and } from "drizzle-orm";

export async function getRooms() {
  return await db.query.room.findMany({
    with: {
      building: true
    }
  });
}

export async function getTeachers() {
  return await db.query.employee.findMany({
    with: { 
      profile: true 
    }
  });
}

export async function getCourseClasses(semesterId: number) {
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
}

export async function getWeeklyTemplateByEntity(entityId: string, type: 'room' | 'teacher' | 'class') {
  if (type === 'room') {
    return await db.query.weeklyTemplate.findMany({
      where: eq(weeklyTemplate.roomId, parseInt(entityId)),
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
      with: {
        courseClass: {
          with: {
            subject: true
          }
        },
        room: true
      }
    });
  }
  
  if (type === 'class') {
    return await db.query.weeklyTemplate.findMany({
      where: eq(weeklyTemplate.courseClassId, entityId),
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
        },
        room: true
      }
    });
  }
  
  return [];
}
