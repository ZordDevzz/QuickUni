import {
  pgSchema,
  bigint,
  boolean,
  varchar,
  foreignKey,
  uuid,
  timestamp,
  text,
  unique,
  date,
  jsonb,
  primaryKey,
  bigserial,
  integer
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { enumGender } from "./enums";
import { account } from "./auth";
import { onboardingSession } from "./system";

export const usersSchema = pgSchema("users");

export const profileSchema = usersSchema.table("profile_schema", {
  id: bigserial({ mode: "number" }).primaryKey().notNull(),
  effectiveDate: date("effective_date").notNull(),
  expiredDate: date("expired_date"),
  schemaCode: varchar("schema_code", { length: 255 }).notNull(),
  createAt: timestamp("create_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
  des: text(),
});

export const profile = usersSchema.table(
  "profile",
  {
    id: uuid().primaryKey().notNull(),
    accountId: uuid("account_id"),
    fullname: varchar({ length: 255 }),
    gender: enumGender().notNull(),
    dob: date().notNull(),
    address: text(),
    countryCode: varchar("country_code", { length: 2 }),
    nationalId: varchar("national_id", { length: 255 }).notNull(),
    ethnic: varchar({ length: 255 }),
    religious: varchar({ length: 255 }),
    schemaId: bigint("schema_id", { mode: "number" }).notNull(),
    dynamicData: jsonb("dynamic_data"),
    sessionId: uuid("session_id"),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "fk_profile_account_id_account_id",
    }),
    foreignKey({
      columns: [table.schemaId],
      foreignColumns: [profileSchema.id],
      name: "fk_profile_schema_id_profile_schema_id",
    }),
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [onboardingSession.id],
      name: "fk_profile_session_id_onboarding_session_id",
    }),
    unique("profile_national_id_key").on(table.nationalId),
  ],
);

export const employee = usersSchema.table(
  "employee",
  {
    id: uuid().primaryKey().notNull(),
    code: varchar({ length: 30 }).notNull(),
    profileId: uuid("profile_id"),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profile.id],
      name: "fk_employee_profile_id_profile_id",
    }),
    unique("employee_code_key").on(table.code),
  ],
);

export const student = usersSchema.table(
  "student",
  {
    id: uuid().primaryKey().notNull(),
    code: varchar({ length: 30 }).notNull(),
    profileId: uuid("profile_id").notNull(),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.profileId],
      foreignColumns: [profile.id],
      name: "fk_student_profile_id_profile_id",
    }),
    unique("student_code_key").on(table.code),
    unique("student_profile_id_key").on(table.profileId),
  ],
);

export const profileField = usersSchema.table("profile_field", {
  id: bigserial({ mode: "number" }).primaryKey().notNull(),
  name: varchar({ length: 255 }),
  datatype: varchar({ length: 255 }),
  uiSection: varchar("ui_section", { length: 255 }).notNull(),
  createAt: timestamp("create_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
  label: varchar({ length: 255 }),
  des: text(),
});

export const profileSchemaField = usersSchema.table(
  "profile_schema_field",
  {
    fieldId: bigint("field_id", { mode: "number" }).notNull(),
    schemaId: bigint("schema_id", { mode: "number" }).notNull(),
    sectionId: bigint("section_id", { mode: "number" }), // Nullable initially for migration
    order: integer().default(0).notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.fieldId],
      foreignColumns: [profileField.id],
      name: "fk_profile_schema_field_field_id_profile_field_id",
    }),
    foreignKey({
      columns: [table.schemaId],
      foreignColumns: [profileSchema.id],
      name: "fk_profile_schema_field_schema_id_profile_schema_id",
    }),
    foreignKey({
      columns: [table.sectionId],
      foreignColumns: [profileSection.id],
      name: "fk_profile_schema_field_section_id",
    }),
    primaryKey({
      columns: [table.fieldId, table.schemaId],
      name: "profile_schema_field_pkey",
    }),
  ],
);

export const insertProfile = createInsertSchema(profile);
export const selectProfile = createSelectSchema(profile);

export const insertProfileSchema = createInsertSchema(profileSchema);
export const selectProfileSchema = createSelectSchema(profileSchema);

export const insertProfileField = createInsertSchema(profileField);
export const selectProfileField = createSelectSchema(profileField);

export const profileSection = usersSchema.table(
  "profile_section",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    schemaId: bigint("schema_id", { mode: "number" }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    order: integer().default(0).notNull(),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.schemaId],
      foreignColumns: [profileSchema.id],
      name: "fk_profile_section_schema_id",
    }),
  ],
);

export const insertProfileSection = createInsertSchema(profileSection);
export const selectProfileSection = createSelectSchema(profileSection);