import { redirect } from "next/navigation";

export default async function ProfilesPage() {
  redirect("/admin/students");
}