import { db } from "@/db";
import { account, userSystemRole, accountAudit } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";

export const createAccountAudit = async (data: typeof accountAudit.$inferInsert) => {
  const [newAudit] = await db.insert(accountAudit).values(data).returning();
  return newAudit;
};

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
    with: {
      userSystemRoles: true,
    },
  });
  return user;
};

export const getUserRoles = async (userId: string) => {
  return await db.query.userSystemRole.findMany({
    where: eq(userSystemRole.userId, userId),
  });
};

export const getAccounts = async () => {
  return await db.query.account.findMany({
    where: isNull(account.deletedAt),
    orderBy: (account, { desc }) => [desc(account.createAt)],
    with: {
      userSystemRoles: true,
    }
  });
};

export const getStudentAccounts = async () => {
  const accounts = await getAccounts();
  return accounts.filter(acc => acc.userSystemRoles.some(r => Number(r.systemRole) === 3));
};

export const getPersonnelAccounts = async () => {
  const accounts = await getAccounts();
  return accounts.filter(acc => acc.userSystemRoles.some(r => [1, 2, 4].includes(Number(r.systemRole))));
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

// --- Workflow Services ---

export interface AccountWorkflowContext {
  performedBy?: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export const createAccountWorkflow = async (
  data: Omit<typeof account.$inferInsert, "id" | "pwdHash"> & { password?: string },
  ctx: AccountWorkflowContext
) => {
  const { password, ...accountData } = data;
  const id = randomUUID();
  const pwdHash = password ? await hash(password, 10) : "system-generated-placeholder";

  const newAccount = await createAccount({
    ...accountData,
    id,
    pwdHash,
  });

  await createAccountAudit({
    accountId: newAccount.id,
    performedBy: ctx.performedBy,
    action: "create_account",
    newValue: {
      username: newAccount.username,
      email: newAccount.email,
      type: newAccount.type,
      status: newAccount.status,
    },
    userAgent: ctx.userAgent,
    ipAddress: ctx.ipAddress,
  });

  return newAccount;
};

export const updateAccountWorkflow = async (
  id: string,
  data: Partial<Omit<typeof account.$inferInsert, "id" | "pwdHash"> & { password?: string }>,
  ctx: AccountWorkflowContext
) => {
  const oldAccount = await getUserById(id);
  if (!oldAccount) throw new Error("Account not found");

  const { password, ...otherData } = data;
  const dataToUpdate: Partial<typeof account.$inferInsert> = { ...otherData };

  if (password) {
    dataToUpdate.pwdHash = await hash(password, 10);
  }

  const updatedAccount = await updateAccount(id, dataToUpdate);

  if (updatedAccount) {
    await createAccountAudit({
      accountId: id,
      performedBy: ctx.performedBy,
      action: "update_account",
      oldValue: {
        username: oldAccount.username,
        email: oldAccount.email,
        phone: oldAccount.phone,
        type: oldAccount.type,
        status: oldAccount.status,
      },
      newValue: {
        username: updatedAccount.username,
        email: updatedAccount.email,
        phone: updatedAccount.phone,
        type: updatedAccount.type,
        status: updatedAccount.status,
      },
      userAgent: ctx.userAgent,
      ipAddress: ctx.ipAddress,
    });
  }

  return updatedAccount;
};

export const deleteAccountWorkflow = async (id: string, ctx: AccountWorkflowContext) => {
  const oldAccount = await getUserById(id);
  if (!oldAccount) throw new Error("Account not found");

  const deletedAccount = await deleteAccount(id);

  await createAccountAudit({
    accountId: id,
    performedBy: ctx.performedBy,
    action: "delete_account",
    oldValue: {
      username: oldAccount.username,
      email: oldAccount.email,
      phone: oldAccount.phone,
      type: oldAccount.type,
      status: oldAccount.status,
    },
    userAgent: ctx.userAgent,
    ipAddress: ctx.ipAddress,
  });

  return deletedAccount;
};
