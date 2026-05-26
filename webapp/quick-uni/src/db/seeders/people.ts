import { db } from "../index";
import { account, profile, employee, student, userSystemRole } from "../schema";
import { hash } from "bcryptjs";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

export const seedPeople = async (schemaId: number, roles: any) => {
  console.log("👥 Seeding people...");
  const pwdHash = await hash("password123", 10);

  // 1. Teachers (Employees)
  for (let i = 0; i < 5; i++) {
    const accountId = randomUUID();
    const profileId = randomUUID();
    const email = faker.internet.email();
    
    await db.insert(account).values({ id: accountId, username: email, pwdHash, email, type: "employee", status: "active" });
    await db.insert(userSystemRole).values({ userId: accountId, systemRole: roles.teacher });
    await db.insert(profile).values({
      id: profileId, 
      accountId, 
      schemaId,
      fullname: faker.person.fullName(),
      gender: faker.helpers.arrayElement(["male", "female", "others"]),
      dob: faker.date.birthdate({ min: 25, max: 60, mode: 'age' }).toISOString().split('T')[0],
      nationalId: faker.string.numeric(12),
      dynamicData: { personal_email: email, phone: faker.phone.number() }
    });
    await db.insert(employee).values({ id: randomUUID(), profileId, code: `GV${faker.string.numeric(5)}` });
  }

  // 2. Students
  for (let i = 0; i < 20; i++) {
    const accountId = randomUUID();
    const profileId = randomUUID();
    const email = faker.internet.email();
    
    await db.insert(account).values({ id: accountId, username: email, pwdHash, email, type: "student", status: "active" });
    await db.insert(userSystemRole).values({ userId: accountId, systemRole: roles.student });
    await db.insert(profile).values({
      id: profileId, 
      accountId, 
      schemaId,
      fullname: faker.person.fullName(),
      gender: faker.helpers.arrayElement(["male", "female", "others"]),
      dob: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }).toISOString().split('T')[0],
      nationalId: faker.string.numeric(12),
      dynamicData: { personal_email: email, phone: faker.phone.number() }
    });
    await db.insert(student).values({ id: randomUUID(), profileId, code: `SV${faker.string.numeric(8)}` });
  }

  console.log("✅ People seeded.");
};
