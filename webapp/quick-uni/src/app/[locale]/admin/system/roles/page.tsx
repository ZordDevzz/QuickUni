import { getRoles, getAllAuthorities } from "@/services/role";
import { RoleClient } from "./RoleClient";

export default async function RolesPage() {
  const roles = await getRoles();
  const authorities = await getAllAuthorities();

  return (
    <RoleClient roles={roles} authorities={authorities} />
  );
}
