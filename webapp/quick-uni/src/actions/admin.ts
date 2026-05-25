"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { systemSetting } from "@/db/schemas/system";
import { eq } from "drizzle-orm";
import { 
  updateAccountWorkflow,
  deleteAccountWorkflow,
} from "@/services/user";
import { 
  updateProfile, 
} from "@/services/profile";
import { 
  createProfileWorkflow,
  issueAccountWorkflow,
  linkProfileToEntity,
} from "@/services/onboarding";
import { createAccountSchema, updateAccountAdminSchema } from "@/lib/validators/account";
import { updateProfileSchema, createProfileSchema } from "@/lib/validators/profile";
import { z } from "zod";
import { profile as profileTable } from "@/db/schemas/user";
import { nullifyEmptyStrings } from "@/lib/utils";
import { getAuthSession } from "@/services/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";

type CreateAccountInput = z.infer<typeof createAccountSchema>;
type UpdateAccountInput = z.infer<typeof updateAccountAdminSchema>;
type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
type CreateProfileInput = z.infer<typeof createProfileSchema>;

/**
 * Result type for all admin actions
 */
export type ActionResponse = {
  success: boolean;
  error?: string;
};

// Account Actions
export async function createAccountAction(formData: CreateAccountInput, profileId?: string): Promise<ActionResponse> {
  try {
    const session = await getAuthSession();
    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0] || null;
    const validatedData = nullifyEmptyStrings(createAccountSchema.parse(formData));
    
    await issueAccountWorkflow(validatedData, profileId, {
      performedBy: session?.user?.id,
      userAgent: headerList.get("user-agent"),
      ipAddress,
    });

    revalidatePath("/admin/accounts");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create account" 
    };
  }
}

export async function createProfileAction(formData: CreateProfileInput): Promise<ActionResponse> {
  try {
    const validatedData = nullifyEmptyStrings(createProfileSchema.parse(formData));
    await createProfileWorkflow({
      ...validatedData,
      id: randomUUID(),
      dob: new Date(validatedData.dob).toISOString().split('T')[0],
    });
    revalidatePath("/admin/profiles");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create profile" 
    };
  }
}

export async function linkProfileToEntityAction(profileId: string, type: "student" | "employee", code: string): Promise<ActionResponse> {
  try {
    await linkProfileToEntity(profileId, type, { code });
    revalidatePath("/admin/profiles");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to link profile" 
    };
  }
}

export async function updateAccountAction(id: string, formData: UpdateAccountInput): Promise<ActionResponse> {
  try {
    const session = await getAuthSession();
    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0] || null;
    const validatedData = nullifyEmptyStrings(updateAccountAdminSchema.parse(formData));
    
    await updateAccountWorkflow(id, validatedData, {
      performedBy: session?.user?.id,
      userAgent: headerList.get("user-agent"),
      ipAddress,
    });

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
    const session = await getAuthSession();
    const headerList = await headers();
    const ipAddress = headerList.get("x-forwarded-for")?.split(",")[0] || null;
    
    await deleteAccountWorkflow(id, {
      performedBy: session?.user?.id,
      userAgent: headerList.get("user-agent"),
      ipAddress,
    });

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
    const validatedData = nullifyEmptyStrings(updateProfileSchema.parse(formData));
    
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

// System Setting Actions
export async function getDefaultSchemaId(type: "employee" | "student") {
  const key = type === "employee" ? "DEFAULT_EMPLOYEE_SCHEMA_ID" : "DEFAULT_STUDENT_SCHEMA_ID";
  const setting = await db.query.systemSetting.findFirst({ where: eq(systemSetting.key, key) });

  // Note: systemSetting.value is JSONB. We expect it to be a number (the schema ID).
  return setting?.value as number | null;
}

export async function setDefaultSchemaId(type: "employee" | "student", schemaId: number) {
  const key = type === "employee" ? "DEFAULT_EMPLOYEE_SCHEMA_ID" : "DEFAULT_STUDENT_SCHEMA_ID";

  await db
    .insert(systemSetting)
    .values({
      key,
      value: schemaId,
      displayName: `Default ${type === "employee" ? "Employee" : "Student"} Profile Structure`,
    })
    .onConflictDoUpdate({
      target: systemSetting.key,
      set: { value: schemaId },
    });
}
