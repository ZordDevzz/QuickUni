import { db } from "@/db";
import { 
  systemRole, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  systemAuthority, 
  systemRoleAuthority, 
  userSystemRole 
} from "@/db/schema";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { eq, inArray, isNull } from "drizzle-orm";
import { 
  InsertRoleInput, 
  UpdateRoleInput 
} from "@/lib/validators/role";

export const getRoles = async () => {
  return await db.query.systemRole.findMany({
    orderBy: (role, { asc }) => [asc(role.name)],
    with: {
      systemRoleAuthorities: true,
    },
  });
};

export const getRoleById = async (id: number) => {
  return await db.query.systemRole.findFirst({
    where: eq(systemRole.id, id),
    with: {
      systemRoleAuthorities: true,
    },
  });
};

export const getAllAuthorities = async () => {
  return await db.query.systemAuthority.findMany({
    orderBy: (auth, { asc }) => [asc(auth.id)],
  });
};

export const createRole = async (data: InsertRoleInput) => {
  const [newRole] = await db.insert(systemRole).values(data).returning();
  return newRole;
};

export const updateRole = async (id: number, data: UpdateRoleInput) => {
  const [updated] = await db
    .update(systemRole)
    .set(data)
    .where(eq(systemRole.id, id))
    .returning();
  return updated;
};

export const deleteRole = async (id: number) => {
  // Check if role is in use
  const usersWithRole = await db.query.userSystemRole.findFirst({
    where: eq(userSystemRole.systemRole, id),
  });

  if (usersWithRole) {
    throw new Error("Cannot delete role: It is currently assigned to users.");
  }

  // Delete associated authorities first
  await db.delete(systemRoleAuthority).where(eq(systemRoleAuthority.roleId, id));

  const [deleted] = await db
    .delete(systemRole)
    .where(eq(systemRole.id, id))
    .returning();
  return deleted;
};

export const updateRoleAuthorities = async (roleId: number, authorityIds: string[]) => {
  await db.transaction(async (tx) => {
    // 1. Delete all existing authorities for this role
    await tx.delete(systemRoleAuthority).where(eq(systemRoleAuthority.roleId, roleId));

    // 2. Insert new authorities if any
    if (authorityIds.length > 0) {
      await tx.insert(systemRoleAuthority).values(
        authorityIds.map((authId) => ({
          roleId,
          authorityId: authId,
        }))
      );
    }
  });
};

export const updateUserRoles = async (userId: string, roleIds: number[]) => {
  await db.transaction(async (tx) => {
    // 1. Delete all existing roles for this user
    await tx.delete(userSystemRole).where(eq(userSystemRole.userId, userId));

    // 2. Insert new roles if any
    if (roleIds.length > 0) {
      await tx.insert(userSystemRole).values(
        roleIds.map((roleId) => ({
          userId,
          systemRole: roleId,
        }))
      );
    }
  });
};

export const getUserRoles = async (userId: string) => {
  return await db.query.userSystemRole.findMany({
    where: eq(userSystemRole.userId, userId),
  });
};
