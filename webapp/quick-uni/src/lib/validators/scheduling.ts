import { z } from "zod";

export const weeklyTemplateValidator = z.object({
  id: z.string().uuid().optional(),
  courseClassId: z.string().uuid({ message: "Course class is required" }),
  roomId: z.coerce.number().min(1, { message: "Room is required" }),
  dayOfWeek: z.coerce.number().min(0).max(6),
  startPeriod: z.coerce.number().min(1).max(15),
  endPeriod: z.coerce.number().min(1).max(15),
}).refine(data => data.startPeriod <= data.endPeriod, {
  message: "Start period must be less than or equal to end period",
  path: ["endPeriod"]
});

export type WeeklyTemplateInput = z.infer<typeof weeklyTemplateValidator>;

export const holidayValidator = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Holiday name is required" }).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid start date format (YYYY-MM-DD)" }),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid end date format (YYYY-MM-DD)" }),
  semesterId: z.coerce.number().optional(),
  isGlobal: z.boolean().optional().default(false),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "Start date must be before or equal to end date",
  path: ["endDate"]
});

export type HolidayInput = z.infer<typeof holidayValidator>;

