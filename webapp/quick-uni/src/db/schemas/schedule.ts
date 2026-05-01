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
  smallserial,
  time,
  integer,
  date,
  index,
  boolean,
  primaryKey,
  bigserial
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { enumAttendanceState } from "./enums";
import { employee } from "./user";
import { courseClass, enrollment } from "./course";

export const scheduleSchema = pgSchema("schedule");

export const scheduleType = scheduleSchema.table("schedule_type", {
  id: smallint().primaryKey().notNull(),
  code: varchar({ length: 30 }).notNull(),
  name: varchar({ length: 255 }),
  des: text(),
});

export const scheduleStatus = scheduleSchema.table("schedule_status", {
  id: smallserial().primaryKey().notNull(),
  code: varchar({ length: 30 }),
  name: varchar({ length: 255 }),
  des: text(),
  isComplete: boolean("is_complete").default(false).notNull(),
});

export const building = scheduleSchema.table(
  "building",
  {
    id: smallserial().primaryKey().notNull(),
    code: varchar({ length: 30 }).notNull(),
    name: varchar({ length: 255 }),
    des: text(),
  },
  (table) => [unique("building_code_key").on(table.code)],
);

export const room = scheduleSchema.table(
  "room",
  {
    id: smallserial().primaryKey().notNull(),
    code: varchar({ length: 30 }).notNull(),
    buildingId: smallint("building_id").notNull(),
    capacity: smallint(),
    type: varchar({ length: 50 }),
  },
  (table) => [
    foreignKey({
      columns: [table.buildingId],
      foreignColumns: [building.id],
      name: "fk_room_building_id_building_id",
    }),
    unique("room_code_key").on(table.code),
  ],
);

export const schedule = scheduleSchema.table(
  "schedule",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    type: smallint().notNull(),
    courseClassId: uuid("course_class_id").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    period: smallint().notNull(),
    mPerPeriod: integer("m_per_period").default(45),
    schDate: date("sch_date").notNull(),
    note: varchar({ length: 512 }),
    statusId: smallint("status_id"),
    conductorId: uuid("conductor_id"),
    roomId: smallint("room_id"),
    createAt: timestamp("create_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("schedule_idx_schedule_c_class").using(
      "btree",
      table.courseClassId.asc().nullsLast().op("uuid_ops"),
    ),
    index("schedule_idx_schedule_conductor").using(
      "btree",
      table.conductorId.asc().nullsLast().op("uuid_ops"),
      table.schDate.asc().nullsLast().op("date_ops"),
    ),
    foreignKey({
      columns: [table.courseClassId],
      foreignColumns: [courseClass.id],
      name: "fk_schedule_course_class_id_course_class_id",
    }),
    foreignKey({
      columns: [table.conductorId],
      foreignColumns: [employee.id],
      name: "fk_schedule_conductor_id_employee_id",
    }),
    foreignKey({
      columns: [table.roomId],
      foreignColumns: [room.id],
      name: "fk_schedule_room_id_room_id",
    }),
    foreignKey({
      columns: [table.statusId],
      foreignColumns: [scheduleStatus.id],
      name: "fk_schedule_status_id_schedule_status_id",
    }),
    foreignKey({
      columns: [table.type],
      foreignColumns: [scheduleType.id],
      name: "fk_schedule_type_schedule_type_id",
    }),
  ],
);

export const attendanceStatus = scheduleSchema.table(
  "attendance_status",
  {
    enrollId: bigint("enroll_id", { mode: "number" }).notNull(),
    scheduleId: bigint("schedule_id", { mode: "number" }).notNull(),
    state: enumAttendanceState().notNull(),
    note: varchar({ length: 255 }),
    createAt: timestamp("create_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    updateAt: timestamp("update_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    foreignKey({
      columns: [table.enrollId],
      foreignColumns: [enrollment.id],
      name: "fk_attendance_status_enroll_id_enrollment_id",
    }),
    foreignKey({
      columns: [table.scheduleId],
      foreignColumns: [schedule.id],
      name: "fk_attendance_status_schedule_id_schedule_id",
    }),
    primaryKey({
      columns: [table.enrollId, table.scheduleId],
      name: "attendance_status_pkey",
    }),
  ],
);

export const availabilityEntityType = pgSchema("schedule").enum(
  "availability_entity_type",
  ["teacher", "room", "subject", "global"],
);

export const availability = scheduleSchema.table(
  "availability",
  {
    id: uuid().primaryKey().defaultRandom(),
    entityId: uuid("entity_id").notNull(),
    entityType: availabilityEntityType("entity_type").notNull(),
    dayOfWeek: smallint("day_of_week").notNull(), // 0-6
    occupiedMask: integer("occupied_mask").default(0).notNull(),
  },
  (table) => [index("availability_entity_idx").on(table.entityId, table.entityType)],
);

export const weeklyTemplate = scheduleSchema.table(
  "weekly_template",
  {
    id: uuid().primaryKey().defaultRandom(),
    courseClassId: uuid("course_class_id").notNull(),
    roomId: smallint("room_id").notNull(),
    dayOfWeek: smallint("day_of_week").notNull(),
    startPeriod: smallint("start_period").notNull(),
    endPeriod: smallint("end_period").notNull(),
    occupyMask: integer("occupy_mask").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.courseClassId],
      foreignColumns: [courseClass.id],
      name: "fk_weekly_template_course_class_id_course_class_id",
    }),
    foreignKey({
      columns: [table.roomId],
      foreignColumns: [room.id],
      name: "fk_weekly_template_room_id_room_id",
    }),
  ],
);

export const holidayBlacklist = scheduleSchema.table("holiday_blacklist", {
  id: bigserial({ mode: "number" }).primaryKey(),
  date: date("date").notNull(),
  name: varchar({ length: 255 }),
  isGlobal: boolean("is_global").default(true),
});
