import {
  pgSchema,
  bigint,
  boolean,
  varchar,
  foreignKey,
  uuid,
  numeric,
  timestamp,
  index,
  unique,
  smallint,
  serial,
  smallserial,
  text,
  bigserial
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { enumDiscountType, enumPaymentStatus } from "./enums";
import { semester, major } from "./academic";
import { student } from "./user";
import { enrollment } from "./course";

export const financeSchema = pgSchema("finance");

export const scholarshipPolicy = financeSchema.table(
  "scholarship_policy",
  {
    id: smallserial().primaryKey().notNull(),
    code: varchar({ length: 50 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    type: enumDiscountType().notNull(),
    value: numeric({ precision: 15, scale: 2 }).notNull(),
    des: text(),
  },
  (table) => [unique("scholarship_policy_code_key").on(table.code)],
);

export const studentScholarship = financeSchema.table(
  "student_scholarship",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    studentId: uuid("student_id").notNull(),
    policyId: smallint("policy_id").notNull(),
    semesterId: smallint("semester_id").notNull(),
    isActive: boolean("is_active").default(true),
    grantDate: timestamp("grant_date", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_student_scholarship_student_id_semester_id").using(
      "btree",
      table.studentId.asc().nullsLast().op("uuid_ops"),
      table.semesterId.asc().nullsLast().op("int2_ops"),
    ),
    foreignKey({
      columns: [table.policyId],
      foreignColumns: [scholarshipPolicy.id],
      name: "fk_student_scholarship_policy_id_scholarship_policy_id",
    }),
    foreignKey({
      columns: [table.semesterId],
      foreignColumns: [semester.id],
      name: "fk_student_scholarship_semester_id_semester_id",
    }),
    foreignKey({
      columns: [table.studentId],
      foreignColumns: [student.id],
      name: "fk_student_scholarship_student_id_student_id",
    }),
  ],
);

export const tuitionFeeConfig = financeSchema.table(
  "tuition_fee_config",
  {
    id: serial().primaryKey().notNull(),
    majorId: uuid("major_id"),
    academicYear: smallint("academic_year").notNull(),
    pricePerCredit: numeric("price_per_credit", {
      precision: 10,
      scale: 2,
    }).notNull(),
    note: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.majorId],
      foreignColumns: [major.id],
      name: "fk_tuition_fee_config_major_id_major_id",
    }),
  ],
);

export const invoice = financeSchema.table(
  "invoice",
  {
    id: uuid().primaryKey().notNull(),
    studentId: uuid("student_id").notNull(),
    semesterId: smallint("semester_id").notNull(),
    originalAmount: numeric("original_amount", {
      precision: 15,
      scale: 2,
    }).notNull(),
    discountAmount: numeric("discount_amount", {
      precision: 15,
      scale: 2,
    }).default("0"),
    finalAmount: numeric("final_amount", { precision: 15, scale: 2 }).notNull(),
    status: enumPaymentStatus(),
    createAt: timestamp("create_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.semesterId],
      foreignColumns: [semester.id],
      name: "fk_invoice_semester_id_semester_id",
    }),
    foreignKey({
      columns: [table.studentId],
      foreignColumns: [student.id],
      name: "fk_invoice_student_id_student_id",
    }),
  ],
);

export const invoiceDetail = financeSchema.table(
  "invoice_detail",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    invoiceId: uuid("invoice_id").notNull(),
    enrollmentId: bigint("enrollment_id", { mode: "number" }).notNull(),
    creditPrice: numeric("credit_price", { precision: 10, scale: 2 }).notNull(),
    subjectCredits: smallint("subject_credits").notNull(),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    note: varchar({ length: 255 }),
  },
  (table) => [
    foreignKey({
      columns: [table.enrollmentId],
      foreignColumns: [enrollment.id],
      name: "fk_invoice_detail_enrollment_id_enrollment_id",
    }),
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [invoice.id],
      name: "fk_invoice_detail_invoice_id_invoice_id",
    }),
    unique("invoice_detail_enrollment_id_key").on(table.enrollmentId),
  ],
);

export const transaction = financeSchema.table(
  "transaction",
  {
    id: uuid().primaryKey().notNull(),
    invoiceId: uuid("invoice_id").notNull(),
    amount: numeric({ precision: 15, scale: 2 }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    transactionCode: varchar("transaction_code", { length: 255 }),
    payAt: timestamp("pay_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.invoiceId],
      foreignColumns: [invoice.id],
      name: "fk_transaction_invoice_id_invoice_id",
    }),
  ],
);
