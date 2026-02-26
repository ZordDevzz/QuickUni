import { insertProfileSchema } from "@/db/schema";
import { z } from "zod";

export const createProfileSchemaValidator = insertProfileSchema.extend({
  effectiveDate: z.string().or(z.date()),
  expiredDate: z.string().or(z.date()).optional().nullable(),
}).omit({
  id: true,
  createAt: true,
  updateAt: true,
});

export const updateProfileSchemaValidator = createProfileSchemaValidator.partial();

export type CreateProfileSchemaInput = z.infer<typeof createProfileSchemaValidator>;
export type UpdateProfileSchemaInput = z.infer<typeof updateProfileSchemaValidator>;
