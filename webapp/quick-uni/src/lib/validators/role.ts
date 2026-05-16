import { z } from "zod";

export const insertRoleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Role name is required").max(255),
  isDefaultRole: z.boolean().default(false),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(255).optional(),
  isDefaultRole: z.boolean().optional(),
});

export const assignAuthoritiesSchema = z.object({
  roleId: z.number().int().positive(),
  authorityIds: z.array(z.string()),
});

export const assignUserRoleSchema = z.object({
  userId: z.string().uuid(),
  roleIds: z.array(z.number().int().positive()),
});

export type InsertRoleInput = z.infer<typeof insertRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type AssignAuthoritiesInput = z.infer<typeof assignAuthoritiesSchema>;
export type AssignUserRoleInput = z.infer<typeof assignUserRoleSchema>;
