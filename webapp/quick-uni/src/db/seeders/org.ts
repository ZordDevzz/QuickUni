import { db } from "../index";
import { department, major } from "../schema";
import { building, room } from "../schema";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

export const seedOrg = async () => {
  console.log("🏢 Seeding organization data...");

  // 1. Departments
  const depts = Array.from({ length: 5 }).map(() => ({
    id: randomUUID(),
    name: `Department of ${faker.commerce.department()}`,
    code: faker.string.alphanumeric(5).toUpperCase(),
    des: faker.lorem.sentence(),
  }));
  const insertedDepts = await db.insert(department).values(depts).returning();

  // 2. Majors
  const majors = insertedDepts.flatMap((d) =>
    Array.from({ length: 2 }).map(() => ({
      id: randomUUID(),
      departmentId: d.id,
      code: faker.string.alphanumeric(5).toUpperCase(),
      des: `Major in ${faker.commerce.productName()}`,
    }))
  );
  const insertedMajors = await db.insert(major).values(majors).returning();

  // 3. Buildings
  const buildings = Array.from({ length: 3 }).map(() => ({
    code: faker.string.alphanumeric(3).toUpperCase(),
    name: `Building ${faker.string.alpha(1).toUpperCase()}`,
    des: faker.lorem.sentence(),
  }));
  const insertedBuildings = await db.insert(building).values(buildings).returning();

  // 4. Rooms
  const rooms = insertedBuildings.flatMap((b) =>
    Array.from({ length: 5 }).map(() => ({
      code: `${b.code}-${faker.number.int({ min: 100, max: 999 })}`,
      buildingId: b.id,
      capacity: faker.number.int({ min: 20, max: 100 }),
      type: faker.helpers.arrayElement(["Lecture Hall", "Lab", "Classroom"]),
    }))
  );
  const insertedRooms = await db.insert(room).values(rooms).returning();

  console.log("✅ Organization data seeded.");
  return { departments: insertedDepts, majors: insertedMajors, rooms: insertedRooms };
};
