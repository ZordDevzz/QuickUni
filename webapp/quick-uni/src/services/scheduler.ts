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
  startDate?: string;
  endDate?: string;
  preferredStartPeriod?: number | null;
}

export interface RoomRequest {
  id: number;
}

export interface ScheduleRequest {
  classes: ClassRequest[];
  rooms: RoomRequest[];
  availability: Map<string, number[]>; // entityId -> 7-day masks (teacher, room, subject)
  /** studentId -> list of courseClassIds the student is enrolled in */
  studentGroups?: Map<string, string[]>;
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

interface AssignedSlot {
  mask: number;
  startDate: string;
  endDate: string;
}

export function solveWeekly(request: ScheduleRequest): Assignment[] | null {
  const assignments: Assignment[] = [];
  
  // Initialize tracked assignments maps
  const teacherAssignments = new Map<string, AssignedSlot[][]>();
  const roomAssignments = new Map<number, AssignedSlot[][]>();
  // studentId -> per-day list of assigned slots (to detect student time conflicts)
  const studentAssignments = new Map<string, AssignedSlot[][]>();

  // Pre-build: classId -> list of enrolled studentIds
  const classStudents = new Map<string, string[]>();
  if (request.studentGroups) {
    request.studentGroups.forEach((classIds, studentId) => {
      classIds.forEach(classId => {
        if (!classStudents.has(classId)) classStudents.set(classId, []);
        classStudents.get(classId)!.push(studentId);
        // Ensure each student has a slot tracker
        if (!studentAssignments.has(studentId)) {
          studentAssignments.set(studentId, Array.from({ length: DAYS_IN_WEEK }, () => []));
        }
      });
    });
  }
  
  request.classes.forEach(c => {
    if (!teacherAssignments.has(c.teacherId)) {
      const days: AssignedSlot[][] = Array.from({ length: DAYS_IN_WEEK }, () => []);
      const initAvail = request.availability.get(c.teacherId) || new Array(DAYS_IN_WEEK).fill(0);
      for (let d = 0; d < DAYS_IN_WEEK; d++) {
        if (initAvail[d] !== 0) {
          days[d].push({ mask: initAvail[d], startDate: "0000-00-00", endDate: "9999-99-99" });
        }
      }
      teacherAssignments.set(c.teacherId, days);
    }
  });

  request.rooms.forEach(r => {
    const days: AssignedSlot[][] = Array.from({ length: DAYS_IN_WEEK }, () => []);
    const initAvail = request.availability.get(r.id.toString()) || new Array(DAYS_IN_WEEK).fill(0);
    for (let d = 0; d < DAYS_IN_WEEK; d++) {
      if (initAvail[d] !== 0) {
        days[d].push({ mask: initAvail[d], startDate: "0000-00-00", endDate: "9999-99-99" });
      }
    }
    roomAssignments.set(r.id, days);
  });

  const globalAvailability = request.availability.get('global') || new Array(DAYS_IN_WEEK).fill(0);

  function backtrack(classIndex: number): boolean {
    if (classIndex === sortedClasses.length) return true;

    const currentClass = sortedClasses[classIndex];
    const teacherId = currentClass.teacherId;
    const periods = currentClass.periods;
    
    // Heuristic for consecutive teaching days:
    // Determine which days the teacher is already assigned to teach in this schedule run
    const assignedDays: number[] = [];
    for (let d = 0; d < DAYS_IN_WEEK; d++) {
      const daySlots = teacherAssignments.get(teacherId)![d];
      const hasClassAssigned = daySlots.some(slot => slot.startDate !== "0000-00-00");
      if (hasClassAssigned) {
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
        
        // Combine occupancy for this class's specific date range
        const classStart = currentClass.startDate || "0000-00-00";
        const classEnd = currentClass.endDate || "9999-99-99";
        
        let teacherMaskForClass = 0;
        teacherAssignments.get(teacherId)![day].forEach(slot => {
          if (slot.startDate <= classEnd && classStart <= slot.endDate) {
            teacherMaskForClass |= slot.mask;
          }
        });

        let roomMaskForClass = 0;
        roomAssignments.get(roomId)![day].forEach(slot => {
          if (slot.startDate <= classEnd && classStart <= slot.endDate) {
            roomMaskForClass |= slot.mask;
          }
        });

        // Combine student occupancy: any student enrolled in this class must be free
        let studentMaskForClass = 0;
        const enrolledStudents = classStudents.get(currentClass.id) || [];
        for (const studentId of enrolledStudents) {
          const studentDaySlots = studentAssignments.get(studentId)?.[day] || [];
          for (const slot of studentDaySlots) {
            if (slot.startDate <= classEnd && classStart <= slot.endDate) {
              studentMaskForClass |= slot.mask;
            }
          }
        }

        let combinedOccupancy = 
          teacherMaskForClass | 
          roomMaskForClass | 
          studentMaskForClass |
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

        // Sort possible starts by preferred start period score
        possibleStarts.sort((startA, startB) => {
          const targetStart = currentClass.preferredStartPeriod;
          
          function getPriority(start: number) {
            const end = start + periods - 1;
            const isMorning = start >= 1 && end <= 5;
            const isAfternoon = start >= 6 && end <= 10;
            
            // 1. Manually configured priority
            if (targetStart !== undefined && targetStart !== null && targetStart > 0) {
              if (start === targetStart) return 100;
            } else {
              // 2. Default priorities: period 2 for morning, period 6 for afternoon
              if (isMorning && start === 2) return 90;
              if (isAfternoon && start === 6) return 85;
            }
            
            // 3. Baseline priority
            return 10 - start;
          }
          
          return getPriority(startB) - getPriority(startA); // Descending
        });
        
        for (const start of possibleStarts) {
          const mask = createMask(start, start + periods - 1);
          
          // Apply assignment
          const slotItem = {
            mask,
            startDate: classStart,
            endDate: classEnd
          };
          
          // Enforce room session-level blocking (lock entire morning / afternoon / evening)
          const end = start + periods - 1;
          let roomBlockedMask = mask;
          if (start >= 1 && end <= 5) {
            roomBlockedMask = createMask(1, 5); // Block morning
          } else if (start >= 6 && end <= 10) {
            roomBlockedMask = createMask(6, 10); // Block afternoon
          } else if (start >= 11 && end <= 15) {
            roomBlockedMask = createMask(11, 15); // Block evening
          }

          const roomSlotItem = {
            mask: roomBlockedMask,
            startDate: classStart,
            endDate: classEnd
          };

          teacherAssignments.get(teacherId)![day].push(slotItem);
          roomAssignments.get(roomId)![day].push(roomSlotItem);
          // Mark this slot as occupied for all enrolled students
          for (const studentId of enrolledStudents) {
            studentAssignments.get(studentId)![day].push(slotItem);
          }
          
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
          teacherAssignments.get(teacherId)![day].pop();
          roomAssignments.get(roomId)![day].pop();
          for (const studentId of enrolledStudents) {
            studentAssignments.get(studentId)![day].pop();
          }
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
