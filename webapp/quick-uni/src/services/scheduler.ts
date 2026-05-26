// src/services/scheduler.ts
import { createMask } from '../lib/scheduling/bitmask';
import { findEmptySlots } from '../lib/scheduling/slot-finder';

export interface ClassRequest {
  id: string;
  teacherId: string;
  periods: number;
  allowEvening?: boolean;
  allowWeekend?: boolean;
  preferredConsecutiveDays?: number;
}

export interface RoomRequest {
  id: number;
}

export interface ScheduleRequest {
  classes: ClassRequest[];
  rooms: RoomRequest[];
  availability: Map<string, number[]>; // entityId -> 7-day masks (teacher, room, subject)
}

const DAYS_IN_WEEK = 7;
const EVENING_MASK = 0x7C00; // Periods 11-15 (bits 10 to 14)

export interface Assignment {
  courseClassId: string;
  roomId: number;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  occupyMask: number;
}

export function solveWeekly(request: ScheduleRequest): Assignment[] | null {
  const assignments: Assignment[] = [];
  
  // 1. Initialize occupancy maps for teachers and rooms (7 days each)
  const teacherOccupancy = new Map<string, number[]>();
  const roomOccupancy = new Map<number, number[]>();
  
  // Initialize with zeros for each entity across 7 days
  request.classes.forEach(c => {
    if (!teacherOccupancy.has(c.teacherId)) {
      teacherOccupancy.set(c.teacherId, (request.availability.get(c.teacherId) || new Array(DAYS_IN_WEEK).fill(0)).slice());
    }
  });
  request.rooms.forEach(r => {
    roomOccupancy.set(r.id, (request.availability.get(r.id.toString()) || new Array(DAYS_IN_WEEK).fill(0)).slice());
  });

  const globalAvailability = request.availability.get('global') || new Array(DAYS_IN_WEEK).fill(0);

  function backtrack(classIndex: number): boolean {
    if (classIndex === sortedClasses.length) return true;

    const currentClass = sortedClasses[classIndex];
    const teacherId = currentClass.teacherId;
    const periods = currentClass.periods;
    const initialTeacherAvail = request.availability.get(teacherId) || new Array(DAYS_IN_WEEK).fill(0);
    
    // Heuristic for consecutive teaching days:
    // Determine which days the teacher is already assigned to teach in this schedule run
    const assignedDays: number[] = [];
    for (let d = 0; d < DAYS_IN_WEEK; d++) {
      if (teacherOccupancy.get(teacherId)![d] !== initialTeacherAvail[d]) {
        assignedDays.push(d);
      }
    }

    // Generate day search order
    const daysToTry = Array.from({ length: DAYS_IN_WEEK }, (_, i) => i);
    daysToTry.sort((dayA, dayB) => {
      // 1. Weekday baseline priority: 1-5 get high priority, 6 and 0 get low priority
      const isAWeekday = dayA >= 1 && dayA <= 5;
      const isBWeekday = dayB >= 1 && dayB <= 5;
      
      let scoreA = isAWeekday ? 10 : 0;
      let scoreB = isBWeekday ? 10 : 0;
      
      // 2. Consecutive teaching days heuristic (personal/teacher preferences)
      if (assignedDays.length > 0 && currentClass.preferredConsecutiveDays && currentClass.preferredConsecutiveDays > 1) {
        const isASame = assignedDays.includes(dayA);
        const isBSame = assignedDays.includes(dayB);
        const isAAdjacent = assignedDays.some(d => Math.abs(d - dayA) === 1);
        const isBAdjacent = assignedDays.some(d => Math.abs(d - dayB) === 1);
        
        scoreA += (isASame ? 3 : 0) + (isAAdjacent ? 2 : 0);
        scoreB += (isBSame ? 3 : 0) + (isBAdjacent ? 2 : 0);
      }
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Descending
      }
      
      // Secondary sort to have Monday (1) to Friday (5) first in order, then Sat (6), Sun (0)
      const order = [1, 2, 3, 4, 5, 6, 0];
      return order.indexOf(dayA) - order.indexOf(dayB);
    });
    
    // Iterate through day options and room options
    for (const day of daysToTry) {
      if ((day === 6 || day === 0) && !currentClass.allowWeekend) {
        continue;
      }
      for (const room of request.rooms) {
        const roomId = room.id;
        
        // Combine all constraints for this specific teacher-room-day combination
        let combinedOccupancy = 
          teacherOccupancy.get(teacherId)![day] | 
          roomOccupancy.get(roomId)![day] | 
          globalAvailability[day];
        
        // Enforce evening block: default to no-evening unless allowEvening is marked
        if (!currentClass.allowEvening) {
          combinedOccupancy |= EVENING_MASK;
        }
        
        const possibleStarts = findEmptySlots(combinedOccupancy, periods).filter(start => {
          const end = start + periods - 1;
          const isMorning = start >= 1 && end <= 5;
          const isAfternoon = start >= 6 && end <= 10;
          const isEvening = start >= 11 && end <= 15;
          return isMorning || isAfternoon || isEvening;
        });
        
        for (const start of possibleStarts) {
          const mask = createMask(start, start + periods - 1);
          
          // Apply assignment
          teacherOccupancy.get(teacherId)![day] |= mask;
          roomOccupancy.get(roomId)![day] |= mask;
          
          assignments.push({
            courseClassId: currentClass.id,
            roomId,
            dayOfWeek: day,
            startPeriod: start,
            endPeriod: start + periods - 1,
            occupyMask: mask
          });

          if (backtrack(classIndex + 1)) return true;
          
          // Backtrack
          assignments.pop();
          teacherOccupancy.get(teacherId)![day] &= ~mask;
          roomOccupancy.get(roomId)![day] &= ~mask;
        }
      }
    }
    return false;
  }

  // Sort classes by periods (longer classes first) as a simple heuristic
  const sortedClasses = [...request.classes].sort((a, b) => b.periods - a.periods);

  if (backtrack(0)) return assignments;
  return null;
}
