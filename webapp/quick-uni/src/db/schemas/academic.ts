import {
  pgTable,
  bigint,
  boolean,
  varchar,
  foreignKey,
  uuid,
  timestamp,
  text,
  unique,
  smallint,
  serial,
  smallserial,
  date,
  integer,
  primaryKey
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const semester = pgTable(
  "semester",
  {
    id: smallserial().primaryKey().notNull(),
    code: varchar({ length: 30 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    academicYear: smallint("academic_year").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    isCurrent: boolean("is_current").default(false),
  },
  (table) => [unique("semester_code_key").on(table.code)],
);

export const department = pgTable(
  "department",
  {
    id: uuid().primaryKey().notNull(),
    code: varchar({ length: 30 }),
    name: varchar({ length: 255 }).notNull(),
    des: varchar({ length: 512 }),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [unique("department_code_key").on(table.code)],
);

export const major = pgTable(
  "major",
  {
    id: uuid().primaryKey().notNull(),
    code: varchar({ length: 30 }).notNull(),
    des: varchar({ length: 512 }),
    departmentId: uuid("department_id").notNull(),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.departmentId],
      foreignColumns: [department.id],
      name: "fk_major_department_id_department_id",
    }),
    unique("major_code_key").on(table.code),
  ],
);

export const curriculum = pgTable(
  "curriculum",
  {
    id: serial().primaryKey().notNull(),
    majorId: uuid("major_id").notNull(),
    code: varchar({ length: 50 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    academicYear: smallint("academic_year").notNull(),
    totalCredits: smallint("total_credits"),
    des: text(),
    createAt: timestamp("create_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.majorId],
      foreignColumns: [major.id],
      name: "fk_curriculum_major_id_major_id",
    }),
    unique("curriculum_code_key").on(table.code),
  ],
);

export const subject = pgTable(
  "subject",
  {
    id: uuid().primaryKey().notNull(),
    code: varchar({ length: 30 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    credits: smallint().notNull(),
    des: varchar({ length: 255 }),
    recommendedSemesterIndex: smallint("recommended_semester_index"),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [unique("subject_code_key").on(table.code)],
);

export const subjectPrerequisite = pgTable(
  "subject_prerequisite",
  {
    subjectId: uuid("subject_id").notNull(),
    prerequisiteId: uuid("prerequisite_id").notNull(),
    type: varchar({ length: 50 }),
  },
  (table) => [
    foreignKey({
      columns: [table.prerequisiteId],
      foreignColumns: [subject.id],
      name: "fk_subject_prerequisite_prerequisite_id_subject_id",
    }),
    foreignKey({
      columns: [table.subjectId],
      foreignColumns: [subject.id],
      name: "fk_subject_prerequisite_subject_id_subject_id",
    }),
    primaryKey({
      columns: [table.subjectId, table.prerequisiteId],
      name: "subject_prerequisite_pkey",
    }),
  ],
);

export const knowledgeBlock = pgTable(
  "knowledge_block",
  {
    id: smallserial().primaryKey().notNull(),
    code: varchar({ length: 30 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    parentId: smallint("parent_id"),
    des: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "fk_knowledge_block_parent_id_knowledge_block_id",
    }),
    unique("knowledge_block_code_key").on(table.code),
  ],
);

export const curriculumSubject = pgTable(
  "curriculum_subject",
  {
    subjectId: uuid("subject_id").notNull(),
    curriculumId: integer("curriculum_id").notNull(),
    semesterIndex: smallint("semester_index"),
    isCompulsory: boolean("is_compulsory").default(true),
    knowledgeBlockId: smallint("knowledge_block_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.curriculumId],
      foreignColumns: [curriculum.id],
      name: "fk_curriculum_subject_curriculum_id_curriculum_id",
    }),
    foreignKey({
      columns: [table.knowledgeBlockId],
      foreignColumns: [knowledgeBlock.id],
      name: "fk_curriculum_subject_knowledge_block_id_knowledge_block_id",
    }),
    foreignKey({
      columns: [table.subjectId],
      foreignColumns: [subject.id],
      name: "fk_curriculum_subject_subject_id_subject_id",
    }),
    primaryKey({
      columns: [table.subjectId, table.curriculumId],
      name: "curriculum_subject_pkey",
    }),
  ],
);

export const educationType = pgTable("education_type", {
  id: smallserial().primaryKey().notNull(),
  code: varchar({ length: 30 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  des: varchar({ length: 512 }),
  length: smallint().notNull(),
});

export const registrationPeriod = pgTable(
  "registration_period",
  {
    id: serial().primaryKey().notNull(),
    semesterId: smallint("semester_id").notNull(),
    name: varchar({ length: 255 }),
    startAt: timestamp("start_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    endAt: timestamp("end_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    foreignKey({
      columns: [table.semesterId],
      foreignColumns: [semester.id],
      name: "fk_registration_period_semester_id_semester_id",
    }),
  ],
);
