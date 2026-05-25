"use server";

import { db } from "@/db";
import { profile, employee, student } from "@/db/schemas/user";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function createPerson(type: "employee" | "student", data: any) {
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
