# Design Spec: Weekly Template Backtracking Algorithm

## Overview
Implement a backtracking algorithm to generate a conflict-free weekly schedule template based on teacher and room availability, and class requirements.

## Architecture
- **Location:** `src/services/scheduler.ts`
- **Logic Type:** Recursive Backtracking with Heuristic.

## Data Structures
- `ClassRequest`: Represents a class needing to be scheduled (ID, Teacher, Periods).
- `RoomRequest`: Represents an available room.
- `ScheduleRequest`: Input containing classes, rooms, and base availability masks for entities.
- `Assignment`: The result of a successful scheduling step.

## Algorithm Details
1. **Initial Setup:**
   - Deep copy/Initialize occupancy maps for all teachers and rooms from the `availability` map in the request.
   - If an entity (teacher or room) has no entry in `availability`, initialize with `0` (all slots free).
   - Sort `classes` by duration (`periods`) in descending order to optimize the search space.

2. **Recursive Backtracking (`backtrack(classIndex)`):**
   - **Base Case:** If `classIndex == classes.length`, all classes are assigned. Return `true`.
   - **Step:**
     - For each `day` from 0 to 6:
       - For each `room` in `rooms`:
         - Retrieve current occupancy masks for the teacher and the room for that day.
         - Combine them: `combinedMask = teacherMask | roomMask`.
         - Find possible start periods: `starts = findEmptySlots(combinedMask, currentClass.periods)`.
         - For each `start` in `starts`:
           - Create `occupyMask = createMask(start, start + duration - 1)`.
           - **Update State:**
             - `teacherOccupancy[teacherId][day] |= occupyMask`
             - `roomOccupancy[roomId][day] |= occupyMask`
             - Add to `assignments` list.
           - **Recurse:** `if (backtrack(classIndex + 1)) return true`.
           - **Backtrack:**
             - `teacherOccupancy[teacherId][day] &= ~occupyMask`
             - `roomOccupancy[roomId][day] &= ~occupyMask`
             - Remove from `assignments` list.
   - Return `false` if no valid assignment is found for the current class.

## Verification Plan
- **Unit Tests (`src/services/scheduler.test.ts`):**
  - **Success Case:** A simple set of classes that can be scheduled without overlap.
  - **Teacher Conflict:** Ensure two classes for the same teacher are scheduled at different times or in different rooms (if they can't overlap).
  - **Room Conflict:** Ensure two classes are not scheduled in the same room at the same time.
  - **No Solution:** Verify the algorithm returns `null` when a valid schedule is impossible.
  - **Duration Heuristic:** Verify it handles long classes correctly.

## Constraints
- Max 15 periods per day.
- 7 days per week.
- Teacher can only be in one place at a time.
- Room can only hold one class at a time.
