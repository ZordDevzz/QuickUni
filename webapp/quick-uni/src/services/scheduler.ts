// src/services/scheduler.ts
import { createMask } from '../lib/scheduling/bitmask';
import { findEmptySlots } from '../lib/scheduling/slot-finder';

export interface ClassRequest {
  id: string;
  teacherId: string;
  periods: number;
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
    
    // Heuristic: Iterate through days and rooms
    for (let day = 0; day < DAYS_IN_WEEK; day++) {
      for (const room of request.rooms) {
        const roomId = room.id;
        
        // Combine all constraints for this specific teacher-room-day combination
        const combinedOccupancy = 
          teacherOccupancy.get(teacherId)![day] | 
          roomOccupancy.get(roomId)![day] | 
          globalAvailability[day];
        
        const possibleStarts = findEmptySlots(combinedOccupancy, periods);
        
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
