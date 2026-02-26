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
  serial,
  jsonb,
  integer,
  primaryKey,
  bigserial
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  notificationChannel,
  notificationStatus,
  notificationType,
  enumMsgState
} from "./enums";
import { account } from "./auth";

export const communicationSchema = pgSchema("communication");

export const notificationTemplate = communicationSchema.table(
  "notification_template",
  {
    id: serial().primaryKey().notNull(),
    code: varchar({ length: 50 }).notNull(),
    titleTemplate: varchar("title_template", { length: 255 }).notNull(),
    bodyTemplate: text("body_template").notNull(),
    type: notificationType().notNull(),
    createAt: timestamp("create_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [unique("notification_template_code_key").on(table.code)],
);

export const notification = communicationSchema.table(
  "notification",
  {
    id: uuid().primaryKey().notNull(),
    templateId: integer("template_id"),
    actorId: uuid("actor_id"),
    title: varchar({ length: 255 }).notNull(),
    body: text(),
    data: jsonb(),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.actorId],
      foreignColumns: [account.id],
      name: "fk_notification_actor_id_account_id",
    }),
    foreignKey({
      columns: [table.templateId],
      foreignColumns: [notificationTemplate.id],
      name: "fk_notification_template_id_notification_template_id",
    }),
  ],
);

export const notificationRecipient = communicationSchema.table(
  "notification_recipient",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    notificationId: uuid("notification_id").notNull(),
    recipientId: uuid("recipient_id").notNull(),
    channel: notificationChannel().notNull(),
    status: notificationStatus().default("unread"),
    createAt: timestamp("create_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    readAt: timestamp("read_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("notification_recipient_idx_notif_feed").using(
      "btree",
      table.recipientId.asc().nullsLast().op("uuid_ops"),
      table.createAt.asc().nullsLast().op("timestamptz_ops"),
    ),
    index("notification_recipient_idx_notif_unread_count").using(
      "btree",
      table.recipientId.asc().nullsLast().op("uuid_ops"),
      table.status.asc().nullsLast().op("enum_ops"),
    ),
    foreignKey({
      columns: [table.recipientId],
      foreignColumns: [account.id],
      name: "fk_notification_recipient_recipient_id_account_id",
    }),
    foreignKey({
      columns: [table.notificationId],
      foreignColumns: [notification.id],
      name: "fk_notification_recipient_notification_id_notification_id",
    }),
  ],
);

export const userNotificationSetting = communicationSchema.table(
  "user_notification_setting",
  {
    userId: uuid("user_id").notNull(),
    notificationType: notificationType("notification_type").notNull(),
    channel: notificationChannel().notNull(),
    isEnabled: boolean("is_enabled").default(true),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [account.id],
      name: "fk_user_notification_setting_user_id_account_id",
    }),
    primaryKey({
      columns: [table.userId, table.notificationType, table.channel],
      name: "user_notification_setting_pkey",
    }),
  ],
);

export const systemBroadcast = communicationSchema.table("system_broadcast", {
  id: serial().primaryKey().notNull(),
  title: varchar({ length: 255 }),
  body: text(),
  targetRoles: jsonb("target_roles"),
  createAt: timestamp("create_at", {
    withTimezone: true,
    mode: "string",
  }).default(sql`CURRENT_TIMESTAMP`),
  expireAt: timestamp("expire_at", { withTimezone: true, mode: "string" }),
});

export const systemBroadcastRead = communicationSchema.table(
  "system_broadcast_read",
  {
    broadcastId: integer("broadcast_id").notNull(),
    userId: uuid("user_id").notNull(),
    readAt: timestamp("read_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [account.id],
      name: "fk_system_broadcast_read_user_id_account_id",
    }),
    foreignKey({
      columns: [table.broadcastId],
      foreignColumns: [systemBroadcast.id],
      name: "fk_system_broadcast_read_broadcast_id_system_broadcast_id",
    }),
    primaryKey({
      columns: [table.broadcastId, table.userId],
      name: "system_broadcast_read_pkey",
    }),
  ],
);

