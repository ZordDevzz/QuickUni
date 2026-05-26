import { db } from "../index";
import { 
  courseClass, 
  courseClassType, 
  weeklyTemplate, 
  enrollment,
  grade,
  request,
  profile,
  account
} from "../schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

export const seedScheduling = async (
  semesterId: number, 
  subjects: any[], 
  teachers: any[], 
  rooms: any[],
  students: any[]
) => {
  console.log("🗓️ Seeding scheduling data (classes, templates, enrollments, grades, requests)...");
  
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

  // Find academic staff account for request approvals
  const accountsList = await db.select().from(account);
  const academicAccount = accountsList.find(a => a.username === "academic")!;

  // 2. Map subjects to realistic classes and templates
  const fitiClasses = ["IT301", "IT302", "IT303", "IT304", "IT401"];
  const fetClasses = ["IT304"];
  
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
      currentSlot: 0 // Will update after enrollment
    });

    const duration = c.end - c.start + 1;
    const occupyMask = ((1 << duration) - 1) << (c.start - 1);

    await db.insert(weeklyTemplate).values({
      id: randomUUID(),
      courseClassId: classId,
      roomId: roomRecord.id,
      dayOfWeek: c.day,
      startPeriod: c.start,
      endPeriod: c.end,
      occupyMask: occupyMask
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
      const [enrollRecord] = await db.insert(enrollment).values({
        status: 1, // APPROVED
        studentId: stud.id,
        courseClassId: cc.id
      }).returning();

      // Seed Grade for some finished parts of IT301, IT302, MATH101, BA101
      if (["IT301", "IT302", "MATH101", "BA101"].includes(cc.subjCode)) {
        // Chuyên cần (CC) - 100% attendance generally
        await db.insert(grade).values({
          enrollmentId: enrollRecord.id,
          typeId: 1, // CC
          score: (9 + Math.floor(Math.random() * 2)).toString() // 9 or 10
        });

        // Giữa kỳ (GK) - randomly scored
        if (Math.random() > 0.15) {
          const gkScore = (6 + Math.random() * 4).toFixed(1); // 6.0 to 10.0
          await db.insert(grade).values({
            enrollmentId: enrollRecord.id,
            typeId: 2, // GK
            score: gkScore
          });
        }
      }
    }
  }

  // Update currentSlot on course classes
  for (const cc of createdClasses) {
    const enrolls = await db.select().from(enrollment).where(eq(enrollment.courseClassId, cc.id));
    const count = enrolls.length;
    await db.update(courseClass).set({ currentSlot: count }).where(eq(courseClass.id, cc.id));
  }

  // 4. Seed Requests (student leave & teacher rescheduling)
  console.log("📬 Seeding requests for testing...");
  
  const cnttClass = createdClasses.find(cc => cc.code === "IT301-L01")!;
  const csdlClass = createdClasses.find(cc => cc.code === "IT302-L01")!;

  // Request 1: Pending Student Absence Request
  const student1 = students[0];
  const stud1AccountId = getAccountIdByProfileId(student1.profileId);
  if (stud1AccountId) {
    await db.insert(request).values({
      id: randomUUID(),
      senderId: stud1AccountId,
      type: "student_absence",
      status: "pending",
      targetId: cnttClass.id,
      data: {
        reason: "Em bị sốt xuất huyết cấp tính phải điều trị tại bệnh viện, xin phép nghỉ học buổi thứ hai.",
        date: "2025-09-10",
        periods: "1-3"
      }
    });
  }

  // Request 2: Approved Student Absence Request
  const student2 = students[1];
  const stud2AccountId = getAccountIdByProfileId(student2.profileId);
  if (stud2AccountId) {
    await db.insert(request).values({
      id: randomUUID(),
      senderId: stud2AccountId,
      type: "student_absence",
      status: "approved",
      targetId: csdlClass.id,
      data: {
        reason: "Em xin phép vắng mặt để đại diện trường tham gia vòng chung kết cuộc thi lập trình Olympic Tin học.",
        date: "2025-09-17",
        periods: "1-3"
      },
      comment: "Đã phê duyệt. Sinh viên chú ý ôn bài đầy đủ.",
      processedAt: new Date().toISOString(),
      processedBy: academicAccount.id
    });
  }

  // Request 3: Pending Teacher Rescheduling Request
  const teacher1 = teachers[0]; // Nguyễn Văn An
  const teacher1AccountId = getAccountIdByProfileId(teacher1.profileId);
  if (teacher1AccountId) {
    await db.insert(request).values({
      id: randomUUID(),
      senderId: teacher1AccountId,
      type: "teacher_schedule_change",
      status: "pending",
      targetId: cnttClass.id,
      data: {
        reason: "Giảng viên bận tham gia hội thảo khoa học cấp Quốc gia tổ chức tại Đà Nẵng.",
        originalDay: 1, // Thứ 2
        originalPeriods: "1-3",
        originalRoom: "A-101",
        proposedDay: 5, // Thứ 6
        proposedPeriods: "7-9",
        proposedRoom: "A-101"
      }
    });
  }

  console.log("✅ Scheduling, enrollments, grades, and requests seeded.");
};
