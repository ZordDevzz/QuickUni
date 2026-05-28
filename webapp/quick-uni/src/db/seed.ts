import { clearDatabase } from "./seeders/clear";
import { seedSystem } from "./seeders/system";
import { seedOrg } from "./seeders/org";
import { seedPeople } from "./seeders/people";
import { seedAcademic } from "./seeders/academic";
import { seedScheduling } from "./seeders/scheduling";
import { validateSeed } from "./seeders/validate";
import { execSync } from "child_process";
import { db } from "./index";
import { sql } from "drizzle-orm";

const runMigration = () => {
  try {
    console.log("🔄 Running migrations (drizzle-kit push)...");
    execSync("npx drizzle-kit push", { stdio: "inherit" });
    return true;
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    return false;
  }
};

const emergencyReset = async () => {
  console.log("🚨 EMERGENCY RESET: Wiping database structure...");
  const schemas = ["users", "academic", "course", "schedule", "auth", "system", "drizzle"];
  for (const schema of schemas) {
    try {
      await db.execute(sql.raw(`DROP SCHEMA IF EXISTS ${schema} CASCADE`));
    } catch (e: any) {
      console.warn(`Could not drop schema ${schema}:`, e.message);
    }
  }
  console.log("✅ Database structure wiped.");
  runMigration();
};

const main = async () => {
  console.log("🌱 STARTING MODULAR SEEDING...");

  const syncSuccess = runMigration();
  if (!syncSuccess) {
    await emergencyReset();
  } else {
    await clearDatabase();
  }

  try {
    // 1. Roles & System Setup
    console.log("⚙️  Seeding system...");
    const { studentSchemaId, employeeSchemaId, roles } = await seedSystem();

    // 2. Org Entities
    console.log("🏢 Seeding organization...");
    const { departments, majors, rooms } = await seedOrg();

    // 3. People (Users)
    console.log("👥 Seeding people...");
    const { teachersList, studentList } = await seedPeople(studentSchemaId, employeeSchemaId, roles, departments, majors);

    // 4. Academic Data
    console.log("📚 Seeding academic entities...");
    const { semesterId, subjects } = await seedAcademic();

    // 5. Scheduling (Uncommented to populate course classes, schedules, and requests in the app!)
    console.log("📅 Seeding scheduling...");
    await seedScheduling(semesterId, subjects, teachersList, rooms, studentList);

    // 6. Validation
    await validateSeed();

    console.log("✨ SEEDING COMPLETED SUCCESSFULLY.");
    process.exit(0);
  } catch (error) {
    console.error("❌ SEEDING FAILED AT EXECUTION:", error);
    process.exit(1);
  }
};

main();
