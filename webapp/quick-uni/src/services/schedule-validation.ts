import { db } from '../db';
import { schedule } from '../db/schemas/schedule';
import { eq, and, ne, isNull } from 'drizzle-orm';
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
  if (params.teacherId) {
    const teacherSchedules = await db.query.schedule.findMany({
      where: and(
        eq(schedule.conductorId, params.teacherId),
        eq(schedule.schDate, params.schDate),
        isNull(schedule.deletedAt),
        params.scheduleId ? ne(schedule.id, params.scheduleId) : undefined
      )
    });

    for (const s of teacherSchedules) {
      if (s.period && s.endPeriod) {
        const existingMask = createMask(s.period, s.endPeriod);
        if (hasCollision(newMask, existingMask)) {
          return { valid: false, reason: 'Giảng viên đã có lịch dạy trong khung giờ này.' };
        }
      }
    }
  }

  // 2. Check for room collisions
  if (params.roomId) {
    const roomSchedules = await db.query.schedule.findMany({
      where: and(
        eq(schedule.roomId, params.roomId),
        eq(schedule.schDate, params.schDate),
        isNull(schedule.deletedAt),
        params.scheduleId ? ne(schedule.id, params.scheduleId) : undefined
      )
    });

    for (const s of roomSchedules) {
      if (s.period && s.endPeriod) {
        const existingMask = createMask(s.period, s.endPeriod);
        if (hasCollision(newMask, existingMask)) {
          return { valid: false, reason: 'Phòng học đã được sử dụng trong khung giờ này.' };
        }
      }
    }
  }

  return { valid: true };
}

