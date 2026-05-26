"use server";
import { solveWeekly } from "@/services/scheduler";
import { getRooms, getTeachers, getCourseClasses } from "./scheduling-data";
import { db } from "@/db";
import { weeklyTemplate } from "@/db/schemas/schedule";
import { courseClass } from "@/db/schemas/course";
import { revalidatePath } from "next/cache";
import { inArray, eq } from "drizzle-orm";

export async function autoGenerateWeeklyAction(semesterId: number) {
  try {
    // 1. Fetch all data needed for the solver
    const rooms = await getRooms();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
    const teachers = await getTeachers();
    const classes = await getCourseClasses(semesterId);
    
    // 2. Fetch base availability (Blacklists)
    const availData = await db.query.availability.findMany();
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

    // 3. Run solveWeekly
    const result = solveWeekly({
      classes: classes.map(c => ({ 
        id: c.id, 
        teacherId: c.teacherId, 
        periods: 2 // default to 2 periods as per task requirement
      })),
      rooms: rooms.map(r => ({ id: r.id })),
      availability: availabilityMap
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
      return { success: true };
    }
    return { success: false, error: "No solution found" };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to generate schedule" };
  }
}
