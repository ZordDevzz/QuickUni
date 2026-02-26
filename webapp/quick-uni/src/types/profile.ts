import { z } from "zod";
import { selectProfile } from "@/db/schemas/user";
import { selectAccountSchema } from "@/db/schemas/auth";

export const ProfileBaseSchema = selectProfile;
export const AccountBaseSchema = selectAccountSchema;

export type Profile = z.infer<typeof ProfileBaseSchema>;
export type Account = z.infer<typeof AccountBaseSchema>;

/**
 * Profile type with the joined account information.
 * We redefine the type rather than using z.infer directly on the joined query 
 * to handle the Json/unknown mismatch for dynamicData.
 */
export interface ProfileWithAccount extends Omit<Profile, 'dynamicData'> {
  dynamicData: unknown; // Safe replacement for any
  account: Account | null;
}
