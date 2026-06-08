import { db } from "../index";
import {
  courseClass,
  courseClassType,
  enrollment,
  request,
  profile
} from "../schema";
import { randomUUID } from "crypto";
import { eq, and, isNull } from "drizzle-orm";

export const seedScheduling = async (
  semesterId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subjects: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  teachers: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rooms: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  students: any[]
) => {
  console.log("🗓️ Seeding scheduling data (classes, enrollments, requests)...");

  // 1. Ensure course class types exist
  const classTypes = [
    { id: 1, code: "LEC", name: "Lecture", des: "Theoretical session" },
    { id: 2, code: "LAB", name: "Laboratory", des: "Practical session" },
  ];
  await db.insert(courseClassType).values(classTypes).onConflictDoNothing();

  // Helper to lookup accountId from profileId
  const profilesList = await db.select().from(profile);
  const getAccountIdByProfileId = (profileId: string | null) => {
    if (!profileId) return null;
    return profilesList.find(p => p.id === profileId)?.accountId || null;
  };

  // 2. Map subjects to realistic classes
  const classScheduleSetup = [
    // IT301: Cấu trúc dữ liệu và giải thuật
    { subjCode: "IT301", type: 1, teacherIdx: 0, roomCode: "A-101", day: 1, start: 1, end: 3 }, // Mon Period 1-3
    { subjCode: "IT301", type: 2, teacherIdx: 1, roomCode: "B-101", day: 2, start: 4, end: 6 }, // Tue Period 4-6
    // IT302: Cơ sở dữ liệu
    { subjCode: "IT302", type: 1, teacherIdx: 1, roomCode: "A-102", day: 3, start: 1, end: 3 }, // Wed Period 1-3
    { subjCode: "IT302", type: 2, teacherIdx: 0, roomCode: "B-102", day: 4, start: 1, end: 3 }, // Thu Period 1-3
    // IT303: Lập trình hướng đối tượng
    { subjCode: "IT303", type: 1, teacherIdx: 0, roomCode: "C-101", day: 5, start: 4, end: 6 }, // Fri Period 4-6
    { subjCode: "IT303", type: 2, teacherIdx: 1, roomCode: "B-101", day: 6, start: 1, end: 3 }, // Sat Period 1-3
    // IT304: Mạng máy tính
    { subjCode: "IT304", type: 1, teacherIdx: 2, roomCode: "A-201", day: 2, start: 1, end: 3 }, // Tue Period 1-3
    { subjCode: "IT304", type: 2, teacherIdx: 3, roomCode: "B-102", day: 3, start: 4, end: 6 }, // Wed Period 4-6
    // MATH101: Toán rời rạc
    { subjCode: "MATH101", type: 1, teacherIdx: 3, roomCode: "C-102", day: 4, start: 4, end: 6 }, // Thu Period 4-6
    // BA101: Quản trị học
    { subjCode: "BA101", type: 1, teacherIdx: 4, roomCode: "A-101", day: 1, start: 4, end: 5 }, // Mon Period 4-5
    // EL201: Tiếng Anh chuyên ngành
    { subjCode: "EL201", type: 1, teacherIdx: 6, roomCode: "C-101", day: 5, start: 1, end: 2 }, // Fri Period 1-2
    // IT401: An toàn thông tin cơ bản
    { subjCode: "IT401", type: 1, teacherIdx: 1, roomCode: "A-102", day: 3, start: 7, end: 9 }, // Wed Period 7-9
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createdClasses: any[] = [];

  for (const c of classScheduleSetup) {
    const subjectRecord = subjects.find(s => s.code === c.subjCode);
    if (!subjectRecord) continue;

    const teacherRecord = teachers[c.teacherIdx];
    const roomRecord = rooms.find(r => r.code === c.roomCode);
    if (!teacherRecord || !roomRecord) continue;

    const classId = randomUUID();
    const isLab = c.type === 2;

    await db.insert(courseClass).values({
      id: classId,
      code: `${c.subjCode}-${isLab ? "T" : "L"}01`,
      subjectId: subjectRecord.id,
      semesterId: semesterId,
      teacherId: teacherRecord.id,
      type: c.type,
      cap: isLab ? 30 : 40,
      status: "opened",
      currentSlot: 0, // Will update after enrollment
      startDate: "2026-02-15",
      endDate: "2026-08-31"
    });

    createdClasses.push({
      id: classId,
      code: `${c.subjCode}-${isLab ? "T" : "L"}01`,
      subjCode: c.subjCode,
      teacherId: teacherRecord.id
    });
  }

  // 3. Seed enrollments based on student cohort/major
  console.log("📝 Registering students and generating enrollments...");

  for (let sIdx = 0; sIdx < students.length; sIdx++) {
    const stud = students[sIdx];
    const isIT21 = sIdx < 12;      // First 12 students are CNTT/ATTT (cohort 2021)
    const isBA22 = sIdx >= 12 && sIdx < 18; // Next 6 are QTKD (cohort 2022)
    const isEL22 = sIdx >= 18;     // Last 6 are NNA (cohort 2022)

    let targetSubjCodes: string[] = [];
    if (isIT21) {
      targetSubjCodes = ["IT301", "IT302", "IT303", "IT304", "MATH101", "IT401"];
    } else if (isBA22) {
      targetSubjCodes = ["BA101", "EL201", "MATH101"];
    } else if (isEL22) {
      targetSubjCodes = ["EL201", "BA101"];
    }

    const classesToEnroll = createdClasses.filter(cc => targetSubjCodes.includes(cc.subjCode));

    for (const cc of classesToEnroll) {
      await db.insert(enrollment).values({
        status: 1, // APPROVED
        studentId: stud.id,
        courseClassId: cc.id
      });
    }
  }

  // Update currentSlot on course classes
  for (const cc of createdClasses) {
    const enrolls = await db.select().from(enrollment).where(and(eq(enrollment.courseClassId, cc.id), isNull(enrollment.deletedAt)));
    const count = enrolls.length;
    await db.update(courseClass).set({ currentSlot: count }).where(eq(courseClass.id, cc.id));
  }

  console.log("✅ Enrollments seeded.");
};
