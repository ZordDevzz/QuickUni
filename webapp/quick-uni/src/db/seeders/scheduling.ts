import { db } from "../index";
import { courseClass, courseClassType, weeklyTemplate } from "../schema";
import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";

export const seedScheduling = async (semesterId: number, subjects: any[], teachers: any[], rooms: any[]) => {
  console.log("🗓️ Seeding scheduling data...");
  
  // 1. Ensure course class types exist
  const classTypes = [
    { id: 1, code: "LEC", name: "Lecture", des: "Theoretical session" },
    { id: 2, code: "LAB", name: "Laboratory", des: "Practical session" },
  ];
  await db.insert(courseClassType).values(classTypes).onConflictDoNothing();

  // 2. Create Course Classes
  for (const s of subjects) {
    const classId = randomUUID();
    const teacher = faker.helpers.arrayElement(teachers);
    
    await db.insert(courseClass).values({
      id: classId,
      code: `${s.code}-L01`,
      subjectId: s.id,
      semesterId: semesterId,
      teacherId: teacher.id,
      type: 1, // Lecture
      cap: 40,
      status: "opened",
    });

    // 3. Create Weekly Template
    const startPeriod = faker.number.int({ min: 1, max: 5 });
    const duration = 3;
    await db.insert(weeklyTemplate).values({
      courseClassId: classId,
      roomId: faker.helpers.arrayElement(rooms).id,
      dayOfWeek: faker.number.int({ min: 1, max: 6 }),
      startPeriod: startPeriod,
      endPeriod: startPeriod + duration - 1,
      occupyMask: 0x07 << (startPeriod - 1), // Simple bitmask
    });
  }
  console.log("✅ Scheduling data seeded.");
};
