"use server";

import { db } from "@/db";
import { schedule, weeklyTemplate, room, availability } from "@/db/schemas/schedule";
import { courseClass, enrollment } from "@/db/schemas/course";
import { subject } from "@/db/schemas/academic";
import { profile, employee, student } from "@/db/schemas/user";
import { and, eq, ne, between, isNull, exists } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { validateManualEdit } from "@/services/schedule-validation";
import { createMask, hasCollision } from "@/lib/scheduling/bitmask";
import { findEmptySlots } from "@/lib/scheduling/slot-finder";
import { getAvailability } from "./scheduling-data";

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

export async function relocateClassAutomaticallyAction(params: {
  scheduleId: number; // The ID of the conflicting schedule entry
  schDate: string;   // YYYY-MM-DD
}) {
  try {
    // 1. Fetch conflicting schedule entry
    const entry = await db.query.schedule.findFirst({
      where: eq(schedule.id, params.scheduleId),
      with: {
        courseClass: true
      }
    });

    if (!entry) {
      return { success: false, error: "Lịch học xung đột không tồn tại." };
    }

    const duration = (entry.endPeriod ?? entry.period) - entry.period + 1;
    const teacherId = entry.conductorId;
    if (!teacherId) {
      return { success: false, error: "Không tìm thấy giảng viên cho lớp học này." };
    }

    // 2. Fetch all rooms
    const allRooms = await db.query.room.findMany({
      where: eq(room.isAvailable, true),
      with: { building: true }
    });

    // 3. Fetch all active schedules on this specific date (excluding the current one)
    const daySchedules = await db.query.schedule.findMany({
      where: and(
        eq(schedule.schDate, params.schDate),
        isNull(schedule.deletedAt),
        ne(schedule.id, params.scheduleId)
      )
    });

    // 4. Fetch availability (busy blocks) for the teacher on this day of the week
    const dateObj = new Date(params.schDate);
    const teacherAvail = await db.query.availability.findMany({
      where: and(
        eq(availability.entityId, teacherId),
        eq(availability.entityType, "teacher")
      )
    });

    // Compute teacher's busy mask on this day
    let teacherBusyMask = 0;
    teacherAvail.forEach(a => {
      const dbDayOfWeek = dateObj.getDay(); // 0 (Sun) - 6 (Sat)
      if (a.dayOfWeek === dbDayOfWeek || a.schDate === params.schDate) {
        teacherBusyMask |= a.occupiedMask;
      }
    });

    // Add occupied periods from other schedules of the teacher on this date
    daySchedules
      .filter(s => s.conductorId === teacherId)
      .forEach(s => {
        const start = s.period;
        const end = s.endPeriod ?? s.period;
        teacherBusyMask |= createMask(start, end);
      });

    // 5. Search for a valid slot: prioritize morning (1-5), then afternoon (6-10)
    const candidateStarts = findEmptySlots(teacherBusyMask, duration);

    for (const start of candidateStarts) {
      const end = start + duration - 1;
      if (end > 10) continue;

      const blockMask = createMask(start, end);

      // Now find a room that is free during this block
      for (const r of allRooms) {
        let roomBusyMask = 0;

        // Add occupied periods from other schedules in this room on this date
        daySchedules
          .filter(s => s.roomId === r.id)
          .forEach(s => {
            const sStart = s.period;
            const sEnd = s.endPeriod ?? s.period;
            roomBusyMask |= createMask(sStart, sEnd);
          });

        // Add availability blocks of the room on this date
        const roomAvail = await db.query.availability.findMany({
          where: and(
            eq(availability.entityId, r.id.toString()),
            eq(availability.entityType, "room")
          )
        });
        roomAvail.forEach(a => {
          const dbDayOfWeek = dateObj.getDay();
          if (a.dayOfWeek === dbDayOfWeek || a.schDate === params.schDate) {
            roomBusyMask |= a.occupiedMask;
          }
        });

        if ((roomBusyMask & blockMask) === 0) {
          // Success! Found a free room and free slot
          let subjName = "";
          if (entry.courseClass?.subjectId) {
            const foundSubj = await db.query.subject.findFirst({ where: eq(subject.id, entry.courseClass.subjectId) });
            if (foundSubj) subjName = foundSubj.name || "";
          }
          return {
            success: true,
            suggestion: {
              scheduleId: params.scheduleId,
              classCode: entry.courseClass?.code,
              subjectName: subjName,
              roomId: r.id,
              roomCode: r.code,
              schDate: params.schDate,
              startPeriod: start,
              endPeriod: end
            }
          };
        }
      }
    }

    return { success: false, error: "Không tìm thấy phương án thay thế khả dụng nào khác trong ngày này." };
  } catch (error) {
    console.error("Error in relocateClassAutomaticallyAction:", error);
    return { success: false, error: "Lỗi trong quá trình tìm vị trí thay thế tự động." };
  }
}

export async function approveRelocationAction(params: {
  scheduleId: number;
  roomId: number;
  schDate: string;
  startPeriod: number;
  endPeriod: number;
}) {
  try {
    const entry = await db.query.schedule.findFirst({
      where: eq(schedule.id, params.scheduleId)
    });
    if (!entry) {
      return { success: false, error: "Lịch học không tồn tại." };
    }

    await db.update(schedule)
      .set({
        roomId: params.roomId,
        schDate: params.schDate,
        period: params.startPeriod,
        endPeriod: params.endPeriod,
        updateAt: new Date().toISOString()
      })
      .where(eq(schedule.id, params.scheduleId));

    revalidatePath("/admin/schedule");
    return { success: true };
  } catch (error) {
    console.error("Error in approveRelocationAction:", error);
    return { success: false, error: "Không thể di dời lịch học." };
  }
}

