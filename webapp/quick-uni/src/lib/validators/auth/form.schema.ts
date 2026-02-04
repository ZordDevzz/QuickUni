import * as z from "zod";
import { insertAccountSchema } from "@/db/schemas/auth";

export const loginFormSchema = z.object({
  // Inherit 'username' validation from DB schema (e.g. max length) and add 'required' check
  username: insertAccountSchema.shape.username.min(1, "username_required"),
  password: z.string().min(1, "password_required"),
});

export type LoginForm = z.infer<typeof loginFormSchema>;
