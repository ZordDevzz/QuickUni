import { db } from "../index";
import { 
  systemRole, 
  account, 
  userSystemRole, 
  profileSchema, 
  profileField, 
  profileSchemaField,
  profileSection,
  systemSetting,
  enrollStatus,
  classRole,
  gradeScale,
  scheduleType,
  scheduleStatus
} from "../schema";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { sql } from "drizzle-orm";

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

  // 2. Admin Account (Static UUID to preserve developer login sessions across database reseeding)
  const adminId = "f90abb36-d7b2-47a3-84f4-f9c7b977a9a7";
  const [adminAccount] = await db.insert(account).values({
    id: adminId,
    username: "admin",
    pwdHash: await hash("QuickUni@2026", 10),
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
    des: "Standard Student Profile V1",
    createAt: new Date().toISOString(),
  }).returning();

  const [empSchema] = await db.insert(profileSchema).values({
    schemaCode: "EMP_V1",
    effectiveDate: new Date().toISOString().split('T')[0],
    des: "Standard Employee Profile V1",
    createAt: new Date().toISOString(),
  }).returning();

  // 3.5. Profile Sections
  const [studentSection] = await db.insert(profileSection).values({
    schemaId: schema.id,
    name: "Thông tin thanh toán",
    order: 1,
  }).returning();

  const [employeeSection] = await db.insert(profileSection).values({
    schemaId: empSchema.id,
    name: "Thông tin thanh toán",
    order: 1,
  }).returning();

  // 4. Profile Fields
  const fields = [
    { name: "bank_name", datatype: "string", uiSection: "banking", label: "Tên ngân hàng", des: "Tên ngân hàng nhận học bổng / lương", createAt: new Date().toISOString() },
    { name: "bank_account", datatype: "string", uiSection: "banking", label: "Số tài khoản ngân hàng", des: "Số tài khoản ngân hàng nhận học bổng / lương", createAt: new Date().toISOString() },
  ];
  const insertedFields = await db.insert(profileField).values(fields).returning();

  // 5. Link Fields to Schema
  const schemaFieldsToInsert: any[] = [];
  insertedFields.forEach((f, i) => {
    schemaFieldsToInsert.push({
      fieldId: f.id,
      schemaId: schema.id,
      sectionId: studentSection.id,
      order: i * 2,
      isRequired: false, // Optional as requested (not required)
    });
    schemaFieldsToInsert.push({
      fieldId: f.id,
      schemaId: empSchema.id,
      sectionId: employeeSection.id,
      order: i * 2 + 1,
      isRequired: false, // Optional as requested (not required)
    });
  });
  await db.insert(profileSchemaField).values(schemaFieldsToInsert);

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
  // 11. Default Schema IDs & Auto Code Rules in System Settings
  await db.insert(systemSetting).values([
    {
      key: "DEFAULT_STUDENT_SCHEMA_ID",
      value: schema.id,
      displayName: "Default Student Profile Structure",
      des: "System default profile schema ID for students",
      isSensitive: false,
    },
    {
      key: "DEFAULT_EMPLOYEE_SCHEMA_ID",
      value: empSchema.id,
      displayName: "Default Employee Profile Structure",
      des: "System default profile schema ID for employees/teachers",
      isSensitive: false,
    },
    {
      key: "AUTO_STUDENT_CODE_RULE",
      value: {
        prefix: "SV",
        hasYear: true,
        yearFormat: "YY",
        seqPadding: 4,
        currentSeq: 1000,
        isActive: true,
      },
      displayName: "Student Auto Code Generation Rule",
      des: "Automatic student code generation rules and sequence tracking",
      isSensitive: false,
    },
    {
      key: "AUTO_EMPLOYEE_CODE_RULE",
      value: {
        prefix: "NV",
        hasYear: true,
        yearFormat: "YY",
        seqPadding: 4,
        currentSeq: 1000,
        isActive: true,
      },
      displayName: "Employee Auto Code Generation Rule",
      des: "Automatic employee code generation rules and sequence tracking",
      isSensitive: false,
    }
  ]).onConflictDoUpdate({
    target: systemSetting.key,
    set: { value: sql`excluded.value` }
  });

  console.log("✅ System data seeded.");
  return { 
    studentSchemaId: schema.id, 
    employeeSchemaId: empSchema.id, 
    roles: { admin: 1, teacher: 2, student: 3, academic_office: 4 } 
  };
};
