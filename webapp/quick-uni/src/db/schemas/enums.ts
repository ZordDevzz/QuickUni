import { pgEnum } from "drizzle-orm/pg-core";

export const enumAccountType = pgEnum("enum_account_type", [
  "student",
  "employee",
  "tech",
  "dev",
]);
export const enumAttendanceState = pgEnum("enum_attendance_state", [
  "present",
  "absent",
  "late",
  "excused",
]);
export const enumDiscountType = pgEnum("enum_discount_type", [
  "percentage",
  "fixed_amount",
]);
export const enumGender = pgEnum("enum_gender", ["male", "female", "others"]);
export const enumMsgState = pgEnum("enum_msg_state", [
  "archived",
  "deleted",
  "normal",
]);
export const enumPaymentStatus = pgEnum("enum_payment_status", [
  "pending",
  "paid",
  "cancelled",
  "refunded",
]);
export const notificationChannel = pgEnum("notification_channel", [
  "in_app",
  "email",
  "push",
  "sms",
]);
export const notificationStatus = pgEnum("notification_status", [
  "queued",
  "sent",
  "failed",
  "read",
  "unread",
]);
export const notificationType = pgEnum("notification_type", [
  "system",
  "academic",
  "finance",
  "social",
]);
