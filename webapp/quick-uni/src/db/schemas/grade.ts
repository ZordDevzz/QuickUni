import {
  pgTable,
  bigint,
  varchar,
  foreignKey,
  uuid,
  numeric,
  timestamp,
  index,
  bigserial,
  uniqueIndex,
  smallint,
  smallserial,
  primaryKey
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { employee } from "./user";
import { enrollment, assignment } from "./course";

export const gradeType = pgTable("grade_type", {
  id: bigint({ mode: "number" }).primaryKey().notNull(),
  code: varchar({ length: 30 }).notNull(),
  weight: smallint().notNull(),
  name: varchar({ length: 255 }),
});

export const grade = pgTable(
  "grade",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    enrollmentId: bigint("enrollment_id", { mode: "number" }).notNull(),
    typeId: bigint("type_id", { mode: "number" }).notNull(),
    assignmentId: bigint("assignment_id", { mode: "number" }),
    score: numeric({ precision: 5, scale: 2 }).notNull(),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("grade_idx_grade_enrollment_id").using(
      "btree",
      table.enrollmentId.asc().nullsLast().op("int8_ops"),
    ),
    uniqueIndex("grade_idx_grade_unique_entry").using(
      "btree",
      table.enrollmentId.asc().nullsLast().op("int8_ops"),
      table.typeId.asc().nullsLast().op("int8_ops"),
      table.assignmentId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.assignmentId],
      foreignColumns: [assignment.id],
      name: "fk_grade_assignment_id_assignment_id",
    }),
    foreignKey({
      columns: [table.enrollmentId],
      foreignColumns: [enrollment.id],
      name: "fk_grade_enrollment_id_enrollment_id",
    }),
    foreignKey({
      columns: [table.typeId],
      foreignColumns: [gradeType.id],
      name: "fk_grade_type_id_grade_type_id",
    }),
  ],
);

export const gradeAudit = pgTable(
  "grade_audit",
  {
    id: bigint({ mode: "number" }).primaryKey().notNull(),
    gradeId: bigint("grade_id", { mode: "number" }).notNull(),
    changeBy: uuid("change_by").notNull(),
    oldScore: numeric("old_score", { precision: 5, scale: 2 }).notNull(),
    newScore: numeric("new_score", { precision: 5, scale: 2 }),
    changeAt: timestamp("change_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.changeBy],
      foreignColumns: [employee.id],
      name: "fk_grade_audit_change_by_employee_id",
    }),
    foreignKey({
      columns: [table.gradeId],
      foreignColumns: [grade.id],
      name: "fk_grade_audit_grade_id_grade_id",
    }),
  ],
);

export const gradeScale = pgTable("grade_scale", {
  id: smallserial().primaryKey().notNull(),
  minScore10: numeric("min_score_10", { precision: 4, scale: 2 }),
  letterGrade: varchar("letter_grade", { length: 5 }),
  gpaScore4: numeric("gpa_score_4", { precision: 4, scale: 2 }),
  des: varchar({ length: 100 }),
});
