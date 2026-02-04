import { insertAccountSchema } from "@/db/schema";
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
  password: z.string().min(6).optional(),
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
