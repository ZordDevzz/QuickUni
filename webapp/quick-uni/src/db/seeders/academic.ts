import { db } from "../index";
import { semester, subject } from "../schema";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

export const seedAcademic = async () => {
  console.log("📚 Seeding academic data...");
  const [currentSemester] = await db.insert(semester).values({
    name: "Học kỳ 1 năm học 2025-2026",
    code: "2025.1",
    academicYear: 2025,
    startDate: "2025-08-15",
    endDate: "2026-01-15",
    isCurrent: true,
  }).returning();

  const subjects = Array.from({ length: 10 }).map(() => ({
    id: randomUUID(),
    name: faker.company.catchPhrase(),
    code: faker.string.alphanumeric(6).toUpperCase(),
    credits: faker.number.int({ min: 2, max: 4 }),
    des: faker.lorem.sentence(),
  }));
  const insertedSubjects = await db.insert(subject).values(subjects).returning();

  console.log("✅ Academic data seeded.");
  return { semesterId: currentSemester.id, subjects: insertedSubjects };
};
