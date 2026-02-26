"use server";

import { db } from "@/db";
import { profileField } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { 
  createProfileFieldValidator, 
  updateProfileFieldValidator,
  CreateProfileFieldInput,
  UpdateProfileFieldInput
} from "@/lib/validators/profile-field";

export type ActionResponse = {
  success: boolean;
  error?: string;
};

export async function getProfileFields() {
  return await db.query.profileField.findMany({
    orderBy: (fields, { desc }) => [desc(fields.createAt)],
  });
}

export async function createProfileFieldAction(formData: CreateProfileFieldInput): Promise<ActionResponse> {
  try {
    const validatedData = createProfileFieldValidator.parse(formData);
    
    await db.insert(profileField).values({
      ...validatedData,
      createAt: new Date().toISOString(),
    });

    revalidatePath("/admin/profiles/fields");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create profile field" 
    };
  }
}

export async function updateProfileFieldAction(id: number, formData: UpdateProfileFieldInput): Promise<ActionResponse> {
  try {
    const validatedData = updateProfileFieldValidator.parse(formData);
    
    await db.update(profileField)
      .set({
        ...validatedData,
        updateAt: new Date().toISOString(),
      })
      .where(eq(profileField.id, id));

    revalidatePath("/admin/profiles/fields");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update profile field" 
    };
  }
}

export async function deleteProfileFieldAction(id: number): Promise<ActionResponse> {
  try {
    await db.delete(profileField).where(eq(profileField.id, id));
    revalidatePath("/admin/profiles/fields");
    return { success: true };
  } catch (error: unknown) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete profile field" 
    };
  }
}
