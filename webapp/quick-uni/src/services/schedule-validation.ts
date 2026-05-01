import { db } from '../db';
import { schedule } from '../db/schemas/schedule';
import { eq, and, ne } from 'drizzle-orm';
import { hasCollision, createMask } from '../lib/scheduling/bitmask';

export interface ValidationParams {
  scheduleId?: number;
  courseClassId: string;
  teacherId: string;
  roomId: number;
  schDate: string;
  startPeriod: number;
  endPeriod: number;
}

export async function validateManualEdit(params: ValidationParams) {
  const newMask = createMask(params.startPeriod, params.endPeriod);

  // 1. Check for teacher collisions
  const teacherSchedules = await db.query.schedule.findMany({
    where: and(
      eq(schedule.conductorId, params.teacherId),
      eq(schedule.schDate, params.schDate),
      params.scheduleId ? ne(schedule.id, params.scheduleId) : undefined
    )
  });

  for (const s of teacherSchedules) {
    if (s.period && s.endPeriod) {
      const existingMask = createMask(s.period, s.endPeriod);
      if (hasCollision(newMask, existingMask)) {
        return { valid: false, reason: 'Teacher is busy in this time slot' };
      }
    }
  }

  // 2. Check for room collisions
  const roomSchedules = await db.query.schedule.findMany({
    where: and(
      eq(schedule.roomId, params.roomId),
      eq(schedule.schDate, params.schDate),
      params.scheduleId ? ne(schedule.id, params.scheduleId) : undefined
    )
  });

  for (const s of roomSchedules) {
    if (s.period && s.endPeriod) {
      const existingMask = createMask(s.period, s.endPeriod);
      if (hasCollision(newMask, existingMask)) {
        return { valid: false, reason: 'Room is occupied in this time slot' };
      }
    }
  }

  return { valid: true };
}
