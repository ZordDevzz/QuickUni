"use server";

import { db } from "@/db";
import { profileField, profileSchemaField } from "@/db/schema";
import { eq, and, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type SchemaField = {
  fieldId: number;
  schemaId: number;
  isRequired: boolean;
  profileField: {
    id: number;
    name: string | null;
    label: string | null;
    datatype: string | null;
    uiSection: string;
  };
};

export type AvailableField = typeof profileField.$inferSelect;

export async function getFieldsForSchema(schemaId: number) {
  const fields = await db.query.profileSchemaField.findMany({
    where: eq(profileSchemaField.schemaId, schemaId),
    with: {
      profileField: true,
    },
  });
  return fields as SchemaField[];
}

export async function getAvailableFields(schemaId: number) {
  // Get fields already in the schema to exclude them
  const existingFields = await db.query.profileSchemaField.findMany({
    where: eq(profileSchemaField.schemaId, schemaId),
    columns: {
      fieldId: true,
    },
  });

  const existingIds = existingFields.map((f) => f.fieldId);

  // Fetch fields NOT in the existing list
  if (existingIds.length > 0) {
    return await db.query.profileField.findMany({
      where: notInArray(profileField.id, existingIds),
    });
  }

  return await db.query.profileField.findMany();
}

export async function addFieldToSchemaAction(schemaId: number, fieldId: number, isRequired: boolean = false) {
  try {
    await db.insert(profileSchemaField).values({
      schemaId,
      fieldId,
      isRequired,
    });
    revalidatePath("/admin/profiles/schemas");
    return { success: true };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return { success: false, error: "Failed to add field to schema" };
  }
}

export async function removeFieldFromSchemaAction(schemaId: number, fieldId: number) {
  try {
    await db.delete(profileSchemaField).where(
      and(
        eq(profileSchemaField.schemaId, schemaId),
        eq(profileSchemaField.fieldId, fieldId)
      )
    );
    revalidatePath("/admin/profiles/schemas");
    return { success: true };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return { success: false, error: "Failed to remove field from schema" };
  }
}

export async function updateSchemaFieldAction(schemaId: number, fieldId: number, isRequired: boolean) {
  try {
    await db.update(profileSchemaField)
      .set({ isRequired })
      .where(
        and(
          eq(profileSchemaField.schemaId, schemaId),
          eq(profileSchemaField.fieldId, fieldId)
        )
      );
    revalidatePath("/admin/profiles/schemas");
    return { success: true };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return { success: false, error: "Failed to update field" };
  }
}
