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
