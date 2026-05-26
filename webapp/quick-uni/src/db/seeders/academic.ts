import { db } from "../index";
import { semester, subject, gradeType } from "../schema";
import { randomUUID } from "crypto";

export const seedAcademic = async () => {
  console.log("📚 Seeding academic data (realistic semesters, subjects, grade types)...");
  
  // 1. Semesters
  const [currentSemester] = await db.insert(semester).values({
    name: "Học kỳ 1 năm học 2025-2026",
    code: "2025.1",
    academicYear: 2025,
    startDate: "2025-08-15",
    endDate: "2026-01-15",
    isCurrent: true,
  }).returning();

  await db.insert(semester).values({
    name: "Học kỳ 2 năm học 2025-2026",
    code: "2025.2",
    academicYear: 2025,
    startDate: "2026-02-15",
    endDate: "2026-07-15",
    isCurrent: false,
  }).onConflictDoNothing();

  // 2. Realistic Subjects
  const subjectsData = [
    { code: "IT301", name: "Cấu trúc dữ liệu và giải thuật", credits: 3, des: "Môn học cơ sở ngành CNTT về cấu trúc dữ liệu và phân tích thiết kế giải thuật." },
    { code: "IT302", name: "Cơ sở dữ liệu", credits: 3, des: "Môn học về thiết kế hệ cơ sở dữ liệu quan hệ, SQL, chuẩn hóa dữ liệu." },
    { code: "IT303", name: "Lập trình hướng đối tượng", credits: 3, des: "Lập trình hướng đối tượng nâng cao bằng Java/C++, các mẫu thiết kế OOP cơ bản." },
    { code: "IT304", name: "Mạng máy tính", credits: 3, des: "Kiến trúc mạng, giao thức TCP/IP, định tuyến, thiết kế mạng cục bộ." },
    { code: "MATH101", name: "Toán rời rạc", credits: 3, des: "Cơ sở logic toán, lý thuyết đồ thị, tổ hợp, đại số Boole." },
    { code: "BA101", name: "Quản trị học", credits: 2, des: "Cơ sở lý thuyết quản trị, các chức năng hoạch định, tổ chức, lãnh đạo, kiểm tra." },
    { code: "EL201", name: "Tiếng Anh chuyên ngành", credits: 2, des: "Nâng cao kỹ năng đọc hiểu tài liệu chuyên ngành CNTT, kỹ thuật bằng tiếng Anh." },
    { code: "IT401", name: "An toàn thông tin cơ bản", credits: 3, des: "Cơ sở mật mã học, các hình thức tấn công mạng và giải pháp phòng ngừa cơ bản." },
  ];

  const subjects = subjectsData.map(s => ({
    id: randomUUID(),
    code: s.code,
    name: s.name,
    credits: s.credits,
    des: s.des
  }));
  const insertedSubjects = await db.insert(subject).values(subjects).returning();

  // 3. Grade Types
  const gradeTypes = [
    { id: 1, code: "CC", weight: 10, name: "Chuyên cần" },
    { id: 2, code: "GK", weight: 30, name: "Giữa kỳ" },
    { id: 3, code: "CK", weight: 60, name: "Cuối kỳ" },
  ];
  await db.insert(gradeType).values(gradeTypes).onConflictDoNothing();

  console.log("✅ Academic data seeded.");
  return { semesterId: currentSemester.id, subjects: insertedSubjects };
};
