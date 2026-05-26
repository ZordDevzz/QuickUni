import { z } from "zod";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { building, room } from "../../db/schema";

// Building Validators
export const buildingInsertSchema = createInsertSchema(building, {
  code: z.string().min(1, "Code is required").max(30, "Code is too long"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  des: z.string().max(512).optional().nullable(),
}).omit({ id: true });

export const buildingUpdateSchema = buildingInsertSchema.partial();

export type BuildingInsertInput = z.infer<typeof buildingInsertSchema>;
export type BuildingUpdateInput = z.infer<typeof buildingUpdateSchema>;

// Room Validators
export const roomInsertSchema = createInsertSchema(room, {
  code: z.string().min(1, "Code is required").max(30, "Code is too long"),
  buildingId: z.coerce.number().min(1, "Building is required"),
  capacity: z.coerce.number().min(1, "Capacity must be greater than 0").optional().nullable(),
  type: z.string().max(50).optional().nullable(),
}).omit({ id: true });

export const roomUpdateSchema = roomInsertSchema.partial();

export type RoomInsertInput = z.infer<typeof roomInsertSchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;
