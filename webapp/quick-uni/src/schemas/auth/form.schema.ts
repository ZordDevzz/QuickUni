import * as z from "zod";

export const loginFormSchema = z.object({
  username: z.string().min(1, "username_required"),
  password: z.string().min(1, "password_required"),
});

export type LoginForm = z.infer<typeof loginFormSchema>;