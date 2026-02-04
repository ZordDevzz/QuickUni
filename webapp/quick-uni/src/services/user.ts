import { db } from "@/db";
import { account, userSystemRole } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export const isAdmin = async (userId: string) => {
  const role = await db.query.userSystemRole.findFirst({
    where: and(
      eq(userSystemRole.userId, userId),
      eq(userSystemRole.systemRole, 1)
    ),
  });
  return !!role;
};

export const getUserByUsername = async (username: string) => {
  const user = await db.query.account.findFirst({
    where: eq(account.username, username),
  });
  return user;
};

export const getUserById = async (id: string) => {
  const user = await db.query.account.findFirst({
    where: eq(account.id, id),
  });
  return user;
};

export const getAccounts = async () => {
  return await db.query.account.findMany({
    where: isNull(account.deletedAt),
    orderBy: (account, { desc }) => [desc(account.createAt)],
  });
};

export const createAccount = async (data: typeof account.$inferInsert) => {
  const [newAccount] = await db.insert(account).values(data).returning();
  return newAccount;
};

export const updateAccount = async (id: string, data: Partial<typeof account.$inferInsert>) => {
  const [updated] = await db
    .update(account)
    .set({
      ...data,
      updateAt: new Date().toISOString(),
    })
    .where(eq(account.id, id))
    .returning();
  return updated;
};

export const deleteAccount = async (id: string) => {
  const [deleted] = await db
    .update(account)
    .set({
      deletedAt: new Date().toISOString(),
    })
    .where(eq(account.id, id))
    .returning();
  return deleted;
};
