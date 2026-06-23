import { db } from "./src/db";
import { availability } from "./src/db/schemas/schedule";
import { eq, and } from "drizzle-orm";

async function main() {
  const records = await db.select().from(availability).where(
    and(
      eq(availability.entityId, "1"),
      eq(availability.entityType, "room"),
      eq(availability.dayOfWeek, 4)
    )
  );

  console.log("Records matching Room 1 on Day 4:");
  console.log(JSON.stringify(records, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
