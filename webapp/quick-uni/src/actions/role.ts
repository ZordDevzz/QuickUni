"use server";

import { revalidatePath } from "next/cache";
import * as roleService from "@/services/role";
import { 
  insertRoleSchema, 
  updateRoleSchema, 
  assignAuthoritiesSchema, 
  assignUserRoleSchema,
  InsertRoleInput,
  UpdateRoleInput,
  AssignAuthoritiesInput,
  AssignUserRoleInput
} from "@/lib/validators/role";

export type ActionResponse = {
  success: boolean;
  error?: string;
};

export async function createRoleAction(data: InsertRoleInput): Promise<ActionResponse> {
  try {
    const validatedData = insertRoleSchema.parse(data);
    await roleService.createRole(validatedData);
    revalidatePath("/admin/system/roles");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to create role:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create role" };
  }
}

export async function updateRoleAction(id: number, data: UpdateRoleInput): Promise<ActionResponse> {
  try {
    const validatedData = updateRoleSchema.parse(data);
    await roleService.updateRole(id, validatedData);
    revalidatePath("/admin/system/roles");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update role:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update role" };
  }
}

export async function deleteRoleAction(id: number): Promise<ActionResponse> {
  try {
    await roleService.deleteRole(id);
    revalidatePath("/admin/system/roles");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to delete role:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete role" };
  }
}

export async function updateRoleAuthoritiesAction(data: AssignAuthoritiesInput): Promise<ActionResponse> {
  try {
    const validatedData = assignAuthoritiesSchema.parse(data);
    await roleService.updateRoleAuthorities(validatedData.roleId, validatedData.authorityIds);
    revalidatePath("/admin/system/roles");
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update role authorities:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update role authorities" };
  }
}

export async function updateUserRolesAction(data: AssignUserRoleInput): Promise<ActionResponse> {
  try {
    const validatedData = assignUserRoleSchema.parse(data);
    await roleService.updateUserRoles(validatedData.userId, validatedData.roleIds);
    revalidatePath("/admin/accounts"); // Or wherever the user management is
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update user roles:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update user roles" };
  }
}

export async function getRolesAction() {
  try {
    return await roleService.getRoles();
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    return [];
  }
}

export async function getUserRolesAction(userId: string) {
  try {
    const userRoles = await roleService.getUserRoles(userId);
    return userRoles.map(r => r.systemRole);
  } catch (error) {
    console.error("Failed to fetch user roles:", error);
    return [];
  }
}
