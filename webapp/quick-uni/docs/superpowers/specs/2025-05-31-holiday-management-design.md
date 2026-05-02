# Design Spec: Holiday Management

**Date:** 2025-05-31
**Status:** Approved

## Goal
Implement a holiday management system to prevent classes from being scheduled on holiday dates during the semester publishing process.

## 1. Database Schema Update
Modify `src/db/schemas/schedule.ts` to update the `holiday_blacklist` table:

```typescript
export const holidayBlacklist = scheduleSchema.table("holiday_blacklist", {
  id: bigserial({ mode: "number" }).primaryKey(),
  name: varchar({ length: 255 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isGlobal: boolean("is_global").default(true),
  semesterId: integer("semester_id"),
}, (table) => [
  foreignKey({
    columns: [table.semesterId],
    foreignColumns: [semester.id],
    name: "fk_holiday_blacklist_semester_id",
  }),
]);
```

## 2. Server Actions
Update `src/actions/scheduling-data.ts`:

- `getHolidays(semesterId?: number)`: Fetches global holidays OR holidays associated with the specific semester.
- `addHoliday(params: { name?: string, startDate: string, endDate: string, isGlobal: boolean, semesterId?: number })`: Adds a new holiday range.
- `deleteHoliday(id: number)`: Deletes a holiday by ID.

## 3. UI Components
- **`src/components/features/academic/HolidayDialog.tsx`**:
    - Dialog for viewing and managing holidays.
    - Table of current holidays.
    - Form to add new holidays with Name, Start Date, End Date, and Scope (Global vs. Semester).
- **`src/components/features/academic/ScheduleManager.tsx`**:
    - Add "Holidays" button to the header.
    - Manage state for opening the dialog.

## 4. Publishing Logic
Update `src/actions/schedule-publish.ts`:
- Modify `publishTemplateToSchedule` to fetch active holidays.
- Update the date loop to skip dates falling within any holiday range.

## 5. Internationalization
Add keys to `messages/vi.json` and `messages/en.json` for all new UI elements.
