import { db } from "../index";
import { 
  systemRole, 
  account, 
  userSystemRole, 
  profileSchema, 
  profileField, 
  profileSchemaField,
  enrollStatus,
  classRole,
  gradeScale,
  scheduleType,
  scheduleStatus
} from "../schema";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";

export const seedSystem = async () => {
  console.log("⚙️ Seeding system data...");

  // 1. Roles
  const roles = [
    { id: 1, name: "Admin", isDefaultRole: false },
    { id: 2, name: "Teacher", isDefaultRole: false },
    { id: 3, name: "Student", isDefaultRole: true },
    { id: 4, name: "Academic Office", isDefaultRole: false },
  ];
  await db.insert(systemRole).values(roles).onConflictDoNothing();

  // 2. Admin Account
  const adminId = randomUUID();
  const [adminAccount] = await db.insert(account).values({
    id: adminId,
    username: "admin",
    pwdHash: await hash("admin", 10),
    type: "dev",
    status: "active",
    email: "admin@quickuni.edu.vn",
  }).onConflictDoNothing().returning();

  if (adminAccount) {
    await db.insert(userSystemRole).values({ userId: adminAccount.id, systemRole: 1 }).onConflictDoNothing();
  }

  // 3. Profile Schema
  const [schema] = await db.insert(profileSchema).values({
    schemaCode: "STD_V1",
    effectiveDate: new Date().toISOString().split('T')[0],
    des: "Standard University Profile V1",
    createAt: new Date().toISOString(),
  }).returning();

  // 4. Profile Fields
  const fields = [
    { name: "personal_email", datatype: "string", uiSection: "contact", label: "Personal Email", des: "External email address", createAt: new Date().toISOString() },
    { name: "phone", datatype: "string", uiSection: "contact", label: "Phone Number", des: "Contact phone", createAt: new Date().toISOString() },
  ];
  const insertedFields = await db.insert(profileField).values(fields).returning();

  // 5. Link Fields to Schema
  await db.insert(profileSchemaField).values(
    insertedFields.map((f, i) => ({
      fieldId: f.id,
      schemaId: schema.id,
      order: i,
      isRequired: true,
    }))
  );

  // 6. Enroll Statuses
  const enrollStatuses = [
    { id: 1, code: "APPROVED", name: "Đã duyệt" },
    { id: 2, code: "PENDING", name: "Đang chờ" },
    { id: 3, code: "CANCELLED", name: "Đã hủy" },
  ];
  await db.insert(enrollStatus).values(enrollStatuses).onConflictDoNothing();

  // 7. Class Roles
  const classRoles = [
    { id: 1, code: "MONITOR", name: "Lớp trưởng", des: "Người đứng đầu quản lý lớp sinh viên hành chính" },
    { id: 2, code: "VICE_MONITOR", name: "Lớp phó", des: "Hỗ trợ quản lý lớp sinh viên hành chính" },
    { id: 3, code: "MEMBER", name: "Thành viên", des: "Sinh viên trong lớp chính quy" },
  ];
  await db.insert(classRole).values(classRoles).onConflictDoNothing();

  // 8. Grade Scale
  const gradeScales = [
    { minScore10: "9.00", letterGrade: "A+", gpaScore4: "4.00", des: "Xuất sắc" },
    { minScore10: "8.50", letterGrade: "A", gpaScore4: "4.00", des: "Giỏi" },
    { minScore10: "8.00", letterGrade: "B+", gpaScore4: "3.50", des: "Khá giỏi" },
    { minScore10: "7.00", letterGrade: "B", gpaScore4: "3.00", des: "Khá" },
    { minScore10: "6.50", letterGrade: "C+", gpaScore4: "2.50", des: "Trung bình khá" },
    { minScore10: "5.50", letterGrade: "C", gpaScore4: "2.00", des: "Trung bình" },
    { minScore10: "5.00", letterGrade: "D+", gpaScore4: "1.50", des: "Trung bình yếu" },
    { minScore10: "4.00", letterGrade: "D", gpaScore4: "1.00", des: "Yếu" },
    { minScore10: "0.00", letterGrade: "F", gpaScore4: "0.00", des: "Kém" },
  ];
  await db.insert(gradeScale).values(gradeScales).onConflictDoNothing();

  // 9. Schedule Types
  const scheduleTypes = [
    { id: 1, code: "REGULAR",    name: "Lịch chính",   des: "Buổi học chính thức theo thời khóa biểu" },
    { id: 2, code: "MAKEUP",     name: "Lịch dạy bù",  des: "Buổi học bù hoặc thay thế" },
  ];
  await db.insert(scheduleType).values(scheduleTypes).onConflictDoNothing();

  // 10. Schedule Statuses
  const scheduleStatuses = [
    { id: 1, code: "NORMAL",    name: "Bình thường", isComplete: false },
    { id: 2, code: "CANCELLED", name: "Đã hủy",     isComplete: false },
  ];
  await db.insert(scheduleStatus).values(scheduleStatuses).onConflictDoNothing();

  console.log("✅ System data seeded.");
  return { schemaId: schema.id, roles: { admin: 1, teacher: 2, student: 3, academic_office: 4 } };
};
