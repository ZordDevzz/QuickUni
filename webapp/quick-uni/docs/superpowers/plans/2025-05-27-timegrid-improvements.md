# TimeGrid Component Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve TimeGrid component by fixing day-of-week mapping, ensuring header alignment during horizontal scrolling, and adding missing translations.

**Architecture:** 
- Map database Sunday-start (0) to UI Monday-start (0) using `(day + 6) % 7`.
- Wrap both header and content in a single horizontally scrollable container to maintain alignment.
- Use `next-intl` for localized day names and period labels.

**Tech Stack:** Next.js, Tailwind CSS, Lucide React, next-intl.

---

### Task 1: Update Localization Messages

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/vi.json`

- [ ] **Step 1: Add translations to `messages/en.json`**

Update the `Admin` section:
```json
    "Period": "Period",
    "Mon": "Mon",
    "Tue": "Tue",
    "Wed": "Wed",
    "Thu": "Thu",
    "Fri": "Fri",
    "Sat": "Sat",
    "Sun": "Sun",
    "SelectEntityToView": "Select an entity to view schedule"
```

- [ ] **Step 2: Add translations to `messages/vi.json`**

Update the `Admin` section:
```json
    "Period": "Tiết",
    "Mon": "Thứ 2",
    "Tue": "Thứ 3",
    "Wed": "Thứ 4",
    "Thu": "Thứ 5",
    "Fri": "Thứ 6",
    "Sat": "Thứ 7",
    "Sun": "Chủ Nhật",
    "SelectEntityToView": "Chọn một đối tượng để xem thời khóa biểu"
```

- [ ] **Step 3: Commit translations**

```bash
git add messages/en.json messages/vi.json
git commit -m "i18n: add TimeGrid translations"
```

### Task 2: Refactor TimeGrid for Layout and Day Mapping

**Files:**
- Modify: `src/components/features/academic/TimeGrid.tsx`

- [ ] **Step 1: Apply day mapping and layout fixes**

- Update `dayIndex` mapping: `const dayIndex = (assignment.dayOfWeek + 6) % 7;`
- Restructure the JSX to ensure Header and Content scroll together horizontally but Header stays sticky vertically.
- Ensure `minWidth` is applied to the container of both.

```tsx
<<<<
  return (
    <div className="flex flex-col border rounded-lg bg-background overflow-hidden h-[calc(100vh-250px)] relative">
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {/* Header Row */}
      <div className="grid grid-cols-8 border-b bg-muted/50 sticky top-0 z-30">
        <div className="p-2 border-r text-center text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/50">
          {t("Period") || "Period"}
        </div>
        {DAYS.map((day) => (
          <div key={day} className="p-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-r last:border-r-0">
            {t(day) || day}
          </div>
        ))}
      </div>

      {/* Grid Content */}
      <div className="relative overflow-auto flex-1">
        <div className="grid grid-cols-8 relative" style={{ height: `${PERIODS.length * PERIOD_HEIGHT}px`, minWidth: "800px" }}>
====
  return (
    <div className="flex flex-col border rounded-lg bg-background overflow-hidden h-[calc(100vh-250px)] relative">
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      <div className="overflow-auto flex-1 relative">
        <div className="min-w-[1000px] relative">
          {/* Header Row - Sticky Top */}
          <div className="grid grid-cols-8 border-b bg-muted/50 sticky top-0 z-30">
            <div className="p-2 border-r text-center text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/50">
              {t("Period")}
            </div>
            {DAYS.map((day) => (
              <div key={day} className="p-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-r last:border-r-0">
                {t(day)}
              </div>
            ))}
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-8 relative" style={{ height: `${PERIODS.length * PERIOD_HEIGHT}px` }}>
>>>>
```

- [ ] **Step 2: Fix Assignment Overlay Positioning**

```tsx
<<<<
          {/* Assignments Overlay */}
          {assignments.map((assignment) => {
            const dayIndex = assignment.dayOfWeek; // Assuming 0 is Mon, 6 is Sun
            const start = assignment.startPeriod;
====
          {/* Assignments Overlay */}
          {assignments.map((assignment) => {
            // Mapping DB Sunday-start (0) to UI Monday-start (Mon=0, Sun=6)
            const dayIndex = (assignment.dayOfWeek + 6) % 7; 
            const start = assignment.startPeriod;
>>>>
```

- [ ] **Step 3: Commit TimeGrid changes**

```bash
git add src/components/features/academic/TimeGrid.tsx
git commit -m "feat: fix TimeGrid day mapping and alignment"
```

### Task 3: Verification

- [ ] **Step 1: Check build**

Run: `npm run build`
Expected: Success

- [ ] **Step 2: Verify translations in dev mode (Manual)**

Since I cannot interact with the UI, I'll rely on the code being correct and following established patterns.
Check if all `t(day)` and `t("Period")` match the keys added to JSON files.

- [ ] **Step 3: Final check of the code**

Review `TimeGrid.tsx` for any potential issues with the new layout.
The sticky `Period` column (left-most) was previously `sticky left-0 z-20`. I should ensure it still works in the new layout.

```tsx
<<<<
              <div 
                className="border-r border-b text-center text-sm font-medium flex items-center justify-center bg-muted/30 sticky left-0 z-20"
                style={{ height: `${PERIOD_HEIGHT}px` }}
              >
====
              <div 
                className="border-r border-b text-center text-sm font-medium flex items-center justify-center bg-muted/30 sticky left-0 z-40"
                style={{ height: `${PERIOD_HEIGHT}px` }}
              >
>>>>
```
Note: Raised `z-40` to be above Header (`z-30`) if they overlap, or at least consistent. Actually Header is `z-30`. The sticky column should be higher if we want it to stay above everything during horizontal scroll.

Wait, if I have `sticky top-0` for the Header and `sticky left-0` for the Period column, the top-left cell should be `z-50`.

```tsx
{/* Top-left cell in Header */}
<div className="p-2 border-r text-center ... sticky left-0 top-0 z-50 bg-muted/50">
  {t("Period")}
</div>
```

I'll update the plan to include this refinement.
