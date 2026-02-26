import { db } from "@/db";
import { 
  profile, 
  profileSchema, 
  student, 
  employee,
  profileSchemaField,
} from "@/db/schema";
import { userSystemRole } from "@/db/schemas/auth";
import { eq, isNull } from "drizzle-orm";
import { createAccountWorkflow, AccountWorkflowContext } from "./user";
import { randomUUID } from "crypto";

// Types
export type ProfileCreationData = typeof profile.$inferInsert;
export type EntityType = "student" | "employee";
export type EntityCreationData = {
  code: string;
  [key: string]: unknown;
};

/**
 * Business Logic: Create Profile (Lập hồ sơ)
 * - Creates a profile linked to a profile_schema.
 * - Dynamic data should be validated against the schema (basic validation here).
 */
export const createProfileWorkflow = async (
  data: ProfileCreationData
) => {
  // 1. Validate Schema Existence
  const schemaId = data.schemaId;
  const schemaParams = await db.query.profileSchema.findFirst({
    where: eq(profileSchema.id, schemaId),
  });

  if (!schemaParams) {
    throw new Error("Invalid Profile Schema ID");
  }

  // 2. Validate dynamicData against schemaParams
  const schemaFields = await db.query.profileSchemaField.findMany({
    where: eq(profileSchemaField.schemaId, schemaId),
    with: {
      profileField: true, // Assuming relation exists and is named 'profileField'
    }
  });

  const dynamicData = (data.dynamicData as Record<string, unknown>) || {};

  for (const sf of schemaFields) {
    const fieldDef = sf.profileField;
    if (!fieldDef) continue; // Should not happen if integrity is maintained

    const fieldName = fieldDef.name;
    // Check required fields
    if (fieldName && sf.isRequired && (dynamicData[fieldName] === undefined || dynamicData[fieldName] === null || dynamicData[fieldName] === "")) {
      throw new Error(`Missing required field: ${fieldDef.label || fieldName}`);
    }

    // Basic type checking (expand as needed)
    if (fieldName && dynamicData[fieldName] !== undefined) {
      if (fieldDef.datatype === "number" && typeof dynamicData[fieldName] !== "number") {
         throw new Error(`Field ${fieldDef.label || fieldName} must be a number`);
      }
      if (fieldDef.datatype === "boolean" && typeof dynamicData[fieldName] !== "boolean") {
         throw new Error(`Field ${fieldDef.label || fieldName} must be a boolean`);
      }
      // Add more type checks (date, string, etc.)
    }
  }

  // 3. Create Profile
  // Constraint: set accountId to NULL (as per Phase 1, Step 2)
  const [newProfile] = await db.insert(profile).values({
    ...data,
    id: data.id || randomUUID(),
    accountId: null, 
  }).returning();

  return newProfile;
};

/**
 * Business Logic: Link Profile to Entity (Liên kết hồ sơ)
 * - Creates a Student OR Employee record linked to the profile.
 * - Enforces uniqueness constraints (handled by DB, but good to wrap).
 */
export const linkProfileToEntity = async (
  profileId: string,
  type: EntityType,
  data: EntityCreationData
) => {
  // Check if profile exists
  const existingProfile = await db.query.profile.findFirst({
    where: eq(profile.id, profileId),
  });
  if (!existingProfile) throw new Error("Profile not found");

  if (type === "student") {
    // Check if profile is already linked to a student
    const existingStudent = await db.query.student.findFirst({
      where: eq(student.profileId, profileId),
    });
    if (existingStudent) throw new Error("Profile is already linked to a Student");

    const [newStudent] = await db.insert(student).values({
      id: randomUUID(),
      code: data.code,
      profileId: profileId,
    }).returning();
    return { type: "student", entity: newStudent };
  } else if (type === "employee") {
     // Check if profile is already linked to an employee (Optional constraint enforcement)
     // Although schema allows duplicate profileIds for employees (no unique constraint in schema definition provided),
     // Business logic says "1 profile... linked to 1 student OR-AND one employee".
     // We should probably allow it, but let's check if this SPECIFIC employee code exists.
     
     const [newEmployee] = await db.insert(employee).values({
        id: randomUUID(),
        code: data.code,
        profileId: profileId,
     }).returning();
     return { type: "employee", entity: newEmployee };
  }

  throw new Error("Invalid Entity Type");
};

