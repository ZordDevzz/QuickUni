"use server";

import { getAuthSession } from "@/services/auth";
import { db } from "@/db";
import { account, profile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { 
  changePasswordSchema, 
  ChangePasswordInput, 
  profileUpdateSchema, 
  ProfileUpdateInput 
} from "@/lib/validators/account";
import { revalidatePath } from "next/cache";

/**
 * Updates the user's password after verifying the current one.
 */
export async function changePasswordAction(data: ChangePasswordInput) {
  const session = await getAuthSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const validated = changePasswordSchema.parse(data);
    const user = await db.query.account.findFirst({
      where: eq(account.id, session.user.id),
    });

    if (!user || !user.pwdHash) return { success: false, error: "User not found" };

    const isMatch = await compare(validated.currentPassword, user.pwdHash);
    if (!isMatch) return { success: false, error: "Incorrect current password" };

    const newHash = await hash(validated.newPassword, 10);
    await db.update(account)
      .set({ 
        pwdHash: newHash,
        updateAt: new Date().toISOString()
      })
      .where(eq(account.id, session.user.id));

    return { success: true };
  } catch (error: any) {
    console.error("Change password error:", error);
    return { success: false, error: error.message || "Failed to change password" };
  }
}

/**
 * Updates the personal profile dynamic data.
 * Protected fields like 'msv', 'employee_id', etc. are filtered out for safety.
 */
export async function updatePersonalProfileAction(data: ProfileUpdateInput) {
  const session = await getAuthSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const validated = profileUpdateSchema.parse(data);
    
    // Hardcoded protected fields for safety
    const protectedFields = ["msv", "employee_id", "username", "role", "code"];
    const filteredData = { ...validated };
    protectedFields.forEach(field => delete (filteredData as any)[field]);

    await db.update(profile)
      .set({ 
        dynamicData: filteredData, 
        updateAt: new Date().toISOString() 
      })
      .where(eq(profile.accountId, session.user.id));

    revalidatePath("/account");
    return { success: true };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { success: false, error: error.message || "Failed to update profile" };
  }
}
