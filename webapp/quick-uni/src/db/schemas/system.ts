import {
  pgSchema,
  bigint,
  boolean,
  varchar,
  foreignKey,
  uuid,
  timestamp,
  text,
  jsonb,
  json,
  date,
  primaryKey,
  bigserial
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { account } from "./auth";
import { employee } from "./user";
import { department } from "./academic";

export const systemSchema = pgSchema("system");

export const systemSetting = systemSchema.table(
  "system_setting",
  {
    key: varchar({ length: 255 }).primaryKey().notNull(),
    value: jsonb(),
    valueType: varchar("value_type", { length: 255 }),
    displayName: varchar("display_name", { length: 255 }),
    des: text(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    updateBy: uuid("update_by"),
    isSensitive: boolean("is_sensitive").default(false).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.updateBy],
      foreignColumns: [account.id],
      name: "fk_system_setting_update_by_account_id",
    }),
  ],
);

export const systemAuditLog = systemSchema.table(
  "system_audit_log",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    actorId: uuid("actor_id").notNull(),
    action: varchar({ length: 50 }).notNull(),
    targetResource: varchar("target_resource", { length: 100 }),
    targetId: varchar("target_id", { length: 255 }),
    payload: jsonb(),
    createAt: timestamp("create_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.actorId],
      foreignColumns: [account.id],
      name: "fk_system_audit_log_actor_id_account_id",
    }),
  ],
);

export const featureFlag = systemSchema.table(
  "feature_flag",
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    enabled: boolean(),
    displayName: varchar("display_name", { length: 255 }),
    version: varchar({ length: 30 }),
    des: text(),
    target: jsonb(),
    createAt: timestamp("create_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    updateBy: uuid("update_by"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    status: varchar({ length: 30 }),
  },
  (table) => [
    foreignKey({
      columns: [table.updateBy],
      foreignColumns: [account.id],
      name: "fk_feature_flag_update_by_account_id",
    }),
  ],
);

export const featureFlagAudit = systemSchema.table(
  "feature_flag_audit",
  {
    id: bigint({ mode: "number" }).primaryKey().notNull(),
    changeBy: uuid("change_by").notNull(),
    flagId: varchar("flag_id", { length: 255 }).notNull(),
    oldEnabled: boolean("old_enabled").notNull(),
    newEnabled: boolean("new_enabled").notNull(),
    changeAt: timestamp("change_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    reason: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.changeBy],
      foreignColumns: [account.id],
      name: "fk_feature_flag_audit_change_by_account_id",
    }),
    foreignKey({
      columns: [table.flagId],
      foreignColumns: [featureFlag.id],
      name: "fk_feature_flag_audit_flag_id_feature_flag_id",
    }),
  ],
);

export const archive = systemSchema.table("archive", {
  id: bigint({ mode: "number" }).primaryKey().notNull(),
  origin: varchar({ length: 255 }),
  data: json(),
  createAt: timestamp("create_at", { withTimezone: true, mode: "string" }),
});

export const departmentEmployment = systemSchema.table(
  "department_employment",
  {
    employeeId: uuid("employee_id").notNull(),
    departmentId: uuid("department_id").notNull(),
    assignDate: date("assign_date").notNull(),
    unassignDate: date("unassign_date"),
    roleCode: varchar("role_code", { length: 30 }),
    roleName: varchar("role_name", { length: 255 }),
  },
  (table) => [
    foreignKey({
      columns: [table.departmentId],
      foreignColumns: [department.id],
      name: "fk_department_employment_department_id_department_id",
    }),
    foreignKey({
      columns: [table.employeeId],
      foreignColumns: [employee.id],
      name: "fk_department_employment_employee_id_employee_id",
    }),
    primaryKey({
      columns: [table.employeeId, table.departmentId],
      name: "department_employment_pkey",
    }),
  ],
);
