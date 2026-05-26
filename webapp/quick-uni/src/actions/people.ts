"use server";

import { db } from "@/db";
import { profile, employee, student } from "@/db/schemas/user";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export type PersonInput = {
  fullname: string;
  gender: 'male' | 'female' | 'others';
  dob: string;
  nationalId: string;
  schemaId: number;
  dynamicData?: Record<string, unknown>;
  address?: string;
  countryCode?: string;
  ethnic?: string;
  religious?: string;
  code: string;
};

export async function createPerson(type: 'employee' | 'student', data: PersonInput) {
  return await db.transaction(async (tx) => {
    const profileId = randomUUID();

    // 1. Create Profile
    await tx.insert(profile).values({
      id: profileId,
      fullname: data.fullname,
      gender: data.gender,
      dob: data.dob,
      nationalId: data.nationalId,
      schemaId: data.schemaId,
      dynamicData: data.dynamicData || {},
      address: data.address,
      countryCode: data.countryCode,
      ethnic: data.ethnic,
      religious: data.religious,
    });

    // 2. Create Entity
    if (type === "employee") {
      await tx.insert(employee).values({
        id: randomUUID(),
        code: data.code,
        profileId: profileId,
      });
    } else {
      await tx.insert(student).values({
        id: randomUUID(),
        code: data.code,
        profileId: profileId,
      });
    }

    revalidatePath(`/[locale]/academic/people/${type}s`, "page");
    return { success: true };
  });
}

export async function updatePerson(type: "employee" | "student", id: string, data: PersonInput) {
  return await db.transaction(async (tx) => {
    // 1. Get current entity to find profileId
    const entity = type === "employee" 
      ? await tx.query.employee.findFirst({ where: eq(employee.id, id) })
      : await tx.query.student.findFirst({ where: eq(student.id, id) });
    
    if (!entity || !entity.profileId) return { success: false, error: "Not found" };

    // 2. Update Profile
    await tx.update(profile).set({
      fullname: data.fullname,
      gender: data.gender,
      dob: data.dob,
      nationalId: data.nationalId,
      dynamicData: data.dynamicData || {},
      address: data.address,
      countryCode: data.countryCode,
      ethnic: data.ethnic,
      religious: data.religious,
      updateAt: new Date().toISOString(),
    }).where(eq(profile.id, entity.profileId));

    // 3. Update Entity
    if (type === "employee") {
      await tx.update(employee).set({
        code: data.code,
        updateAt: new Date().toISOString(),
      }).where(eq(employee.id, id));
    } else {
      await tx.update(student).set({
        code: data.code,
        updateAt: new Date().toISOString(),
      }).where(eq(student.id, id));
    }

    revalidatePath(`/[locale]/academic/people/${type}s`, "page");
    return { success: true };
  });
}

export async function getPeople(type: "employee" | "student") {
  if (type === "employee") {
    return await db.query.employee.findMany({
      with: {
        profile: true,
      },
      orderBy: (e, { desc }) => [desc(e.createAt)],
    });
  } else {
    return await db.query.student.findMany({
      with: {
        profile: true,
      },
      orderBy: (s, { desc }) => [desc(s.createAt)],
    });
  }
}
