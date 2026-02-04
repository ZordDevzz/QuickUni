import { insertProfileSchema } from "@/db/schema";

export const updateProfileSchema = insertProfileSchema.pick({
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
