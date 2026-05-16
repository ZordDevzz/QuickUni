"use server";

import { db } from "@/db";
import { profileSchema } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { 
  createProfileSchemaValidator, 
  updateProfileSchemaValidator,
  CreateProfileSchemaInput,
  UpdateProfileSchemaInput
} from "@/lib/validators/profile-schema";

export type ActionResponse = {
  success: boolean;
  error?: string;
};

export async function createProfileSchemaAction(formData: CreateProfileSchemaInput): Promise<ActionResponse> {
  try {
    const validatedData = createProfileSchemaValidator.parse(formData);
    
    await db.insert(profileSchema).values({
      ...validatedData,
      effectiveDate: new Date(validatedData.effectiveDate).toISOString().split('T')[0],
      expiredDate: validatedData.expiredDate ? new Date(validatedData.expiredDate).toISOString().split('T')[0] : null,
      createAt: new Date().toISOString(),
    });

    revalidatePath("/admin/profiles/schemas");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create profile schema" 
    };
  }
}

export async function updateProfileSchemaAction(id: number, formData: UpdateProfileSchemaInput): Promise<ActionResponse> {
  try {
    const validatedData = updateProfileSchemaValidator.parse(formData);
    
    const { effectiveDate, expiredDate, ...rest } = validatedData;
    
    type ProfileSchemaUpdate = Partial<typeof profileSchema.$inferInsert>;
    const updateData: ProfileSchemaUpdate = {
      ...rest,
      updateAt: new Date().toISOString(),
    };

    if (effectiveDate) {
      updateData.effectiveDate = new Date(effectiveDate).toISOString().split('T')[0];
    }
    if (expiredDate) {
      updateData.expiredDate = new Date(expiredDate).toISOString().split('T')[0];
    }

    await db.update(profileSchema)
      .set(updateData)
      .where(eq(profileSchema.id, id));

    revalidatePath("/admin/profiles/schemas");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update profile schema" 
    };
  }
}

export async function deleteProfileSchemaAction(id: number): Promise<ActionResponse> {
  try {
    await db.delete(profileSchema).where(eq(profileSchema.id, id));
    revalidatePath("/admin/profiles/schemas");
    return { success: true };
    } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete profile schema" 
    };
    }
    }

    export async function getProfileSchemasAction() {
    try {
    const schemas = await db.query.profileSchema.findMany({
      orderBy: (schemas, { desc }) => [desc(schemas.createAt)],
    });
    return { success: true, data: schemas };
    } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch profile schemas" 
    };
    }
    }