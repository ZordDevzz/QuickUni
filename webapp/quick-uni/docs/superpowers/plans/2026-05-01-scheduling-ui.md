# Scheduling UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a comprehensive Master Grid UI for managing the scheduling system, featuring tabbed views for Rooms, Teachers, and Course Classes, an interactive 7x15 TimeGrid, and automated scheduling controls.

**Architecture:** 
- **View States:** Client-side state for `activeTab` and `selectedEntityId`.
- **Components:** `TimeGrid` (Render), `EntitySidebar` (Selection), `ScheduleControls` (Actions).
- **Data Flow:** React Server Components for initial load + Client-side fetching/Server Actions for interactivity.

**Tech Stack:** Next.js, Shadcn/UI, Tailwind CSS, Lucide React, Next-intl.

---

### Task 1: API Actions for Entity Data

**Files:**
- Create: `src/actions/scheduling-data.ts`

- [ ] **Step 1: Implement fetchers for Rooms, Teachers, and Course Classes**

```typescript
// src/actions/scheduling-data.ts
"use server";
import { db } from "@/db";
import { room, weeklyTemplate } from "@/db/schemas/schedule";
import { employee } from "@/db/schemas/user";
import { courseClass } from "@/db/schemas/course";
import { eq } from "drizzle-orm";

export async function getRooms() {
  return await db.query.room.findMany();
}

export async function getTeachers() {
  // Simple fetch from employee for now
  return await db.query.employee.findMany({
    with: { profile: true }
  });
}

export async function getCourseClasses(semesterId: number) {
  return await db.query.courseClass.findMany({
    where: eq(courseClass.semesterId, semesterId),
    with: { subject: true }
  });
}

export async function getWeeklyTemplateByEntity(entityId: string, type: 'room' | 'teacher' | 'class') {
  // Logic to filter template entries by entity type
  // ...
}
```

- [ ] **Step 2: Commit actions**

```bash
git add src/actions/scheduling-data.ts
git commit -m "feat: add server actions for scheduling data retrieval"
```

---

### Task 3: Base Page and Tabs Structure

**Files:**
- Modify: `src/app/[locale]/admin/schedule/page.tsx`
- Create: `src/components/features/academic/ScheduleManager.tsx`

- [ ] **Step 1: Update page to use ScheduleManager**

```typescript
// src/app/[locale]/admin/schedule/page.tsx
import { ScheduleManager } from "@/components/features/academic/ScheduleManager";

export default function SchedulePage() {
  return <ScheduleManager />;
}
```

- [ ] **Step 2: Implement ScheduleManager with Tabs**

```typescript
// src/components/features/academic/ScheduleManager.tsx
"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EntitySidebar } from "./EntitySidebar";
import { TimeGrid } from "./TimeGrid";
import { useState } from "react";

export function ScheduleManager() {
  const [activeTab, setActiveTab] = useState("rooms");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Weekly Template Manager</h1>
        <div className="space-x-2">
            {/* Action Buttons */}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="classes">Course Classes</TabsTrigger>
        </TabsList>
        
        <div className="flex gap-6 mt-6">
          <EntitySidebar type={activeTab} onSelect={setSelectedId} selectedId={selectedId} />
          <div className="flex-1">
            <TimeGrid type={activeTab} entityId={selectedId} />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
```

- [ ] **Step 3: Commit page structure**

```bash
git add src/app/[locale]/admin/schedule/page.tsx src/components/features/academic/ScheduleManager.tsx
git commit -m "ui: implement base layout and tabs for schedule manager"
```

---

### Task 4: TimeGrid Component (7x15)

**Files:**
- Create: `src/components/features/academic/TimeGrid.tsx`

- [ ] **Step 1: Implement the 7x15 grid layout**

```typescript
// src/components/features/academic/TimeGrid.tsx
// Use CSS Grid: grid-cols-8 (Time label + 7 days)
// Use a loop for 15 periods
export function TimeGrid({ type, entityId }: { type: string, entityId: string | null }) {
  if (!entityId) return <div className="text-center p-20 border rounded-lg bg-muted/20">Select an entity to view schedule</div>;
  
  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Grid Headers: Empty | Mon | Tue | ... | Sun */}
      {/* Grid Rows: Period 1 | Cell | Cell | ... */}
    </div>
  );
}
```

- [ ] **Step 2: Implement "Assignment Block" rendering**

Logic to absolute position or span cells based on `startPeriod` and `endPeriod`.

- [ ] **Step 3: Commit TimeGrid**

```bash
git add src/components/features/academic/TimeGrid.tsx
git commit -m "ui: add 7x15 TimeGrid component for scheduling"
```

---

### Task 5: Manual Edit Dialog

**Files:**
- Create: `src/components/features/academic/ScheduleSlotDialog.tsx`

- [ ] **Step 1: Implement Click-to-Edit Dialog**

```typescript
// src/components/features/academic/ScheduleSlotDialog.tsx
// Use Shadcn/UI Dialog + Form
// Inputs: Course Class, Room, Teacher, Periods
// Call validateManualEdit on change/submit
```

- [ ] **Step 2: Integrate Dialog with TimeGrid**

- [ ] **Step 3: Commit Dialog**

```bash
git add src/components/features/academic/ScheduleSlotDialog.tsx
git commit -m "ui: add ScheduleSlotDialog for manual schedule adjustments"
```

---

### Task 6: Scheduling Control Actions

**Files:**
- Modify: `src/components/features/academic/ScheduleManager.tsx`

- [ ] **Step 1: Add Auto-Generate and Publish buttons**

- [ ] **Step 2: Connect to server actions from Task 5 (Scheduler)**

- [ ] **Step 3: Commit controls**

```bash
git add src/components/features/academic/ScheduleManager.tsx
git commit -m "ui: integrate auto-generate and publish controls"
```
