"use server";
import { db } from "../db";
import { profileSection, profileSchemaField } from "../db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { structureBatchUpdateValidator } from "../lib/validators/profile-structure";

export async function updateProfileStructureAction(data: any) {
  try {
    const validated = structureBatchUpdateValidator.parse(data);
    
    return await db.transaction(async (tx) => {
      for (const section of validated.sections) {
        let sId = section.id;
        if (!sId) {
          const [newSec] = await tx.insert(profileSection).values({
            name: section.name,
            schemaId: validated.schemaId,
            order: section.order,
          }).returning();
          sId = newSec.id;
        } else {
          await tx.update(profileSection).set({
            name: section.name,
            order: section.order,
            updateAt: new Date().toISOString(),
          }).where(eq(profileSection.id, sId));
        }

        // Update fields for this section
        for (const field of section.fields) {
          await tx.insert(profileSchemaField).values({
            schemaId: validated.schemaId,
            fieldId: field.fieldId,
            sectionId: sId,
            order: field.order,
            isRequired: field.isRequired,
          }).onConflictDoUpdate({
            target: [profileSchemaField.fieldId, profileSchemaField.schemaId],
            set: { 
                sectionId: sId, 
                order: field.order, 
                isRequired: field.isRequired 
            },
          });
        }
      }
      revalidatePath("/admin/profiles/structure");
      return { success: true };
    });
  } catch (error) {
    console.error("Failed to update profile structure:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
