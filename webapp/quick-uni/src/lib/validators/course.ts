import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { courseClass } from "@/db/schemas/course";

export const courseClassInsertSchema = createInsertSchema(courseClass, {
  code: z.string({ message: "Code is required" }).min(1, "Code is required").max(30, "Code is too long"),
  teacherId: z.string({ message: "Teacher is required" }).uuid("Teacher is required"),
  subjectId: z.string({ message: "Subject is required" }).uuid("Subject is required"),
  cap: z.coerce.number({ message: "Capacity is required" }).min(1, "Capacity must be greater than 0"),
  type: z.coerce.number({ message: "Type is required" }).min(1, "Type is required"),
  semesterId: z.coerce.number({ message: "Semester is required" }).min(1, "Semester is required"),
  status: z.string().default("opened"),
}).omit({ id: true, createAt: true, updateAt: true, deletedAt: true, currentSlot: true });

export const courseClassUpdateSchema = courseClassInsertSchema.partial();

export type CourseClassInsertInput = z.infer<typeof courseClassInsertSchema>;
export type CourseClassUpdateInput = z.infer<typeof courseClassUpdateSchema>;
