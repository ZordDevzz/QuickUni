import { getAuthSession } from "@/services/auth/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">User Profile</h1>
      <div className="bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Name:</label>
          <p className="text-lg">{session.user?.name}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Email:</label>
          <p className="text-lg">{session.user?.email}</p>
        </div>
      </div>
    </div>
  );
}
