import { db } from "./index";
import { account, systemRole, userSystemRole } from "./schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const main = async () => {
  console.log("🌱 Starting database seed...");

  try {
    // 1. Ensure Admin System Role exists
    const adminRoleId = 1;
    const existingRole = await db.query.systemRole.findFirst({
      where: eq(systemRole.id, adminRoleId),
    });

    if (!existingRole) {
      console.log("Creating 'Admin' system role...");
      await db.insert(systemRole).values({
        id: adminRoleId,
        name: "Admin",
        isDefaultRole: false,
      });
    } else {
      console.log("'Admin' system role already exists.");
    }

    // 2. Ensure Admin Account exists
    const adminUsername = "admin";
    const existingAdmin = await db.query.account.findFirst({
      where: eq(account.username, adminUsername),
    });

    if (!existingAdmin) {
      console.log("Creating 'admin' account...");
      const hashedPassword = await hash("admin", 10);
      const adminId = randomUUID();

      // Create account
      await db.insert(account).values({
        id: adminId,
        username: adminUsername,
        pwdHash: hashedPassword,
        type: "dev", // 'dev' type for super admin privileges
        status: "active",
        email: "admin@quickuni.edu.vn",
      });

      // Assign Admin role
      await db.insert(userSystemRole).values({
        userId: adminId,
        systemRole: adminRoleId,
      });

      console.log("✅ Admin account created successfully.");
      console.log("   Username: admin");
      console.log("   Password: admin");
    } else {
      console.log("'admin' account already exists.");
    }

    console.log("🌱 Seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

main();
