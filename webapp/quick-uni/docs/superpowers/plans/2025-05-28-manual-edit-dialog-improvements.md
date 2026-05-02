# Manual Edit Dialog Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Drizzle syntax errors, resolve type mismatches in scheduling actions, and add missing translations for the scheduling dialog.

**Architecture:** Update Drizzle queries to use callback-provided functions for safety and consistency. Refine action parameter types to reflect calculated fields. Add localization keys to internationalization files.

**Tech Stack:** Next.js, Drizzle ORM, next-intl.

---

### Task 1: Fix Drizzle Syntax and Types in scheduling-data.ts

**Files:**
- Modify: `src/actions/scheduling-data.ts`

- [ ] **Step 1: Update imports and fix type mismatch in `upsertWeeklyTemplate`**

```typescript
// src/actions/scheduling-data.ts

// ... existing imports

export async function upsertWeeklyTemplate(data: Omit<typeof weeklyTemplate.$inferInsert, 'occupyMask'>) {
  try {
    const mask = createMask(data.startPeriod, data.endPeriod);
    const finalData = { ...data, occupyMask: mask } as typeof weeklyTemplate.$inferInsert;
    // ...
```

- [ ] **Step 2: Fix Drizzle syntax in `validateWeeklyTemplateEdit`**

```typescript
// src/actions/scheduling-data.ts

export async function validateWeeklyTemplateEdit(params: {
  id?: string;
  courseClassId: string;
  roomId: number;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
}) {
  const newMask = createMask(params.startPeriod, params.endPeriod);

  // 1. Check for Room collisions in weeklyTemplate
  const roomConflicts = await db.query.weeklyTemplate.findMany({
    where: (template, { and, eq, ne }) => and(
      eq(template.roomId, params.roomId),
      eq(template.dayOfWeek, params.dayOfWeek),
      params.id ? ne(template.id, params.id) : undefined
    )
  });

  // ...

  // Find all weekly templates for this teacher
  const teacherConflicts = await db.query.weeklyTemplate.findMany({
    where: (template, { and, eq, ne, exists }) => and(
      eq(template.dayOfWeek, params.dayOfWeek),
      params.id ? ne(template.id, params.id) : undefined,
      exists(
        db.select()
          .from(courseClass)
          .where(and(
            eq(courseClass.id, template.courseClassId),
            eq(courseClass.teacherId, teacherId)
          ))
      )
    )
  });

  // ...

  // 3. Check for Class collisions
  const classConflicts = await db.query.weeklyTemplate.findMany({
    where: (template, { and, eq, ne }) => and(
      eq(template.courseClassId, params.courseClassId),
      eq(template.dayOfWeek, params.dayOfWeek),
      params.id ? ne(template.id, params.id) : undefined
    )
  });

  return { valid: true };
}
```

- [ ] **Step 3: Fix Drizzle syntax in `getWeeklyTemplateByEntity`**

```typescript
// src/actions/scheduling-data.ts

export async function getWeeklyTemplateByEntity(entityId: string, type: 'room' | 'teacher' | 'class') {
  try {
    if (type === 'room') {
      const roomId = parseInt(entityId);
      if (isNaN(roomId)) {
        throw new Error("Invalid room ID");
      }
      return await db.query.weeklyTemplate.findMany({
        where: (template, { eq }) => eq(template.roomId, roomId),
        with: WEEKLY_TEMPLATE_WITH_RELATIONS
      });
    }
    
    if (type === 'teacher') {
      return await db.query.weeklyTemplate.findMany({
        where: (template, { exists, and, eq }) => exists(
          db.select()
            .from(courseClass)
            .where(and(
              eq(courseClass.id, template.courseClassId),
              eq(courseClass.teacherId, entityId)
            ))
        ),
        with: WEEKLY_TEMPLATE_WITH_RELATIONS
      });
    }
    
    if (type === 'class') {
      return await db.query.weeklyTemplate.findMany({
        where: (template, { eq }) => eq(template.courseClassId, entityId),
        with: WEEKLY_TEMPLATE_WITH_RELATIONS
      });
    }
    
    return [];
  } catch (error) {
    // ...
  }
}
```

- [ ] **Step 4: Fix Drizzle syntax in `getCourseClasses` and `getCurrentSemester`**

```typescript
// src/actions/scheduling-data.ts

export async function getCourseClasses(semesterId: number) {
  try {
    return await db.query.courseClass.findMany({
      where: (cc, { eq }) => eq(cc.semesterId, semesterId),
      // ...
    });
  } catch (error) {
    // ...
  }
}

export async function getCurrentSemester() {
  try {
    const semesterData = await db.query.semester.findFirst({
      where: (s, { eq }) => eq(s.isCurrent, true)
    });
    return semesterData;
  } catch (error) {
    // ...
  }
}
```

- [ ] **Step 5: Verify compilation**

Run: `npm run build` (or `npx tsc`)

- [ ] **Step 6: Commit**

```bash
git add src/actions/scheduling-data.ts
git commit -m "fix(scheduling): fix drizzle syntax and type mismatch in actions"
```

---

### Task 2: Add missing translations for Scheduling Dialog

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/vi.json`

- [ ] **Step 1: Add Schedule translations to `messages/en.json`**

```json
  "Schedule": {
    "AddSchedule": "Add Schedule",
    "EditSchedule": "Edit Schedule",
    "CourseClass": "Course Class",
    "Room": "Room",
    "Teacher": "Teacher",
    "DayOfWeek": "Day of Week",
    "StartPeriod": "Start Period",
    "EndPeriod": "End Period",
    "Delete": "Delete",
    "Save": "Save",
    "Cancelling": "Cancel",
    "Validating": "Validating...",
    "Saving": "Saving...",
    "ConflictDetected": "Conflict Detected",
    "Occupied": "Occupied"
  }
```

- [ ] **Step 2: Add Schedule translations to `messages/vi.json`**

```json
  "Schedule": {
    "AddSchedule": "Thêm lịch học",
    "EditSchedule": "Sửa lịch học",
    "CourseClass": "Lớp học phần",
    "Room": "Phòng học",
    "Teacher": "Giảng viên",
    "DayOfWeek": "Thứ",
    "StartPeriod": "Tiết bắt đầu",
    "EndPeriod": "Tiết kết thúc",
    "Delete": "Xóa",
    "Save": "Lưu",
    "Cancelling": "Hủy",
    "Validating": "Đang kiểm tra...",
    "Saving": "Đang lưu...",
    "ConflictDetected": "Phát hiện xung đột",
    "Occupied": "Đã có lịch"
  }
```

- [ ] **Step 3: Commit**

```bash
git add messages/en.json messages/vi.json
git commit -m "feat(i18n): add translations for scheduling dialog"
```
