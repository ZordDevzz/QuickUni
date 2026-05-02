import { db } from "./src/db";
import { account } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function checkAdmin() {
  const admin = await db.query.account.findFirst({
    where: eq(account.username, "admin"),
  });
  console.log("Admin account:", JSON.stringify(admin, null, 2));
  process.exit(0);
}

checkAdmin();
