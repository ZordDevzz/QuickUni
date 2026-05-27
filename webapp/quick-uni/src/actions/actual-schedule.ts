"use server";

import { db } from "@/db";
import { schedule, weeklyTemplate } from "@/db/schemas/schedule";
import { courseClass } from "@/db/schemas/course";
import { and, eq, between, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { validateManualEdit } from "@/services/schedule-validation";

export async function getActualScheduleByEntity(
  entityId: string,
  type: "room" | "teacher" | "class",
  startDateStr: string, // YYYY-MM-DD
  endDateStr: string    // YYYY-MM-DD
) {
  try {
    const conditions = [
      between(schedule.schDate, startDateStr, endDateStr),
      isNull(schedule.deletedAt),
    ];

    if (type === "room") {
      const roomId = parseInt(entityId);
      if (isNaN(roomId)) return [];
      conditions.push(eq(schedule.roomId, roomId));
    } else if (type === "teacher") {
      conditions.push(eq(schedule.conductorId, entityId));
    } else if (type === "class") {
      conditions.push(eq(schedule.courseClassId, entityId));
    }

    const data = await db.query.schedule.findMany({
      where: and(...conditions),
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
        room: {
          with: {
            building: true
          }
        }
      }
    });

    // Map fields so it aligns with TimeGrid's AssignmentWithRelations expectations
    return data.map(item => ({
      id: item.id.toString(), // TimeGrid expects string ID
      courseClassId: item.courseClassId,
      roomId: item.roomId ?? 0,
      dayOfWeek: new Date(item.schDate).getDay(), // 0 (Sun) - 6 (Sat)
      startPeriod: item.period,
      endPeriod: item.endPeriod ?? item.period,
      occupyMask: 0, // Placeholder
      scheduleTypeId: item.type,
      courseClass: item.courseClass,
      room: item.room,
      schDate: item.schDate,
      startTime: item.startTime,
      endTime: item.endTime,
    }));
  } catch (error) {
    console.error("Error in getActualScheduleByEntity:", error);
    throw new Error("Failed to fetch actual schedules");
  }
}

export async function upsertActualScheduleAction(data: {
  id?: string;
  courseClassId: string;
  roomId: number;
  schDate: string; // YYYY-MM-DD
  startPeriod: number;
  endPeriod: number;
  scheduleType: number;
}) {
  try {
    // 1. Fetch teacherId for the courseClass
    const cc = await db.query.courseClass.findFirst({
      where: eq(courseClass.id, data.courseClassId),
    });
    if (!cc) {
      return { success: false, error: "Course class not found" };
    }

    // 2. Validate collisions for this specific date
    const validation = await validateManualEdit({
      scheduleId: data.id ? parseInt(data.id) : undefined,
      courseClassId: data.courseClassId,
      teacherId: cc.teacherId,
      roomId: data.roomId,
      schDate: data.schDate,
      startPeriod: data.startPeriod,
      endPeriod: data.endPeriod,
    });

    if (!validation.valid) {
      return { success: false, error: validation.reason || "Collision detected" };
    }

    const payload = {
      type: data.scheduleType,
      courseClassId: data.courseClassId,
      roomId: data.roomId,
      schDate: data.schDate,
      startTime: "07:00:00", // placeholder
      endTime: "11:00:00",   // placeholder
      period: data.startPeriod,
      endPeriod: data.endPeriod,
      conductorId: cc.teacherId,
      statusId: 1, // Bình thường
      updateAt: new Date().toISOString(),
    };

    if (data.id) {
      await db.update(schedule)
        .set(payload)
        .where(eq(schedule.id, parseInt(data.id)));
      revalidatePath("/admin/schedule");
      return { success: true, id: data.id };
    } else {
      const result = await db.insert(schedule).values({
        ...payload,
        createAt: new Date().toISOString(),
      } as any).returning({ id: schedule.id });
      revalidatePath("/admin/schedule");
      return { success: true, id: result[0].id.toString() };
    }
  } catch (error) {
    console.error("Error in upsertActualScheduleAction:", error);
    return { success: false, error: "Failed to save actual schedule session" };
  }
}

export async function deleteActualScheduleAction(id: string) {
  try {
    const numId = parseInt(id);
    if (isNaN(numId)) return { success: false, error: "Invalid schedule ID" };

    await db.update(schedule)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(schedule.id, numId));

    revalidatePath("/admin/schedule");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteActualScheduleAction:", error);
    return { success: false, error: "Failed to delete actual schedule session" };
  }
}
