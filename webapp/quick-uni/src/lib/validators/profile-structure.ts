import { z } from "zod";

export const profileSectionValidator = z.object({
  name: z.string().min(1),
  schemaId: z.number(),
  order: z.number(),
});

export const structureBatchUpdateValidator = z.object({
  schemaId: z.number(),
  sections: z.array(z.object({
    id: z.number().optional(), // New sections won't have ID
    name: z.string(),
    order: z.number(),
    fields: z.array(z.object({
      fieldId: z.number(),
      order: z.number(),
      isRequired: z.boolean(),
    })),
  })),
});
