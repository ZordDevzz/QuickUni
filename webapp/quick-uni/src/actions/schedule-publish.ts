"use server";

import { db } from '../db';
import { weeklyTemplate, schedule, holidayBlacklist } from '../db/schemas/schedule';
import { semester as semesterTable } from '../db/schemas/academic';
import { courseClass } from '../db/schemas/course';
import { eq, and, or, isNull, exists, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { isWithinInterval, parseISO } from 'date-fns';

/**
 * Publishes the weekly template to the actual schedule for a given semester.
 */
export async function publishTemplateToSchedule(semesterId: number) {
  try {
    // 1. Get Semester start/end dates
    const semester = await db.query.semester.findFirst({
      where: eq(semesterTable.id, semesterId)
    });
    if (!semester) throw new Error('Semester not found');

    const startDate = parseISO(semester.startDate);
    const endDate = parseISO(semester.endDate);

    // 2. Get Holiday Blacklist (Global or Semester Specific)
    const holidays = await db.query.holidayBlacklist.findMany({
      where: or(
        eq(holidayBlacklist.isGlobal, true),
        eq(holidayBlacklist.semesterId, semesterId)
      )
    });

    // 3. Get Weekly Template (Scoped to Semester)
    const templates = await db.query.weeklyTemplate.findMany({
      where: (t, { exists }) => exists(
        db.select()
          .from(courseClass)
          .where(and(
            eq(courseClass.id, t.courseClassId),
            eq(courseClass.semesterId, semesterId)
          ))
      )
    });

    // 4. Iterate through each day in semester
    const scheduleEntries = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Check if current date is a holiday
      const isHoliday = holidays.some(h => {
        const hStart = parseISO(h.startDate);
        const hEnd = parseISO(h.endDate);
        return isWithinInterval(currentDate, { start: hStart, end: hEnd });
      });
      
      if (!isHoliday) {
        const dayOfWeek = currentDate.getDay(); // 0 (Sun) - 6 (Sat)
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayTemplates = templates.filter(t => t.dayOfWeek === dayOfWeek);
        
        for (const t of dayTemplates) {
          scheduleEntries.push({
            type: 1, // Default type (lecture/practice)
            courseClassId: t.courseClassId,
            roomId: t.roomId,
            schDate: dateStr,
            startTime: '07:00:00', // Placeholder
            endTime: '11:00:00',   // Placeholder
            period: t.startPeriod,
            endPeriod: t.endPeriod,
            mPerPeriod: 45,
            statusId: 1, // Planned
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 5. Clear old schedule for this semester first
    const semesterClassIds = db.select({ id: courseClass.id }).from(courseClass).where(eq(courseClass.semesterId, semesterId));
    await db.delete(schedule).where(inArray(schedule.courseClassId, semesterClassIds));

    // 6. Batch insert into schedule table
    if (scheduleEntries.length > 0) {
      // Split into chunks if too large (Drizzle/PG limit)
      const chunkSize = 1000;
      for (let i = 0; i < scheduleEntries.length; i += chunkSize) {
        await db.insert(schedule).values(scheduleEntries.slice(i, i + chunkSize));
      }
    }

    revalidatePath("/admin/schedule");
    return { success: true };
  } catch (error) {
    console.error("Error in publishTemplateToSchedule:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to publish schedule" 
    };
  }
}
