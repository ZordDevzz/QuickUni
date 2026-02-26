import { insertProfileField } from "@/db/schema";
import { z } from "zod";

export const createProfileFieldValidator = insertProfileField.extend({
  name: z.string().min(1, "Name is required"),
  datatype: z.string().min(1, "Datatype is required"),
  uiSection: z.string().min(1, "UI Section is required"),
  label: z.string().min(1, "Label is required"),
}).omit({
  id: true,
  createAt: true,
  updateAt: true,
});

export const updateProfileFieldValidator = createProfileFieldValidator.partial();

export type CreateProfileFieldInput = z.infer<typeof createProfileFieldValidator>;
export type UpdateProfileFieldInput = z.infer<typeof updateProfileFieldValidator>;
