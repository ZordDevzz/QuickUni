import {
  pgSchema,
  bigint,
  boolean,
  varchar,
  foreignKey,
  uuid,
  timestamp,
  index,
  unique,
  uniqueIndex,
  text,
  bigserial,
  primaryKey,
  jsonb
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { enumAccountType } from "./enums";

export const authSchema = pgSchema("auth");

export const account = authSchema.table(
  "account",
  {
    id: uuid().primaryKey().notNull(),
    username: varchar({ length: 255 }).notNull(),
    pwdHash: varchar("pwd_hash", { length: 255 }).notNull(),
    type: enumAccountType(),
    email: varchar({ length: 255 }),
    phone: varchar({ length: 20 }),
    status: varchar({ length: 20 }).default("active"),
    lastLoginAt: timestamp("last_login_at", {
      withTimezone: true,
      mode: "string",
    }),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("account_idx_acc_usrname").using(
      "btree",
      table.username.asc().nullsLast().op("text_ops"),
    ),
    unique("account_username_key").on(table.username),
    unique("account_email_key").on(table.email),
    unique("account_phone_key").on(table.phone),
  ],
);

export const insertAccountSchema = createInsertSchema(account);
export const selectAccountSchema = createSelectSchema(account);

/**
 * Audit table for account changes
 */
export const accountAudit = authSchema.table(
  "account_audit",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    accountId: uuid("account_id").notNull(),
    performedBy: uuid("performed_by"), // Nullable for system-automated tasks
    action: varchar({ length: 100 }).notNull(), // e.g., 'update_status', 'change_password', 'update_email'
    oldValue: jsonb("old_value"),
    newValue: jsonb("new_value"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [account.id],
      name: "fk_account_audit_account_id_account_id",
    }),
    foreignKey({
      columns: [table.performedBy],
      foreignColumns: [account.id],
      name: "fk_account_audit_performed_by_account_id",
    }),
    index("account_audit_idx_account_id").on(table.accountId),
    index("account_audit_idx_performed_by").on(table.performedBy),
  ]
);

export const insertAccountAuditSchema = createInsertSchema(accountAudit);
export const selectAccountAuditSchema = createSelectSchema(accountAudit);

export const systemRole = authSchema.table("system_role", {
  id: bigint({ mode: "number" }).primaryKey().notNull(),
  isDefaultRole: boolean("is_default_role"),
  name: varchar({ length: 255 }),
});

export const systemAuthority = authSchema.table("system_authority", {
  id: varchar({ length: 255 }).primaryKey().notNull(),
  name: varchar({ length: 255 }),
  des: text(),
  isSensitive: boolean("is_sensitive").default(false).notNull(),
});

export const userSystemRole = authSchema.table(
  "user_system_role",
  {
    userId: uuid("user_id").notNull(),
    systemRole: bigint("system_role", { mode: "number" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [account.id],
      name: "fk_user_system_role_user_id_account_id",
    }),
    foreignKey({
      columns: [table.systemRole],
      foreignColumns: [systemRole.id],
      name: "fk_user_system_role_system_role_system_role_id",
    }),
    primaryKey({
      columns: [table.userId, table.systemRole],
      name: "user_system_role_pkey",
    }),
  ],
);

export const systemRoleAuthority = authSchema.table(
  "system_role_authority",
  {
    roleId: bigint("role_id", { mode: "number" }).notNull(),
    authorityId: varchar("authority_id", { length: 255 }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.authorityId],
      foreignColumns: [systemAuthority.id],
      name: "fk_system_role_authority_authority_id_system_authority_id",
    }),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [systemRole.id],
      name: "fk_system_role_authority_role_id_system_role_id",
    }),
    primaryKey({
      columns: [table.roleId, table.authorityId],
      name: "system_role_authority_pkey",
    }),
  ],
);

export const userDeviceToken = authSchema.table(
  "user_device_token",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    deviceToken: varchar("device_token", { length: 512 }).notNull(),
    platform: varchar({ length: 20 }),
    lastActiveAt: timestamp("last_active_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex(
      "user_device_token_idx_user_device_token_user_id_device_token",
    ).using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops"),
      table.deviceToken.asc().nullsLast().op("text_ops"),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [account.id],
      name: "fk_user_device_token_user_id_account_id",
    }),
  ],
);