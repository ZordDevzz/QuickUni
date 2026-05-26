# Migrate Academic Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate academic management features from `/admin` to `/academic`.

**Architecture:** Move page directories and update sidebar configuration.

**Tech Stack:** Next.js (App Router), TypeScript.

---

### Task 1: Move Directories

**Files:**
- Move: `src/app/[locale]/admin/academic/*` -> `src/app/[locale]/academic/`
- Move: `src/app/[locale]/admin/courses/*` -> `src/app/[locale]/academic/courses/`
- Move: `src/app/[locale]/admin/schedule/*` -> `src/app/[locale]/academic/schedule/`

- [ ] **Step 1: Execute move commands**

```powershell
# Move academic subdirectories
mv src/app/[locale]/admin/academic/* src/app/[locale]/academic/

# Move courses subdirectories
mkdir -p src/app/[locale]/academic/courses
mv src/app/[locale]/admin/courses/* src/app/[locale]/academic/courses/

# Move schedule directory
mkdir -p src/app/[locale]/academic/schedule
mv src/app/[locale]/admin/schedule/* src/app/[locale]/academic/schedule/

# Clean up empty admin directories
rmdir src/app/[locale]/admin/academic
rmdir src/app/[locale]/admin/courses
rmdir src/app/[locale]/admin/schedule
```

- [ ] **Step 2: Commit moves**

```bash
git add src/app/[locale]/academic/
git add src/app/[locale]/admin/
git commit -m "refactor(routes): move academic files to /academic"
```

### Task 2: Update AdminSidebar

**Files:**
- Modify: `src/components/shared/AdminSidebar.tsx`

- [ ] **Step 1: Remove academic items from AdminSidebar**
Remove "Semesters", "Departments", "Buildings", "Rooms", "CourseClasses", and "Schedule" from `navItems`.

- [ ] **Step 2: Commit sidebar changes**

```bash
git add src/components/shared/AdminSidebar.tsx
git commit -m "refactor(ui): remove academic items from AdminSidebar"
```

### Task 3: Verification

- [ ] **Step 1: Check for broken imports**
Search for any imports in the moved files that might have been broken (though unlikely due to same depth).

- [ ] **Step 2: Check links in Sidebars**
Ensure `AcademicSidebar.tsx` has the correct links (already should if it was designed for `/academic`).
Actually, I should check `src/components/shared/AcademicSidebar.tsx`.
