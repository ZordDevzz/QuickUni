import { db } from "../index";
import { roles } from "../schema";
import { eq } from "drizzle-orm";

export const validateSeed = async () => {
  console.log("🔍 Validating Seed Data...");
  
  // Validation: Check if 'admin' role exists
  const adminRole = await db.select().from(roles).where(eq(roles.name, 'admin'));
  if (adminRole.length === 0) {
    throw new Error("Validation Failed: Admin role missing.");
  }
  
  console.log("✅ Seed Data Validated.");
};
