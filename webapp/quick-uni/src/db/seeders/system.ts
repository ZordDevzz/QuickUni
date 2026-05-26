import { db } from "../index";
import { systemRole, account, userSystemRole, profileSchema, profileField, profileSchemaField } from "../schema";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";

export const seedSystem = async () => {
  console.log("⚙️ Seeding system data...");

  // 1. Roles
  const roles = [
    { id: 1, name: "Admin", isDefaultRole: false },
    { id: 2, name: "Teacher", isDefaultRole: false },
    { id: 3, name: "Student", isDefaultRole: true },
    { id: 4, name: "Academic Office", isDefaultRole: false },
  ];
  await db.insert(systemRole).values(roles).onConflictDoNothing();

  // 2. Admin Account
  const adminId = randomUUID();
  const [adminAccount] = await db.insert(account).values({
    id: adminId,
    username: "admin",
    pwdHash: await hash("admin", 10),
    type: "dev",
    status: "active",
    email: "admin@quickuni.edu.vn",
  }).onConflictDoNothing().returning();

  if (adminAccount) {
    await db.insert(userSystemRole).values({ userId: adminAccount.id, systemRole: 1 }).onConflictDoNothing();
  }

  // 3. Profile Schema
  const [schema] = await db.insert(profileSchema).values({
    schemaCode: "STD_V1",
    effectiveDate: new Date().toISOString().split('T')[0],
    des: "Standard University Profile V1",
    createAt: new Date().toISOString(),
  }).returning();

  // 4. Profile Fields
  const fields = [
    { name: "personal_email", datatype: "string", uiSection: "contact", label: "Personal Email", des: "External email address", createAt: new Date().toISOString() },
    { name: "phone", datatype: "string", uiSection: "contact", label: "Phone Number", des: "Contact phone", createAt: new Date().toISOString() },
  ];
  const insertedFields = await db.insert(profileField).values(fields).returning();

  // 5. Link Fields to Schema
  await db.insert(profileSchemaField).values(
    insertedFields.map((f, i) => ({
      fieldId: f.id,
      schemaId: schema.id,
      order: i,
      isRequired: true,
    }))
  );

  console.log("✅ System data seeded.");
  return { schemaId: schema.id, roles: { admin: 1, teacher: 2, student: 3, academic_office: 4 } };
};
