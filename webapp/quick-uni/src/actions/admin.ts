"use server";

import { revalidatePath } from "next/cache";
import { 
  createAccount, 
  updateAccount, 
  deleteAccount, 
} from "@/services/user";
import { 
  updateProfile, 
} from "@/services/profile";
import { createAccountSchema, updateAccountAdminSchema } from "@/lib/validators/account";
import { updateProfileSchema } from "@/lib/validators/profile";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { z } from "zod";
import { account as accountTable } from "@/db/schemas/auth";
import { profile as profileTable } from "@/db/schemas/user";

type CreateAccountInput = z.infer<typeof createAccountSchema>;
type UpdateAccountInput = z.infer<typeof updateAccountAdminSchema>;
type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Result type for all admin actions
 */
export type ActionResponse = {
  success: boolean;
  error?: string;
};

// Account Actions
export async function createAccountAction(formData: CreateAccountInput): Promise<ActionResponse> {
  try {
    const validatedData = createAccountSchema.parse(formData);
    const hashedPassword = await hash(validatedData.password, 10);
    
    // Transform DTO to DB Insert Type
    const dbData: typeof accountTable.$inferInsert = {
      id: randomUUID(),
      username: validatedData.username,
      email: validatedData.email,
      phone: validatedData.phone,
      type: validatedData.type,
      status: validatedData.status,
      pwdHash: hashedPassword,
    };
    
    await createAccount(dbData);

    revalidatePath("/admin/accounts");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create account" 
    };
  }
}

export async function updateAccountAction(id: string, formData: UpdateAccountInput): Promise<ActionResponse> {
  try {
    const validatedData = updateAccountAdminSchema.parse(formData);
    
    // Map DTO fields to DB Update Type
    const dataToUpdate: Partial<typeof accountTable.$inferInsert> = {};
    
    if (validatedData.username) dataToUpdate.username = validatedData.username;
    if (validatedData.email) dataToUpdate.email = validatedData.email;
    if (validatedData.phone) dataToUpdate.phone = validatedData.phone;
    if (validatedData.type) dataToUpdate.type = validatedData.type;
    if (validatedData.status) dataToUpdate.status = validatedData.status;
    
    if (validatedData.password) {
      dataToUpdate.pwdHash = await hash(validatedData.password, 10);
    }

    await updateAccount(id, dataToUpdate);
    revalidatePath("/admin/accounts");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update account" 
    };
  }
}

export async function deleteAccountAction(id: string): Promise<ActionResponse> {
  try {
    await deleteAccount(id);
    revalidatePath("/admin/accounts");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete account" 
    };
  }
}

// Profile Actions
export async function updateProfileAction(id: string, formData: UpdateProfileInput): Promise<ActionResponse> {
  try {
    const validatedData = updateProfileSchema.parse(formData);
    
    // Map DTO to DB Update Type
    const dataToUpdate: Partial<typeof profileTable.$inferInsert> = {
      ...validatedData,
      // Ensure dynamicData is handled if present (Drizzle jsonb expectation)
      dynamicData: validatedData.dynamicData ?? undefined
    };

    await updateProfile(id, dataToUpdate);
    revalidatePath("/admin/profiles");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update profile" 
    };
  }
}
