import { getAuthSession } from "@/services/auth";
import { getProfileByAccountId } from "@/services/profile";
import { db } from "@/db";
import { profileSchemaField } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AccountClient } from "./AccountClient";

export default async function AccountPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userProfile = await getProfileByAccountId(session.user.id);
  
  if (!userProfile) {
    // Should not happen for active users but handle it
    return <div>Profile not found. Please contact support.</div>;
  }

  // Fetch fields for this schema
  const schemaFields = await db.query.profileSchemaField.findMany({
    where: eq(profileSchemaField.schemaId, userProfile.schemaId),
    with: {
      profileField: true,
    }
  });

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      <AccountClient 
        profile={userProfile} 
        schemaFields={schemaFields.map(sf => ({
          ...sf.profileField,
          isRequired: sf.isRequired
        }))} 
      />
    </div>
  );
}
