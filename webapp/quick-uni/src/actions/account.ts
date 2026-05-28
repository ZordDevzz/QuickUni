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
  } catch (error: unknown) {
    console.error("Change password error:", error);
    return { success: false, error: (error as Error).message || "Failed to change password" };
  }
}

/**
 * Updates the personal profile standard and dynamic data.
 * Protected fields like 'msv', 'employee_id', etc. are filtered out for safety.
 */
export async function updatePersonalProfileAction(data: ProfileUpdateInput) {
  const session = await getAuthSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const validated = profileUpdateSchema.parse(data);
    
    const coreFields = ["fullname", "gender", "dob", "address", "ethnic", "religious"];
    const updateData: Record<string, any> = {
      updateAt: new Date().toISOString()
    };
    const dynamicData: Record<string, any> = {};

    Object.entries(validated).forEach(([key, value]) => {
      if (coreFields.includes(key)) {
        if (key === "gender") {
          if (value === "male" || value === "female" || value === "others") {
            updateData[key] = value;
          }
        } else if (key === "dob") {
          if (value && typeof value === "string") {
            updateData[key] = value.split("T")[0];
          }
        } else {
          updateData[key] = value;
        }
      } else {
        const protectedFields = [
          "msv", "employee_id", "username", "role", "code", "id", "accountId", 
          "schemaId", "sessionId", "createAt", "updateAt", "deletedAt"
        ];
        if (!protectedFields.includes(key)) {
          dynamicData[key] = value;
        }
      }
    });

    const existingProfile = await db.query.profile.findFirst({
      where: eq(profile.accountId, session.user.id),
    });

    if (existingProfile) {
      const mergedDynamicData = {
        ...(existingProfile.dynamicData as Record<string, any> || {}),
        ...dynamicData
      };
      
      coreFields.forEach(field => {
        if (field in mergedDynamicData) {
          delete mergedDynamicData[field];
        }
      });
      
      updateData.dynamicData = mergedDynamicData;
    } else {
      updateData.dynamicData = dynamicData;
    }

    await db.update(profile)
      .set(updateData)
      .where(eq(profile.accountId, session.user.id));

    revalidatePath("/account");
    return { success: true };
  } catch (error: unknown) {
    console.error("Update profile error:", error);
    return { success: false, error: (error as Error).message || "Failed to update profile" };
  }
}
