import { insertAccountSchema } from "../../db/schema";
import { z } from "zod";

export const createAccountSchema = insertAccountSchema.extend({
  password: z.string().min(6),
}).omit({
  id: true,
  pwdHash: true,
  createAt: true,
  updateAt: true,
  deletedAt: true,
  lastLoginAt: true,
});

export const updateAccountAdminSchema = insertAccountSchema.extend({
  password: z.string().min(6).optional().or(z.literal("")),
}).omit({
  id: true,
  pwdHash: true,
  createAt: true,
  updateAt: true,
  deletedAt: true,
  lastLoginAt: true,
}).partial();

export const updateAccountSchema = insertAccountSchema.pick({
  email: true,
  phone: true,
}).partial();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const profileUpdateSchema = z.object({}).catchall(z.any());

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
