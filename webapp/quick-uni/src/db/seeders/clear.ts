import { db } from "../index";
import { sql } from "drizzle-orm";

export const clearDatabase = async () => {
  console.log("🧹 Clearing database...");

  const tables = [
    '"users"."student"',
    '"users"."employee"',
    '"users"."profile"',
    '"users"."profile_schema_field"',
    '"users"."profile_field"',
    '"users"."profile_section"',
    '"users"."profile_schema"',
    '"course"."enrollment"',
    '"course"."course_class"',
    '"course"."main_class"',
    '"schedule"."schedule"',
    '"schedule"."weekly_template"',
    '"schedule"."availability"',
    '"schedule"."holiday_blacklist"',
    '"schedule"."room"',
    '"schedule"."building"',
    '"academic"."department"',
    '"academic"."major"',
    '"academic"."subject"',
    '"academic"."semester"',
    '"auth"."user_system_role"',
    '"auth"."system_role"',
    '"auth"."account"',
    '"system"."onboarding_session"',
    '"system"."system_audit_log"',
  ];

  try {
    const query = sql.raw(`TRUNCATE TABLE ${tables.join(", ")} RESTART IDENTITY CASCADE`);
    await db.execute(query);
    console.log("✅ Database cleared successfully.");
  } catch (error) {
    console.error("❌ Failed to clear database:", error);
    throw error;
  }
};

// Check if file is being run directly
// In tsx/Node, we can use require.main === module or import.meta.url
// For ESM compatibility in tsx:
const isMain = import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'));

if (isMain) {
  clearDatabase()
    .then(() => {
      console.log("👋 Done.");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
