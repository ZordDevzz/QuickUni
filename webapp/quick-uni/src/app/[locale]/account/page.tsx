import { getAuthSession } from "@/services/auth";
import { db } from "@/db";
import { profileSchemaField, profile, accountAudit } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AccountClient } from "./AccountClient";
import { getTranslations } from "next-intl/server";

export default async function AccountPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const t = await getTranslations("AccountSettings");
  
  // Fetch detailed profile with relations
  const userProfile = await db.query.profile.findFirst({
    where: eq(profile.accountId, session.user.id),
    with: {
      account: true,
      profileSchema: true,
      students: {
        with: {
          mainClassMembers: {
            with: {
              classRole: true,
              mainClass: {
                with: {
                  major: {
                    with: {
                      department: true,
                    }
                  },
                  educationType: true,
                }
              }
            }
          }
        }
      },
      employees: {
        with: {
          departmentEmployments: {
            with: {
              department: true,
            }
          }
        }
      }
    }
  });

  if (!userProfile) {
    return <div className="p-6 text-center">{t("ProfileNotFound")}</div>;
  }

  // Fetch fields for this schema
  const schemaFields = await db.query.profileSchemaField.findMany({
    where: eq(profileSchemaField.schemaId, userProfile.schemaId),
    with: {
      profileField: true,
    }
  });

  // Fetch recent security audit logs
  const recentAudits = await db.query.accountAudit.findMany({
    where: eq(accountAudit.accountId, session.user.id),
    orderBy: (audit, { desc }) => [desc(audit.createAt)],
    limit: 5,
  });

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex flex-col space-y-1 mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">{t("Title")}</h1>
        <p className="text-muted-foreground text-sm">{t("Description")}</p>
      </div>
      <AccountClient 
        profile={userProfile as any} 
        schemaFields={schemaFields.map(sf => ({
          ...sf.profileField,
          isRequired: sf.isRequired
        }))}
        recentAudits={recentAudits as any}
      />
    </div>
  );
}
