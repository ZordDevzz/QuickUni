import { z } from "zod";

export const semesterSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(1, "Code is required").max(30),
  name: z.string().min(1, "Name is required").max(255),
  academicYear: z.coerce.number().int().min(2000).max(2100),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  isCurrent: z.boolean().default(false),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type SemesterInput = z.infer<typeof semesterSchema>;