export const chatGroup = communicationSchema.table(
  "chat_group",
  {
    id: uuid().primaryKey().notNull(),
    type: varchar({ length: 255 }).notNull(),
    head: uuid().notNull(),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.head],
      foreignColumns: [account.id],
      name: "fk_chat_group_head_account_id",
    }),
  ],
);

export const chatGroupMember = communicationSchema.table(
  "chat_group_member",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    groupId: uuid("group_id").notNull(),
    uid: uuid().notNull(),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" }),
    nickname: varchar({ length: 255 }),
    pfpUrl: text("pfp_url"),
  },
  (table) => [
    uniqueIndex("chat_group_member_idx_chat_gmember").using(
      "btree",
      table.groupId.asc().nullsLast().op("uuid_ops"),
      table.uid.asc().nullsLast().op("uuid_ops"),
    ),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [chatGroup.id],
      name: "fk_chat_group_member_group_id_chat_group_id",
    }),
    foreignKey({
      columns: [table.uid],
      foreignColumns: [account.id],
      name: "fk_chat_group_member_uid_account_id",
    }),
  ],
);

export const message = communicationSchema.table(
  "message",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    replyToId: bigint("reply_to_id", { mode: "number" }),
    type: varchar({ length: 255 }),
    groupId: uuid("group_id"),
    sender: uuid(),
    createAt: timestamp("create_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    payload: jsonb().notNull(),
    state: enumMsgState(),
    isPinned: boolean("is_pinned").default(false),
  },
  (table) => [
    foreignKey({
      columns: [table.sender],
      foreignColumns: [account.id],
      name: "fk_message_sender_account_id",
    }),
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [chatGroup.id],
      name: "fk_message_group_id_chat_group_id",
    }),
    foreignKey({
      columns: [table.replyToId],
      foreignColumns: [table.id],
      name: "fk_message_reply_to_id_message_id",
    }),
  ],
);

export const messageRead = communicationSchema.table(
  "message_read",
  {
    messageId: bigint("message_id", { mode: "number" }).notNull(),
    recipientId: uuid("recipient_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.recipientId],
      foreignColumns: [account.id],
      name: "fk_message_read_recipient_id_account_id",
    }),
    foreignKey({
      columns: [table.messageId],
      foreignColumns: [message.id],
      name: "fk_message_read_message_id_message_id",
    }),
    primaryKey({
      columns: [table.messageId, table.recipientId],
      name: "message_read_pkey",
    }),
  ],
);

export const groupRole = communicationSchema.table(
  "group_role",
  {
    id: bigint({ mode: "number" }).primaryKey().notNull(),
    name: varchar({ length: 255 }),
    groupId: uuid("group_id"),
    isGroupRole: boolean("is_group_role").default(true).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.groupId],
      foreignColumns: [chatGroup.id],
      name: "fk_group_role_group_id_chat_group_id",
    }),
  ],
);

export const memberRole = communicationSchema.table(
  "member_role",
  {
    roleId: bigint("role_id", { mode: "number" }).notNull(),
    memberId: bigint("member_id", { mode: "number" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.memberId],
      foreignColumns: [chatGroupMember.id],
      name: "fk_member_role_member_id_chat_group_member_id",
    }),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [groupRole.id],
      name: "fk_member_role_role_id_group_role_id",
    }),
    primaryKey({
      columns: [table.roleId, table.memberId],
      name: "member_role_pkey",
    }),
  ],
);

export const groupAuthority = communicationSchema.table(
  "group_authority",
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
  },
);

export const groupRoleAuthority = communicationSchema.table(
  "group_role_authority",
  {
    authorityId: varchar("authority_id", { length: 255 }).notNull(),
    roleId: bigint("role_id", { mode: "number" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.authorityId],
      foreignColumns: [groupAuthority.id],
      name: "fk_group_role_authority_authority_id_group_authority_id",
    }),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [groupRole.id],
      name: "fk_group_role_authority_role_id_group_role_id",
    }),
    primaryKey({
      columns: [table.authorityId, table.roleId],
      name: "group_role_authority_pkey",
    }),
  ],
);
