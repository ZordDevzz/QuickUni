"use server";
import { solveWeekly } from "@/services/scheduler";
import { getRooms, getTeachers, getCourseClasses } from "./scheduling-data";
import { db } from "@/db";
import { weeklyTemplate } from "@/db/schemas/schedule";
import { courseClass, enrollment } from "@/db/schemas/course";
import { revalidatePath } from "next/cache";
import { inArray, eq } from "drizzle-orm";

export async function autoGenerateWeeklyAction(semesterId: number, teacherPrefs?: Record<string, number>) {
  try {
    // 1. Fetch all data needed for the solver
    const rooms = await getRooms();
    const teachers = await getTeachers();
    const classes = await getCourseClasses(semesterId);
    
    // 2. Fetch base availability (Blacklists)
    const availData = await db.query.availability.findMany({
      where: (a, { isNull }) => isNull(a.schDate)
    });
    const availabilityMap = new Map<string, number[]>();
    
    // Initialize map
    availData.forEach(avail => {
      const key = avail.entityId;
      if (!availabilityMap.has(key)) {
        availabilityMap.set(key, new Array(7).fill(0));
      }
      const dayMasks = availabilityMap.get(key)!;
      dayMasks[avail.dayOfWeek] = avail.occupiedMask;
    });

    // 3. Fetch enrollments to build student conflict groups
    const classIds = classes.map(c => c.id);
    const enrollments = classIds.length > 0
      ? await db.query.enrollment.findMany({
          where: (e, { and, inArray, isNull }) => and(
            inArray(e.courseClassId, classIds),
            isNull(e.deletedAt)
          )
        })
      : [];

    // studentId -> [courseClassId, ...]
    const studentGroups = new Map<string, string[]>();
    enrollments.forEach(e => {
      if (!studentGroups.has(e.studentId)) studentGroups.set(e.studentId, []);
      studentGroups.get(e.studentId)!.push(e.courseClassId);
    });

    // 4. Run solveWeekly
    const result = solveWeekly({
      classes: classes.map(c => ({ 
        id: c.id, 
        teacherId: c.teacherId, 
        periods: c.minSessionPeriods || 4, // custom period duration
        allowEvening: c.allowEvening, // allow evening flag
        allowWeekend: c.allowWeekend, // allow weekend flag
        preferredConsecutiveDays: teacherPrefs?.[c.teacherId] ?? 2, // state-only consecutive teaching days preference
        startDate: c.startDate || undefined,
        endDate: c.endDate || undefined,
        preferredStartPeriod: c.preferredStartPeriod,
      })),
      rooms: rooms.filter(r => r.isAvailable).map(r => ({ id: r.id })), // only available rooms
      availability: availabilityMap,
      studentGroups,
    });

    if (result) {
      // 4. Save to weeklyTemplate table (clear old first for this semester)
      await db.transaction(async (tx) => {
        await tx.delete(weeklyTemplate).where(
          inArray(
            weeklyTemplate.courseClassId,
            db.select({ id: courseClass.id }).from(courseClass).where(eq(courseClass.semesterId, semesterId))
          )
        );
        
        if (result.length > 0) {
          await tx.insert(weeklyTemplate).values(result);
        }
      });
      
      revalidatePath("/admin/schedule");
      revalidatePath("/[locale]/academic/schedule", "page");
      return { success: true };
    }
    return { success: false, error: "No solution found" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate schedule" };
  }
}