/**
 * Business Logic: Issue User Account (Cấp tài khoản người dùng)
 * - Strategy A: Individual/Immediate Provisioning
 * - Creates an account.
 * - Links account to profile by updating profile.accountId.
 * - Assigns system role.
 */
export const issueAccountWorkflow = async (
  accountData: Parameters<typeof createAccountWorkflow>[0],
  profileId: string | undefined,
  ctx: AccountWorkflowContext & { systemRoleId?: number }
) => {
  // 1. Constraint Check: Phase 2 requires profileId for linkage
  if (accountData.type !== "dev" && !profileId) {
    throw new Error("Non-Dev accounts must be linked to a Profile.");
  }

  // 2. Check Profile Availability (if profileId provided)
  if (profileId) {
    const existingProfile = await db.query.profile.findFirst({
      where: eq(profile.id, profileId),
    });
    
    if (!existingProfile) throw new Error("Profile not found");
    if (existingProfile.accountId) {
      throw new Error("Profile is already linked to another Account.");
    }
  }

  // 3. Create Account (using existing User Service workflow)
  const newAccount = await createAccountWorkflow(accountData, ctx);

  // 4. Linkage: Update the profile table
  if (profileId) {
    await db.update(profile)
      .set({ accountId: newAccount.id, updateAt: new Date().toISOString() })
      .where(eq(profile.id, profileId));
  }

  // 5. Authorization: Insert into userSystemRole
  if (ctx.systemRoleId) {
    await db.insert(userSystemRole).values({
      userId: newAccount.id,
      systemRole: ctx.systemRoleId,
    });
  }

  return newAccount;
};

/**
 * Business Logic: Bulk Provisioning (Cấp tài khoản hàng loạt)
 * - Strategy B: Bulk/Batch Provisioning
 * - Queries unlinked profiles.
 * - Generates credentials (username = entity code).
 * - Creates accounts and links them.
 * - Assigns default role.
 */
export const bulkProvisioningWorkflow = async (
  entityType: "student" | "employee",
  defaultSystemRoleId: number,
  ctx: AccountWorkflowContext
) => {
  // 1. Targeting: Query unlinked profiles joined with entity type
  const profilesToProvision = await db.query.profile.findMany({
    where: isNull(profile.accountId),
    with: {
      students: entityType === "student" ? true : undefined,
      employees: entityType === "employee" ? true : undefined,
    }
  });

  const results = {
    total: profilesToProvision.length,
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  // 2. Iteration
  for (const p of profilesToProvision) {
    try {
      // Determine Code for Username
      let entityCode = "";
      if (entityType === "student" && p.students && p.students.length > 0) {
        entityCode = p.students[0].code; 
      } else if (entityType === "employee" && p.employees && p.employees.length > 0) {
        entityCode = p.employees[0].code;
      }

      if (!entityCode) {
        // Skip if no entity linked
        continue; 
      }

      // Generate Credentials
      const username = entityCode; 
      const password = "DefaultPassword123!"; // Should be configurable or random

      // Create Account & Link (Re-use Strategy A logic per profile)
      await issueAccountWorkflow(
        {
          username,
          password,
          type: entityType, // "student" or "employee"
          status: "active",
        },
        p.id,
        {
          ...ctx,
          systemRoleId: defaultSystemRoleId
        }
      );

      results.success++;
    } catch (e: unknown) {
      results.failed++;
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      results.errors.push(`Profile ${p.id}: ${errorMessage}`);
    }
  }

  // 3. Audit
  // Log the batch operation size and status could be done here if a batch_audit table existed.
  // For now, individual account creations are audited.

  return results;
};