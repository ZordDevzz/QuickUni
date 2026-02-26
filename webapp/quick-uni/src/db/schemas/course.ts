import {
  pgSchema,
  bigint,
  varchar,
  foreignKey,
  uuid,
  timestamp,
  text,
  unique,
  smallint,
  jsonb,
  smallserial,
  uniqueIndex,
  primaryKey,
  bigserial
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { semester, educationType, major, subject } from "./academic";
import { employee, student } from "./user";

export const courseSchema = pgSchema("course");

export const courseClassType = courseSchema.table(
  "course_class_type",
  {
    id: smallint().primaryKey().notNull(),
    code: varchar({ length: 30 }).notNull(),
    name: varchar({ length: 255 }),
    des: text(),
  },
  (table) => [unique("course_class_type_code_key").on(table.code)],
);

export const courseClass = courseSchema.table(
  "course_class",
  {
    id: uuid().primaryKey().notNull(),
    code: varchar({ length: 30 }).notNull(),
    teacherId: uuid("teacher_id").notNull(),
    subjectId: uuid("subject_id").notNull(),
    cap: smallint().default(30).notNull(),
    currentSlot: smallint("current_slot").default(0).notNull(),
    status: varchar({ length: 20 }).default("opened"),
    type: smallint().notNull(),
    semesterId: smallint("semester_id").notNull(),
    createAt: timestamp("create_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.type],
      foreignColumns: [courseClassType.id],
      name: "fk_course_class_type_course_class_type_id",
    }),
    foreignKey({
      columns: [table.teacherId],
      foreignColumns: [employee.id],
      name: "fk_course_class_teacher_id_employee_id",
    }),
    foreignKey({
      columns: [table.semesterId],
      foreignColumns: [semester.id],
      name: "fk_course_class_semester_id_semester_id",
    }),
    foreignKey({
      columns: [table.subjectId],
      foreignColumns: [subject.id],
      name: "fk_course_class_subject_id_subject_id",
    }),
    unique("course_class_code_key").on(table.code),
  ],
);

export const mainClass = courseSchema.table(
  "main_class",
  {
    id: uuid().primaryKey().notNull(),
    code: varchar({ length: 30 }).notNull(),
    teacher: uuid().notNull(),
    typeId: smallint("type_id"),
    majorId: uuid("major_id").notNull(),
    academicYear: smallint("academic_year").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.typeId],
      foreignColumns: [educationType.id],
      name: "fk_main_class_type_id_education_type_id",
    }),
    foreignKey({
      columns: [table.teacher],
      foreignColumns: [employee.id],
      name: "fk_main_class_teacher_employee_id",
    }),
    foreignKey({
      columns: [table.majorId],
      foreignColumns: [major.id],
      name: "fk_main_class_major_id_major_id",
    }),
    unique("main_class_code_key").on(table.code),
  ],
);

export const classRole = courseSchema.table("class_role", {
  id: smallserial().primaryKey().notNull(),
  code: varchar({ length: 30 }).notNull(),
  name: varchar({ length: 255 }),
  des: varchar({ length: 255 }),
});

export const mainClassMember = courseSchema.table(
  "main_class_member",
  {
    studentId: uuid("student_id").notNull(),
    roleId: smallint("role_id"),
    classId: uuid("class_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.classId],
      foreignColumns: [mainClass.id],
      name: "fk_main_class_member_class_id_main_class_id",
    }),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [classRole.id],
      name: "fk_main_class_member_role_id_class_role_id",
    }),
    foreignKey({
      columns: [table.studentId],
      foreignColumns: [student.id],
      name: "fk_main_class_member_student_id_student_id",
    }),
    primaryKey({
      columns: [table.studentId, table.classId],
      name: "main_class_member_pkey",
    }),
  ],
);

export const courseMaterial = courseSchema.table(
  "course_material",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    courseClassId: uuid("course_class_id").notNull(),
    title: varchar({ length: 255 }).notNull(),
    fileUrl: text("file_url").notNull(),
    uploadBy: uuid("upload_by"),
    createAt: timestamp("create_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.courseClassId],
      foreignColumns: [courseClass.id],
      name: "fk_course_material_course_class_id_course_class_id",
    }),
    foreignKey({
      columns: [table.uploadBy],
      foreignColumns: [employee.id],
      name: "fk_course_material_upload_by_employee_id",
    }),
  ],
);

export const assignment = courseSchema.table(
  "assignment",
  {
    id: bigint({ mode: "number" }).primaryKey().notNull(),
    title: varchar({ length: 512 }),
    data: jsonb(),
    courseClassId: uuid("course_class_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.courseClassId],
      foreignColumns: [courseClass.id],
      name: "fk_assignment_course_class_id_course_class_id",
    }),
  ],
);

export const enrollStatus = courseSchema.table("enroll_status", {
  id: smallint().primaryKey().notNull(),
  code: varchar({ length: 30 }),
  name: varchar({ length: 255 }),
});

export const enrollment = courseSchema.table(
  "enrollment",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    status: smallint(),
    studentId: uuid("student_id").notNull(),
    courseClassId: uuid("course_class_id").notNull(),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    uniqueIndex("enrollment_enrollment_index_0").using(
      "btree",
      table.studentId.asc().nullsLast().op("uuid_ops"),
      table.courseClassId.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.courseClassId],
      foreignColumns: [courseClass.id],
      name: "fk_enrollment_course_class_id_course_class_id",
    }),
    foreignKey({
      columns: [table.status],
      foreignColumns: [enrollStatus.id],
      name: "fk_enrollment_status_enroll_status_id",
    }),
    foreignKey({
      columns: [table.studentId],
      foreignColumns: [student.id],
      name: "fk_enrollment_student_id_student_id",
    }),
  ],
);