export async function getOccupiedRoomsAction(params: {
  viewMode: 'template' | 'actual';
  schDate?: string;
  dayOfWeek?: number;
  startPeriod: number;
  endPeriod: number;
  semesterId: number | null;
  excludeScheduleId?: string;
}) {
  try {
    const occupiedRoomIds: number[] = [];
    const newMask = createMask(params.startPeriod, params.endPeriod);

    if (params.viewMode === 'actual' && params.schDate) {
      const conditions = [
        eq(schedule.schDate, params.schDate),
        isNull(schedule.deletedAt),
      ];
      if (params.excludeScheduleId) {
        const numId = parseInt(params.excludeScheduleId);
        if (!isNaN(numId)) {
          conditions.push(ne(schedule.id, numId));
        }
      }

      const roomSchedules = await db.query.schedule.findMany({
        where: and(...conditions)
      });

      for (const s of roomSchedules) {
        if (s.roomId && s.period && s.endPeriod) {
          const existingMask = createMask(s.period, s.endPeriod);
          if (hasCollision(newMask, existingMask)) {
            occupiedRoomIds.push(s.roomId);
          }
        }
      }
    } else if (params.viewMode === 'template' && params.semesterId && params.dayOfWeek !== undefined) {
      const conditions = [
        eq(weeklyTemplate.dayOfWeek, params.dayOfWeek),
      ];
      if (params.excludeScheduleId) {
        conditions.push(ne(weeklyTemplate.id, params.excludeScheduleId));
      }

      const templates = await db.query.weeklyTemplate.findMany({
        where: and(...conditions),
        with: {
          courseClass: true
        }
      });

      for (const t of templates) {
        if (t.roomId && t.courseClass?.semesterId === params.semesterId) {
          if (hasCollision(newMask, t.occupyMask)) {
            occupiedRoomIds.push(t.roomId);
          }
        }
      }
    }

    return { success: true, occupiedRoomIds: Array.from(new Set(occupiedRoomIds)) };
  } catch (error) {
    console.error("Error in getOccupiedRoomsAction:", error);
    return { success: false, occupiedRoomIds: [] };
  }
}

export async function getActualScheduleByStudent(
  studentId: string,
  semesterId: number,
  startDateStr: string, // YYYY-MM-DD
  endDateStr: string    // YYYY-MM-DD
) {
  try {
    const data = await db.query.schedule.findMany({
      where: (sch, { and, eq, exists, isNull, between }) => and(
        between(sch.schDate, startDateStr, endDateStr),
        isNull(sch.deletedAt),
        exists(
          db.select()
            .from(enrollment)
            .where(and(
              eq(enrollment.courseClassId, sch.courseClassId),
              eq(enrollment.studentId, studentId),
              exists(
                db.select()
                  .from(courseClass)
                  .where(and(
                    eq(courseClass.id, sch.courseClassId),
                    eq(courseClass.semesterId, semesterId)
                  ))
              )
            ))
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
        },
        room: {
          with: {
            building: true
          }
        }
      }
    });

    return data.map(item => ({
      id: item.id.toString(),
      courseClassId: item.courseClassId,
      roomId: item.roomId ?? 0,
      dayOfWeek: new Date(item.schDate).getDay(), // 0 (Sun) - 6 (Sat)
      startPeriod: item.period,
      endPeriod: item.endPeriod ?? item.period,
      occupyMask: 0,
      scheduleTypeId: item.type,
      courseClass: item.courseClass,
      room: item.room,
      schDate: item.schDate,
      startTime: item.startTime,
      endTime: item.endTime,
    }));
  } catch (error) {
    console.error("Error in getActualScheduleByStudent:", error);
    throw new Error("Failed to fetch actual schedule for student");
  }
}

export async function getActualScheduleByRole(
  role: string,
  accountId: string,
  semesterId: number | null,
  startDateStr: string,
  endDateStr: string
) {
  if (!semesterId) return { assignments: [], availability: [] };

  try {
    if (role === 'teacher') {
      const emp = await db.query.employee.findFirst({
        where: (emp, { exists }) => exists(
          db.select()
            .from(profile)
            .where(and(
              eq(profile.id, emp.profileId),
              eq(profile.accountId, accountId)
            ))
        )
      });

      if (emp) {
        const [assignments, availData] = await Promise.all([
          getActualScheduleByEntity(emp.id, 'teacher', startDateStr, endDateStr),
          getAvailability(emp.id, 'teacher', startDateStr, endDateStr)
        ]);
        return { assignments, availability: availData };
      }
    }

    if (role === 'student') {
      const stu = await db.query.student.findFirst({
        where: (stu, { exists }) => exists(
          db.select()
            .from(profile)
            .where(and(
              eq(profile.id, stu.profileId),
              eq(profile.accountId, accountId)
            ))
        )
      });

      if (stu) {
        const assignments = await getActualScheduleByStudent(stu.id, semesterId, startDateStr, endDateStr);
        return { assignments, availability: [] };
      }
    }

    return { assignments: [], availability: [] };
  } catch (error) {
    console.error("Error in getActualScheduleByRole:", error);
    throw new Error("Failed to fetch actual schedule by role");
  }
}



