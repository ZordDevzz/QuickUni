// src/actions/schedule-publish.ts
import { db } from '../db';
import { weeklyTemplate, schedule, holidayBlacklist } from '../db/schemas/schedule';
import { semester as semesterTable } from '../db/schemas/academic';
import { eq } from 'drizzle-orm';

/**
 * Publishes the weekly template to the actual schedule for a given semester.
 * 
 * @param semesterId - The ID of the semester to publish for.
 */
export async function publishTemplateToSchedule(semesterId: number) {
  // 1. Get Semester start/end dates
  const semester = await db.query.semester.findFirst({
    where: eq(semesterTable.id, semesterId)
  });
  if (!semester) throw new Error('Semester not found');

  const startDate = new Date(semester.startDate);
  const endDate = new Date(semester.endDate);

  // 2. Get Holiday Blacklist
  const holidays = await db.query.holidayBlacklist.findMany();
  const holidayDates = new Set(holidays.map(h => {
    // Ensure date is handled consistently regardless of timezone
    const d = new Date(h.date);
    return d.toISOString().split('T')[0];
  }));

  // 3. Get Weekly Template
  const templates = await db.query.weeklyTemplate.findMany();

  // 4. Iterate through each day in semester
  const scheduleEntries = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    if (!holidayDates.has(dateStr)) {
      const dayOfWeek = currentDate.getUTCDay(); // 0 (Sun) - 6 (Sat)
      
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
          mPerPeriod: 45,
          statusId: 1, // Planned
        });
      }
    }
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  // 5. Batch insert into schedule table
  if (scheduleEntries.length > 0) {
    await db.insert(schedule).values(scheduleEntries);
  }
}
