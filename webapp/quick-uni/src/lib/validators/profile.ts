import { insertProfile } from "@/db/schema";
import { z } from "zod";

export const createProfileSchema = insertProfile.extend({
  dob: z.string().or(z.date()),
  schemaId: z.number(),
}).omit({
  id: true,
  accountId: true,
  createAt: true,
  updateAt: true,
  deletedAt: true,
});

export const updateProfileSchema = insertProfile.pick({
  fullname: true,
  gender: true,
  dob: true,
  address: true,
  countryCode: true,
  nationalId: true,
  ethnic: true,
  religious: true,
  dynamicData: true,
}).partial();