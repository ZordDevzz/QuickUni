# Teacher Schedule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a dedicated schedule viewing page for Teachers at `/teacher/schedule`.

**Architecture:** Utilize the existing `getScheduleByRole` server action and `TimeGrid` UI component to maintain consistency with the Student schedule view.

**Tech Stack:** Next.js (App Router), Server Actions, Drizzle ORM, Tailwind CSS (for styling `TimeGrid`).

---

### Task 1: Add Translations
**Files:**
- Modify: `messages/en.json`
- Modify: `messages/vi.json`

- [ ] **Step 1: Add "Teacher.Schedule" namespace to `messages/en.json`**
```json
"Teacher": {
  "Schedule": {
    "Title": "My Schedule",
    "Description": "View your teaching assignments"
  }
}
```

- [ ] **Step 2: Add "Teacher.Schedule" namespace to `messages/vi.json`**
```json
"Teacher": {
  "Schedule": {
    "Title": "Thời khóa biểu",
    "Description": "Xem lịch giảng dạy của bạn"
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add messages/en.json messages/vi.json
git commit -m "feat: add translations for teacher schedule"
```

### Task 2: Create Teacher Schedule Page
**Files:**
- Create: `src/app/[locale]/teacher/schedule/page.tsx`

- [ ] **Step 1: Create `page.tsx` for teacher schedule**

```tsx
import { getAuthSession } from "@/services/auth";
import { getCurrentSemester, getScheduleByRole } from "@/actions/scheduling-data";
import { TimeGrid } from "@/components/features/academic/TimeGrid";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function TeacherSchedulePage() {
  const session = await getAuthSession();
  
  if (!session || session.user.type !== "teacher") {
    redirect("/login");
  }

  const currentSemester = await getCurrentSemester();
  
  if (!currentSemester) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">No active semester found</h1>
      </div>
    );
  }

  const { assignments } = await getScheduleByRole("teacher", session.user.id, currentSemester.id);
  const t = await getTranslations("Teacher.Schedule");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("Title")}</h1>
          <p className="text-muted-foreground">
            {t("Description")} - {currentSemester.name}
          </p>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border shadow-sm p-4">
        <TimeGrid 
          assignments={assignments as any} 
          type="teachers" 
          mode="view"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/[locale]/teacher/schedule/page.tsx
git commit -m "feat: implement teacher schedule page"
```

### Task 3: Update Teacher Navigation (Optional/Menu)
*Note: Since the menu configuration location isn't explicitly defined in the provided file list (likely handled in a shared layout or components), I will add a link to the page directly.*

- [ ] **Step 1: Verify accessibility**
Navigate to `/teacher/schedule` after logging in as a teacher to ensure it displays correctly.

- [ ] **Step 2: Final Verification & Cleanup**
Check logs for any errors related to data fetching.
