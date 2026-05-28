import { db } from "@/db";
import { profile } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";

export const getProfiles = async () => {
  return await db.query.profile.findMany({
    where: isNull(profile.deletedAt),
    orderBy: (profile, { desc }) => [desc(profile.createAt)],
    with: {
      account: true,
      students: {
        with: {
          mainClassMembers: {
            with: {
              mainClass: {
                with: {
                  major: {
                    with: {
                      department: true,
                    }
                  }
                }
              }
            }
          }
        }
      },
      employees: true,
      profileSchema: true,
    }
  });
};

export const getStudentProfiles = async () => {
  const profiles = await getProfiles();
  return profiles.filter(p => {
    const isStudentSchema = p.profileSchema?.schemaCode?.startsWith("STD");
    const hasStudentRelation = p.students && p.students.length > 0;
    return hasStudentRelation || isStudentSchema;
  });
};

export const getPersonnelProfiles = async () => {
  const profiles = await getProfiles();
  return profiles.filter(p => {
    const isStudentSchema = p.profileSchema?.schemaCode?.startsWith("STD");
    const hasStudentRelation = p.students && p.students.length > 0;
    return !hasStudentRelation && !isStudentSchema;
  });
};

export const getProfileByAccountId = async (accountId: string) => {
  const data = await db.query.profile.findFirst({
    where: eq(profile.accountId, accountId),
  });
  return data;
};

export const updateProfile = async (id: string, data: Partial<typeof profile.$inferInsert>) => {
  const [updated] = await db
    .update(profile)
    .set({
      ...data,
      updateAt: new Date().toISOString(),
    })
    .where(eq(profile.id, id))
    .returning();
  return updated;
};