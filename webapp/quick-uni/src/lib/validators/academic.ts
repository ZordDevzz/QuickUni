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

export const departmentSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, "Code is required").max(30),
  name: z.string().min(1, "Name is required").max(255),
  des: z.string().max(512).optional().nullable(),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;

export const majorSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, "Code is required").max(30),
  departmentId: z.string().uuid("Department is required"),
  des: z.string().max(512).optional().nullable(),
});

export type MajorInput = z.infer<typeof majorSchema>;

export const departmentEmploymentSchema = z.object({
  employeeId: z.string().uuid(),
  departmentId: z.string().uuid(),
  assignDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  unassignDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional().nullable(),
  roleCode: z.string().max(30).optional().nullable(),
  roleName: z.string().max(255).optional().nullable(),
});

export type DepartmentEmploymentInput = z.infer<typeof departmentEmploymentSchema>;
