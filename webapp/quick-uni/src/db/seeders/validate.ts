import { db } from "../index";
import { systemRole } from "../schema";
import { eq } from "drizzle-orm";

export const validateSeed = async () => {
  console.log("🔍 Validating Seed Data...");
  
  // Validation: Check if 'Admin' system role exists
  const adminRole = await db.select().from(systemRole).where(eq(systemRole.name, 'Admin'));
  if (adminRole.length === 0) {
    throw new Error("Validation Failed: Admin role missing.");
  }
  
  console.log("✅ Seed Data Validated.");
};
