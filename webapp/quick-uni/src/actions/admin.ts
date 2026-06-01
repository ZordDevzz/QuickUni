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
import { 
  profile as profileTable,
  student as studentTable,
  employee as employeeTable,
  profileSchema as profileSchemaTable
} from "@/db/schemas/user";
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

    let systemRoleId: number | undefined = undefined;
    if (validatedData.type === "student") {
      systemRoleId = 3;
    } else if (validatedData.type === "employee") {
      systemRoleId = 2; // Teacher/Lecturer role
    } else if (validatedData.type === "tech" || validatedData.type === "dev") {
      systemRoleId = 1; // Admin role
    }
    
    await issueAccountWorkflow(validatedData, profileId, {
      performedBy: session?.user?.id,
      userAgent: headerList.get("user-agent"),
      ipAddress,
      systemRoleId,
    });

    revalidatePath("/admin/accounts");
    revalidatePath("/admin/personnel");
    revalidatePath("/admin/students");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create account" 
    };
  }
}

export async function createProfileAction(formData: CreateProfileInput): Promise<ActionResponse & { profileId?: string; code?: string }> {
  try {
    const validatedData = nullifyEmptyStrings(createProfileSchema.parse(formData));
    const profileId = randomUUID();

    // Get Schema to detect type
    const schemaParams = await db.query.profileSchema.findFirst({
      where: eq(profileSchemaTable.id, validatedData.schemaId),
    });
    if (!schemaParams) {
      throw new Error("Invalid Profile Schema ID");
    }
    const type = schemaParams.schemaCode.startsWith("STD") ? "student" : "employee";

    // Auto-generate code
    const generatedCode = await generateAutoCode(type);

    // Create profile
    const newProfile = await createProfileWorkflow({
      ...validatedData,
      id: profileId,
      dob: new Date(validatedData.dob).toISOString().split('T')[0],
    });

    // Create corresponding entity linked to the profile
    if (type === "student") {
      await db.insert(studentTable).values({
        id: randomUUID(),
        code: generatedCode,
        profileId: newProfile.id,
      });
    } else {
      await db.insert(employeeTable).values({
        id: randomUUID(),
        code: generatedCode,
        profileId: newProfile.id,
      });
    }

    revalidatePath("/admin/profiles");
    revalidatePath("/admin/personnel");
    revalidatePath("/admin/students");
    return { success: true, profileId, code: generatedCode };
  } catch (error: unknown) {
    let errorMessage = "Failed to create profile";
    if (error instanceof Error) {
      if (error.message.includes("profile_national_id_key") || error.message.includes("national_id")) {
        errorMessage = "Số CCCD/CMND đã tồn tại trên hệ thống.";
      } else {
        errorMessage = error.message;
      }
    }
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

export async function linkProfileToEntityAction(profileId: string, type: "student" | "employee", code: string): Promise<ActionResponse> {
  try {
    await linkProfileToEntity(profileId, type, { code });
    revalidatePath("/admin/profiles");
    revalidatePath("/admin/personnel");
    revalidatePath("/admin/students");
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
    revalidatePath("/admin/personnel");
    revalidatePath("/admin/students");
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
    revalidatePath("/admin/personnel");
    revalidatePath("/admin/students");
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
    revalidatePath("/admin/personnel");
    revalidatePath("/admin/students");
    return { success: true };
  } catch (error: unknown) {
    let errorMessage = "Failed to update profile";
    if (error instanceof Error) {
      if (error.message.includes("profile_national_id_key") || error.message.includes("national_id")) {
        errorMessage = "Số CCCD/CMND đã tồn tại trên hệ thống.";
      } else {
        errorMessage = error.message;
      }
    }
    return { 
      success: false, 
      error: errorMessage
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
      des: `System default profile schema ID for ${type}s`,
    })
    .onConflictDoUpdate({
      target: systemSetting.key,
      set: { value: schemaId },
    });
}

export type AutoCodeRule = {
  prefix: string;
  hasYear: boolean;
  yearFormat: "YY" | "YYYY";
  seqPadding: number;
  currentSeq: number;
  isActive: boolean;
};

export async function generateAutoCode(type: "student" | "employee"): Promise<string> {
  const key = type === "student" ? "AUTO_STUDENT_CODE_RULE" : "AUTO_EMPLOYEE_CODE_RULE";
  
  return await db.transaction(async (tx) => {
    const record = await tx.query.systemSetting.findFirst({
      where: eq(systemSetting.key, key),
    });
    
    if (!record || !record.value) {
      const fallbackPrefix = type === "student" ? "SV" : "NV";
      const year = new Date().getFullYear().toString().slice(-2);
      return `${fallbackPrefix}${year}1001`;
    }
    
    const rule = record.value as AutoCodeRule;
    
    if (!rule.isActive) {
      const fallbackPrefix = type === "student" ? "SV" : "NV";
      const year = new Date().getFullYear().toString().slice(-2);
      return `${fallbackPrefix}${year}${Math.floor(1000 + Math.random() * 9000)}`;
    }
    
    // 1. Get Year Part
    let yearPart = "";
    if (rule.hasYear) {
      const fullYear = new Date().getFullYear().toString();
      yearPart = rule.yearFormat === "YY" ? fullYear.slice(-2) : fullYear;
    }
    
    // 2. Increment Sequence
    const nextSeq = rule.currentSeq + 1;
    const seqPart = nextSeq.toString().padStart(rule.seqPadding, "0");
    
    // 3. Update Sequence in DB
    await tx
      .update(systemSetting)
      .set({
        value: {
          ...rule,
          currentSeq: nextSeq,
        },
        updateAt: new Date().toISOString(),
      })
      .where(eq(systemSetting.key, key));
      
    return `${rule.prefix}${yearPart}${seqPart}`;
  });
}

export async function getAutoCodeRules() {
  const [studentRule, employeeRule] = await Promise.all([
    db.query.systemSetting.findFirst({ where: eq(systemSetting.key, "AUTO_STUDENT_CODE_RULE") }),
    db.query.systemSetting.findFirst({ where: eq(systemSetting.key, "AUTO_EMPLOYEE_CODE_RULE") }),
  ]);
  
  return {
    student: (studentRule?.value || {
      prefix: "SV",
      hasYear: true,
      yearFormat: "YY",
      seqPadding: 4,
      currentSeq: 1000,
      isActive: true
    }) as AutoCodeRule,
    employee: (employeeRule?.value || {
      prefix: "NV",
      hasYear: true,
      yearFormat: "YY",
      seqPadding: 4,
      currentSeq: 1000,
      isActive: true
    }) as AutoCodeRule,
  };
}

export async function saveAutoCodeRule(type: "student" | "employee", rule: AutoCodeRule) {
  const key = type === "student" ? "AUTO_STUDENT_CODE_RULE" : "AUTO_EMPLOYEE_CODE_RULE";
  const displayName = `${type === "student" ? "Student" : "Employee"} Auto Code Generation Rule`;
  
  await db
    .insert(systemSetting)
    .values({
      key,
      value: rule,
      displayName,
      des: `Automatic ${type} code generation rules and sequence tracking`,
    })
    .onConflictDoUpdate({
      target: systemSetting.key,
      set: { value: rule, updateAt: new Date().toISOString() },
    });
    
  revalidatePath("/admin/system/settings");
  return { success: true };
}
