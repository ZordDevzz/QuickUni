CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "public"."enum_account_type" AS ENUM ('student', 'employee', 'tech', 'dev');
CREATE TYPE "public"."enum_attendance_state" AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE "public"."enum_discount_type" AS ENUM ('percentage', 'fixed_amount');
CREATE TYPE "public"."enum_gender" AS ENUM ('male', 'female', 'others');
CREATE TYPE "public"."enum_msg_state" AS ENUM ('archived', 'deleted', 'normal');
CREATE TYPE "public"."enum_payment_status" AS ENUM ('pending', 'paid', 'cancelled', 'refunded');
CREATE TYPE "public"."notification_channel" AS ENUM ('in_app', 'email', 'push', 'sms');
CREATE TYPE "public"."notification_status" AS ENUM ('queued', 'sent', 'failed', 'read', 'unread');
CREATE TYPE "public"."notification_type" AS ENUM ('system', 'academic', 'finance', 'social');

CREATE TABLE "public"."message_read" (
    "message_id" bigint NOT NULL,
    "recipient_id" uuid NOT NULL,
    PRIMARY KEY ("message_id", "recipient_id")
);

CREATE TABLE "public"."user_device_token" (
    "id" bigserial NOT NULL,
    "user_id" uuid NOT NULL,
    "device_token" varchar(512) NOT NULL,
    "platform" varchar(20),
    "last_active_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);
-- Indexes
CREATE UNIQUE INDEX "user_device_token_idx_user_device_token_user_id_device_token" ON "public"."user_device_token" ("user_id", "device_token");

CREATE TABLE "public"."group_role_authority" (
    "authority_id" varchar(255) NOT NULL,
    "role_id" bigint NOT NULL,
    PRIMARY KEY ("authority_id", "role_id")
);

CREATE TABLE "public"."education_type" (
    "id" smallserial NOT NULL,
    "code" varchar(30) NOT NULL,
    "name" varchar(255) NOT NULL,
    "des" varchar(512),
    "length" smallint NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."main_class" (
    "id" uuid NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "teacher" uuid NOT NULL,
    "type_id" smallint,
    "major_id" uuid NOT NULL,
    "academic_year" smallint NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."enrollment" (
    "id" bigserial NOT NULL,
    "status" smallint,
    "student_id" uuid NOT NULL,
    "course_class_id" uuid NOT NULL,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);
-- Indexes
CREATE UNIQUE INDEX "enrollment_enrollment_index_0" ON "public"."enrollment" ("student_id", "course_class_id");

CREATE TABLE "public"."curriculum_subject" (
    "subject_id" uuid NOT NULL,
    "curriculum_id" int NOT NULL,
    "semester_index" smallint,
    "is_compulsory" boolean DEFAULT true,
    "knowledge_block_id" smallint,
    PRIMARY KEY ("subject_id", "curriculum_id")
);

CREATE TABLE "public"."feature_flag" (
    "id" varchar(255) NOT NULL,
    "enabled" boolean,
    "display_name" varchar(255),
    "version" varchar(30),
    "des" text,
    "target" jsonb,
    "create_at" timestamptz NOT NULL,
    "update_at" timestamptz,
    "update_by" uuid,
    "expires_at" timestamptz,
    "status" varchar(30),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."subject" (
    "id" uuid NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "name" varchar(255) NOT NULL,
    "credits" smallint NOT NULL,
    "des" varchar(255),
    "recommended_semester_index" smallint,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."attendance_status" (
    "enroll_id" bigint NOT NULL,
    "schedule_id" bigint NOT NULL,
    "state" enum_attendance_state NOT NULL,
    "note" varchar(255),
    "create_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    PRIMARY KEY ("enroll_id", "schedule_id")
);

CREATE TABLE "public"."registration_period" (
    "id" serial NOT NULL,
    "semester_id" smallint NOT NULL,
    "name" varchar(255),
    "start_at" timestamptz NOT NULL,
    "end_at" timestamptz NOT NULL,
    "is_active" boolean DEFAULT true,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."schedule_type" (
    "id" smallint NOT NULL,
    "code" varchar(30) NOT NULL,
    "name" varchar(255),
    "des" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."account" (
    "id" uuid NOT NULL,
    "username" varchar(255) NOT NULL UNIQUE,
    "pwd_hash" varchar(255) NOT NULL,
    "type" enum_account_type,
    "email" varchar(255) UNIQUE,
    "phone" varchar(20) UNIQUE,
    "status" varchar(20) DEFAULT 'active',
    "last_login_at" timestamptz,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);
-- Indexes
CREATE INDEX "account_idx_acc_usrname" ON "public"."account" ("username");

CREATE TABLE "public"."notification_recipient" (
    "id" bigserial NOT NULL,
    "notification_id" uuid NOT NULL,
    "recipient_id" uuid NOT NULL,
    "channel" notification_channel NOT NULL,
    "status" notification_status DEFAULT 'unread',
    "create_at" timestamptz NOT NULL,
    "read_at" timestamptz,
    PRIMARY KEY ("id")
);
-- Indexes
CREATE INDEX "notification_recipient_idx_notif_feed" ON "public"."notification_recipient" ("recipient_id", "create_at");
CREATE INDEX "notification_recipient_idx_notif_unread_count" ON "public"."notification_recipient" ("recipient_id", "status");

CREATE TABLE "public"."notification_template" (
    "id" serial NOT NULL,
    "code" varchar(50) NOT NULL UNIQUE,
    "title_template" varchar(255) NOT NULL,
    "body_template" text NOT NULL,
    "type" notification_type NOT NULL,
    "create_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."course_class_type" (
    "id" smallint NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "name" varchar(255),
    "des" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."grade_audit" (
    "id" bigint NOT NULL,
    "grade_id" bigint NOT NULL,
    "change_by" uuid NOT NULL,
    "old_score" numeric(5, 2) NOT NULL,
    "new_score" numeric(5, 2),
    "change_at" timestamptz NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."grade" (
    "id" bigserial NOT NULL,
    "enrollment_id" bigint NOT NULL,
    "type_id" bigint NOT NULL,
    "assignment_id" bigint,
    "score" numeric(5, 2) NOT NULL,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);
-- Indexes
CREATE INDEX "grade_idx_grade_enrollment_id" ON "public"."grade" ("enrollment_id");
CREATE UNIQUE INDEX "grade_idx_grade_unique_entry" ON "public"."grade" ("enrollment_id", "type_id", "assignment_id");

CREATE TABLE "public"."system_role" (
    "id" bigint NOT NULL,
    "is_default_role" boolean,
    "name" varchar(255),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."feature_flag_audit" (
    "id" bigint NOT NULL,
    "change_by" uuid NOT NULL,
    "flag_id" varchar(255) NOT NULL,
    "old_enabled" boolean NOT NULL,
    "new_enabled" boolean NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "change_at" timestamptz NOT NULL,
    "reason" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."archive" (
    "id" bigint NOT NULL,
    "origin" varchar(255),
    "data" json,
    "create_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."group_authority" (
    "id" varchar(255) NOT NULL,
    "name" varchar(255) NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."grade_type" (
    "id" bigint NOT NULL,
    "code" varchar(30) NOT NULL,
    "weight" smallint NOT NULL,
    "name" varchar(255),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."student_scholarship" (
    "id" bigserial NOT NULL,
    "student_id" uuid NOT NULL,
    "policy_id" smallint NOT NULL,
    "semester_id" smallint NOT NULL,
    "is_active" boolean DEFAULT true,
    "grant_date" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);
-- Indexes
CREATE INDEX "idx_student_scholarship_student_id_semester_id" ON "public"."student_scholarship" ("student_id", "semester_id");

CREATE TABLE "public"."building" (
    "id" smallserial NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "name" varchar(255),
    "des" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."semester" (
    "id" smallserial NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "name" varchar(255) NOT NULL,
    "academic_year" smallint NOT NULL,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "is_current" boolean DEFAULT false,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."knowledge_block" (
    "id" smallserial NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "name" varchar(255) NOT NULL,
    "parent_id" smallint,
    "des" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."system_setting" (
    "key" varchar(255) NOT NULL,
    "value" jsonb,
    "value_type" varchar(255),
    "display_name" varchar(255),
    "des" text,
    "update_at" timestamptz,
    "update_by" uuid,
    "is_sensitive" boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("key")
);

CREATE TABLE "public"."group_role" (
    "id" bigint NOT NULL,
    "name" varchar(255),
    "group_id" uuid,
    "is_group_role" boolean NOT NULL DEFAULT true,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."class_role" (
    "id" smallserial NOT NULL,
    "code" varchar(30) NOT NULL,
    "name" varchar(255),
    "des" varchar(255),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."invoice_detail" (
    "id" bigserial NOT NULL,
    "invoice_id" uuid NOT NULL,
    "enrollment_id" bigint NOT NULL UNIQUE,
    "credit_price" numeric(10, 2) NOT NULL,
    "subject_credits" smallint NOT NULL,
    "amount" numeric(15, 2) NOT NULL,
    "note" varchar(255),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."tuition_fee_config" (
    "id" serial NOT NULL,
    "major_id" uuid,
    "academic_year" smallint NOT NULL,
    "price_per_credit" numeric(10, 2) NOT NULL,
    "note" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."curriculum" (
    "id" serial NOT NULL,
    "major_id" uuid NOT NULL,
    "code" varchar(50) NOT NULL UNIQUE,
    "name" varchar(255) NOT NULL,
    "academic_year" smallint NOT NULL,
    "total_credits" smallint,
    "des" text,
    "create_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."major" (
    "id" uuid NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "des" varchar(512),
    "department_id" uuid NOT NULL,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."enroll_status" (
    "id" smallint NOT NULL,
    "code" varchar(30),
    "name" varchar(255),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."user_system_role" (
    "user_id" uuid NOT NULL,
    "system_role" bigint NOT NULL,
    PRIMARY KEY ("user_id", "system_role")
);

CREATE TABLE "public"."profile_field" (
    "id" bigint NOT NULL,
    "name" varchar(255),
    "datatype" varchar(255),
    "ui_section" varchar(255) NOT NULL,
    "create_at" timestamptz NOT NULL,
    "update_at" timestamptz,
    "label" varchar(255),
    "des" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."department" (
    "id" uuid NOT NULL,
    "code" varchar(30) UNIQUE,
    "name" varchar(255) NOT NULL,
    "des" varchar(512),
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."transaction" (
    "id" uuid NOT NULL,
    "invoice_id" uuid NOT NULL,
    "amount" numeric(15, 2),
    "payment_method" varchar(50),
    "transaction_code" varchar(255),
    "pay_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."assignment" (
    "id" bigint NOT NULL,
    "title" varchar(512),
    "data" jsonb,
    "course_class_id" uuid NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."system_broadcast" (
    "id" serial NOT NULL,
    "title" varchar(255),
    "body" text,
    "target_roles" jsonb,
    "create_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "expire_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."course_class" (
    "id" uuid NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "teacher_id" uuid NOT NULL,
    "subject_id" uuid NOT NULL,
    "cap" smallint NOT NULL DEFAULT 30,
    "current_slot" smallint NOT NULL DEFAULT 0,
    "status" varchar(20) DEFAULT 'opened',
    "type" smallint NOT NULL,
    "semester_id" smallint NOT NULL,
    "create_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."system_audit_log" (
    "id" bigserial NOT NULL,
    "actor_id" uuid NOT NULL,
    "action" varchar(50) NOT NULL,
    "target_resource" varchar(100),
    "target_id" varchar(255),
    "payload" jsonb,
    "create_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."member_role" (
    "role_id" bigint NOT NULL,
    "member_id" bigint NOT NULL,
    PRIMARY KEY ("role_id", "member_id")
);

CREATE TABLE "public"."subject_prerequisite" (
    "subject_id" uuid NOT NULL,
    "prerequisite_id" uuid NOT NULL,
    "type" varchar(50),
    PRIMARY KEY ("subject_id", "prerequisite_id")
);

CREATE TABLE "public"."schedule" (
    "id" bigserial NOT NULL,
    "type" smallint NOT NULL,
    "course_class_id" uuid NOT NULL,
    "start_time" time NOT NULL,
    "end_time" time NOT NULL,
    "period" smallint NOT NULL,
    "m_per_period" int DEFAULT 45,
    "sch_date" date NOT NULL,
    "note" varchar(512),
    "status_id" smallint,
    "conductor_id" uuid,
    "room_id" smallint,
    "create_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);
-- Indexes
CREATE INDEX "schedule_idx_schedule_c_class" ON "public"."schedule" ("course_class_id");
CREATE INDEX "schedule_idx_schedule_conductor" ON "public"."schedule" ("conductor_id", "sch_date");

CREATE TABLE "public"."chat_group" (
    "id" uuid NOT NULL,
    "type" varchar(255) NOT NULL,
    "head" uuid NOT NULL,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."scholarship_policy" (
    "id" smallserial NOT NULL,
    "code" varchar(50) NOT NULL UNIQUE,
    "name" varchar(255) NOT NULL,
    "type" enum_discount_type NOT NULL,
    "value" numeric(15, 2) NOT NULL,
    "des" text,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."system_broadcast_read" (
    "broadcast_id" int NOT NULL,
    "user_id" uuid NOT NULL,
    "read_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("broadcast_id", "user_id")
);

CREATE TABLE "public"."profile_schema_field" (
    "field_id" bigint NOT NULL,
    "schema_id" bigint NOT NULL,
    "is_required" boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("field_id", "schema_id")
);

CREATE TABLE "public"."system_authority" (
    "id" varchar(255) NOT NULL,
    "name" varchar(255),
    "des" text,
    "is_sensitive" boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."chat_group_member" (
    "id" bigserial NOT NULL,
    "group_id" uuid NOT NULL,
    "uid" uuid NOT NULL,
    "create_at" timestamptz,
    "nickname" varchar(255),
    "pfp_url" text,
    PRIMARY KEY ("id")
);
-- Indexes
CREATE UNIQUE INDEX "chat_group_member_idx_chat_gmember" ON "public"."chat_group_member" ("group_id", "uid");

CREATE TABLE "public"."schedule_status" (
    "id" smallserial NOT NULL,
    "code" varchar(30),
    "name" varchar(255),
    "des" text,
    "is_complete" boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."grade_scale" (
    "id" smallserial NOT NULL,
    "min_score_10" numeric(4, 2),
    "letter_grade" varchar(5),
    "gpa_score_4" numeric(4, 2),
    "des" varchar(100),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."message" (
    "id" bigserial NOT NULL,
    "reply_to_id" bigint,
    "type" varchar(255),
    "group_id" uuid,
    "sender" uuid,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" timestamptz,
    "payload" jsonb NOT NULL,
    "state" enum_msg_state,
    "is_pinned" boolean DEFAULT false,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."room" (
    "id" smallserial NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "building_id" smallint NOT NULL,
    "capacity" smallint,
    "type" varchar(50),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."user_notification_setting" (
    "user_id" uuid NOT NULL,
    "notification_type" notification_type NOT NULL,
    "channel" notification_channel NOT NULL,
    "is_enabled" boolean DEFAULT true,
    PRIMARY KEY ("user_id", "notification_type", "channel")
);

CREATE TABLE "public"."invoice" (
    "id" uuid NOT NULL,
    "student_id" uuid NOT NULL,
    "semester_id" smallint NOT NULL,
    "original_amount" numeric(15, 2) NOT NULL,
    "discount_amount" numeric(15, 2) DEFAULT 0,
    "final_amount" numeric(15, 2) NOT NULL,
    "status" enum_payment_status,
    "create_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "due_date" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."main_class_member" (
    "student_id" uuid NOT NULL,
    "role_id" smallint,
    "class_id" uuid NOT NULL,
    PRIMARY KEY ("student_id", "class_id")
);

CREATE TABLE "public"."employee" (
    "id" uuid NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "profile_id" uuid,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."department_employment" (
    "employee_id" uuid NOT NULL,
    "department_id" uuid NOT NULL,
    "assign_date" date NOT NULL,
    "unassign_date" date,
    "role_code" varchar(30),
    "role_name" varchar(255),
    PRIMARY KEY ("employee_id", "department_id")
);

CREATE TABLE "public"."student" (
    "id" uuid NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "profile_id" uuid NOT NULL UNIQUE,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."course_material" (
    "id" bigserial NOT NULL,
    "course_class_id" uuid NOT NULL,
    "title" varchar(255) NOT NULL,
    "file_url" text NOT NULL,
    "upload_by" uuid,
    "create_at" timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."profile" (
    "id" uuid NOT NULL,
    "account_id" uuid,
    "fullname" varchar(255),
    "gender" enum_gender NOT NULL,
    "dob" date NOT NULL,
    "address" text,
    "country_code" varchar(2),
    "national_id" varchar(255) NOT NULL UNIQUE,
    "ethnic" varchar(255),
    "religious" varchar(255),
    "schema_id" bigint NOT NULL,
    "dynamic_data" jsonb,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "deleted_at" timestamptz,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."notification" (
    "id" uuid NOT NULL,
    "template_id" int,
    "actor_id" uuid,
    "title" varchar(255) NOT NULL,
    "body" text,
    "data" jsonb,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."system_role_authority" (
    "role_id" bigint NOT NULL,
    "authority_id" varchar(255) NOT NULL,
    PRIMARY KEY ("role_id", "authority_id")
);

CREATE TABLE "public"."profile_schema" (
    "id" bigint NOT NULL,
    "effective_date" date NOT NULL,
    "expired_date" date,
    "schema_code" varchar(255) NOT NULL,
    "create_at" timestamptz NOT NULL,
    "update_at" timestamptz,
    "des" text,
    PRIMARY KEY ("id")
);

-- Foreign key constraints
-- Schema: public
ALTER TABLE "public"."user_system_role" ADD CONSTRAINT "fk_user_system_role_user_id_account_id" FOREIGN KEY("user_id") REFERENCES "public"."account"("id");
ALTER TABLE "public"."feature_flag" ADD CONSTRAINT "fk_feature_flag_update_by_account_id" FOREIGN KEY("update_by") REFERENCES "public"."account"("id");
ALTER TABLE "public"."feature_flag_audit" ADD CONSTRAINT "fk_feature_flag_audit_change_by_account_id" FOREIGN KEY("change_by") REFERENCES "public"."account"("id");
ALTER TABLE "public"."chat_group" ADD CONSTRAINT "fk_chat_group_head_account_id" FOREIGN KEY("head") REFERENCES "public"."account"("id");
ALTER TABLE "public"."system_setting" ADD CONSTRAINT "fk_system_setting_update_by_account_id" FOREIGN KEY("update_by") REFERENCES "public"."account"("id");
ALTER TABLE "public"."message_read" ADD CONSTRAINT "fk_message_read_recipient_id_account_id" FOREIGN KEY("recipient_id") REFERENCES "public"."account"("id");
ALTER TABLE "public"."message" ADD CONSTRAINT "fk_message_sender_account_id" FOREIGN KEY("sender") REFERENCES "public"."account"("id");
ALTER TABLE "public"."notification" ADD CONSTRAINT "fk_notification_actor_id_account_id" FOREIGN KEY("actor_id") REFERENCES "public"."account"("id");
ALTER TABLE "public"."notification_recipient" ADD CONSTRAINT "fk_notification_recipient_recipient_id_account_id" FOREIGN KEY("recipient_id") REFERENCES "public"."account"("id");
ALTER TABLE "public"."profile" ADD CONSTRAINT "fk_profile_account_id_account_id" FOREIGN KEY("account_id") REFERENCES "public"."account"("id");
ALTER TABLE "public"."system_audit_log" ADD CONSTRAINT "fk_system_audit_log_actor_id_account_id" FOREIGN KEY("actor_id") REFERENCES "public"."account"("id");
ALTER TABLE "public"."system_broadcast_read" ADD CONSTRAINT "fk_system_broadcast_read_user_id_account_id" FOREIGN KEY("user_id") REFERENCES "public"."account"("id");
ALTER TABLE "public"."user_device_token" ADD CONSTRAINT "fk_user_device_token_user_id_account_id" FOREIGN KEY("user_id") REFERENCES "public"."account"("id");
ALTER TABLE "public"."user_notification_setting" ADD CONSTRAINT "fk_user_notification_setting_user_id_account_id" FOREIGN KEY("user_id") REFERENCES "public"."account"("id");
ALTER TABLE "public"."grade" ADD CONSTRAINT "fk_grade_assignment_id_assignment_id" FOREIGN KEY("assignment_id") REFERENCES "public"."assignment"("id");
ALTER TABLE "public"."room" ADD CONSTRAINT "fk_room_building_id_building_id" FOREIGN KEY("building_id") REFERENCES "public"."building"("id");
ALTER TABLE "public"."group_role" ADD CONSTRAINT "fk_group_role_group_id_chat_group_id" FOREIGN KEY("group_id") REFERENCES "public"."chat_group"("id");
ALTER TABLE "public"."member_role" ADD CONSTRAINT "fk_member_role_member_id_chat_group_member_id" FOREIGN KEY("member_id") REFERENCES "public"."chat_group_member"("id");
ALTER TABLE "public"."course_material" ADD CONSTRAINT "fk_course_material_course_class_id_course_class_id" FOREIGN KEY("course_class_id") REFERENCES "public"."course_class"("id");
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "fk_enrollment_course_class_id_course_class_id" FOREIGN KEY("course_class_id") REFERENCES "public"."course_class"("id");
ALTER TABLE "public"."assignment" ADD CONSTRAINT "fk_assignment_course_class_id_course_class_id" FOREIGN KEY("course_class_id") REFERENCES "public"."course_class"("id");
ALTER TABLE "public"."schedule" ADD CONSTRAINT "fk_schedule_course_class_id_course_class_id" FOREIGN KEY("course_class_id") REFERENCES "public"."course_class"("id");
ALTER TABLE "public"."course_class" ADD CONSTRAINT "fk_course_class_type_course_class_type_id" FOREIGN KEY("type") REFERENCES "public"."course_class_type"("id");
ALTER TABLE "public"."curriculum_subject" ADD CONSTRAINT "fk_curriculum_subject_curriculum_id_curriculum_id" FOREIGN KEY("curriculum_id") REFERENCES "public"."curriculum"("id");
ALTER TABLE "public"."major" ADD CONSTRAINT "fk_major_department_id_department_id" FOREIGN KEY("department_id") REFERENCES "public"."department"("id");
ALTER TABLE "public"."department_employment" ADD CONSTRAINT "fk_department_employment_department_id_department_id" FOREIGN KEY("department_id") REFERENCES "public"."department"("id");
ALTER TABLE "public"."department_employment" ADD CONSTRAINT "fk_department_employment_employee_id_employee_id" FOREIGN KEY("employee_id") REFERENCES "public"."employee"("id");
ALTER TABLE "public"."main_class" ADD CONSTRAINT "fk_main_class_type_id_education_type_id" FOREIGN KEY("type_id") REFERENCES "public"."education_type"("id");
ALTER TABLE "public"."course_material" ADD CONSTRAINT "fk_course_material_upload_by_employee_id" FOREIGN KEY("upload_by") REFERENCES "public"."employee"("id");
ALTER TABLE "public"."course_class" ADD CONSTRAINT "fk_course_class_teacher_id_employee_id" FOREIGN KEY("teacher_id") REFERENCES "public"."employee"("id");
ALTER TABLE "public"."main_class" ADD CONSTRAINT "fk_main_class_teacher_employee_id" FOREIGN KEY("teacher") REFERENCES "public"."employee"("id");
ALTER TABLE "public"."grade_audit" ADD CONSTRAINT "fk_grade_audit_change_by_employee_id" FOREIGN KEY("change_by") REFERENCES "public"."employee"("id");
ALTER TABLE "public"."schedule" ADD CONSTRAINT "fk_schedule_conductor_id_employee_id" FOREIGN KEY("conductor_id") REFERENCES "public"."employee"("id");
ALTER TABLE "public"."attendance_status" ADD CONSTRAINT "fk_attendance_status_enroll_id_enrollment_id" FOREIGN KEY("enroll_id") REFERENCES "public"."enrollment"("id");
ALTER TABLE "public"."invoice_detail" ADD CONSTRAINT "fk_invoice_detail_enrollment_id_enrollment_id" FOREIGN KEY("enrollment_id") REFERENCES "public"."enrollment"("id");
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "fk_enrollment_status_enroll_status_id" FOREIGN KEY("status") REFERENCES "public"."enroll_status"("id");
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "fk_enrollment_student_id_student_id" FOREIGN KEY("student_id") REFERENCES "public"."student"("id");
ALTER TABLE "public"."chat_group_member" ADD CONSTRAINT "fk_chat_group_member_group_id_chat_group_id" FOREIGN KEY("group_id") REFERENCES "public"."chat_group"("id");
ALTER TABLE "public"."chat_group_member" ADD CONSTRAINT "fk_chat_group_member_uid_account_id" FOREIGN KEY("uid") REFERENCES "public"."account"("id");
ALTER TABLE "public"."feature_flag_audit" ADD CONSTRAINT "fk_feature_flag_audit_flag_id_feature_flag_id" FOREIGN KEY("flag_id") REFERENCES "public"."feature_flag"("id");
ALTER TABLE "public"."grade" ADD CONSTRAINT "fk_grade_enrollment_id_enrollment_id" FOREIGN KEY("enrollment_id") REFERENCES "public"."enrollment"("id");
ALTER TABLE "public"."grade_audit" ADD CONSTRAINT "fk_grade_audit_grade_id_grade_id" FOREIGN KEY("grade_id") REFERENCES "public"."grade"("id");
ALTER TABLE "public"."grade" ADD CONSTRAINT "fk_grade_type_id_grade_type_id" FOREIGN KEY("type_id") REFERENCES "public"."grade_type"("id");
ALTER TABLE "public"."group_role_authority" ADD CONSTRAINT "fk_group_role_authority_authority_id_group_authority_id" FOREIGN KEY("authority_id") REFERENCES "public"."group_authority"("id");
ALTER TABLE "public"."group_role_authority" ADD CONSTRAINT "fk_group_role_authority_role_id_group_role_id" FOREIGN KEY("role_id") REFERENCES "public"."group_role"("id");
ALTER TABLE "public"."member_role" ADD CONSTRAINT "fk_member_role_role_id_group_role_id" FOREIGN KEY("role_id") REFERENCES "public"."group_role"("id");
ALTER TABLE "public"."invoice_detail" ADD CONSTRAINT "fk_invoice_detail_invoice_id_invoice_id" FOREIGN KEY("invoice_id") REFERENCES "public"."invoice"("id");
ALTER TABLE "public"."transaction" ADD CONSTRAINT "fk_transaction_invoice_id_invoice_id" FOREIGN KEY("invoice_id") REFERENCES "public"."invoice"("id");
ALTER TABLE "public"."curriculum_subject" ADD CONSTRAINT "fk_curriculum_subject_knowledge_block_id_knowledge_block_id" FOREIGN KEY("knowledge_block_id") REFERENCES "public"."knowledge_block"("id");
ALTER TABLE "public"."knowledge_block" ADD CONSTRAINT "fk_knowledge_block_parent_id_knowledge_block_id" FOREIGN KEY("parent_id") REFERENCES "public"."knowledge_block"("id");
ALTER TABLE "public"."main_class_member" ADD CONSTRAINT "fk_main_class_member_class_id_main_class_id" FOREIGN KEY("class_id") REFERENCES "public"."main_class"("id");
ALTER TABLE "public"."main_class_member" ADD CONSTRAINT "fk_main_class_member_role_id_class_role_id" FOREIGN KEY("role_id") REFERENCES "public"."class_role"("id");
ALTER TABLE "public"."curriculum" ADD CONSTRAINT "fk_curriculum_major_id_major_id" FOREIGN KEY("major_id") REFERENCES "public"."major"("id");
ALTER TABLE "public"."main_class" ADD CONSTRAINT "fk_main_class_major_id_major_id" FOREIGN KEY("major_id") REFERENCES "public"."major"("id");
ALTER TABLE "public"."tuition_fee_config" ADD CONSTRAINT "fk_tuition_fee_config_major_id_major_id" FOREIGN KEY("major_id") REFERENCES "public"."major"("id");
ALTER TABLE "public"."message" ADD CONSTRAINT "fk_message_group_id_chat_group_id" FOREIGN KEY("group_id") REFERENCES "public"."chat_group"("id");
ALTER TABLE "public"."message_read" ADD CONSTRAINT "fk_message_read_message_id_message_id" FOREIGN KEY("message_id") REFERENCES "public"."message"("id");
ALTER TABLE "public"."message" ADD CONSTRAINT "fk_message_reply_to_id_message_id" FOREIGN KEY("reply_to_id") REFERENCES "public"."message"("id");
ALTER TABLE "public"."notification_recipient" ADD CONSTRAINT "fk_notification_recipient_notification_id_notification_id" FOREIGN KEY("notification_id") REFERENCES "public"."notification"("id");
ALTER TABLE "public"."notification" ADD CONSTRAINT "fk_notification_template_id_notification_template_id" FOREIGN KEY("template_id") REFERENCES "public"."notification_template"("id");
ALTER TABLE "public"."profile_schema_field" ADD CONSTRAINT "fk_profile_schema_field_field_id_profile_field_id" FOREIGN KEY("field_id") REFERENCES "public"."profile_field"("id");
ALTER TABLE "public"."student" ADD CONSTRAINT "fk_student_profile_id_profile_id" FOREIGN KEY("profile_id") REFERENCES "public"."profile"("id");
ALTER TABLE "public"."employee" ADD CONSTRAINT "fk_employee_profile_id_profile_id" FOREIGN KEY("profile_id") REFERENCES "public"."profile"("id");
ALTER TABLE "public"."profile" ADD CONSTRAINT "fk_profile_schema_id_profile_schema_id" FOREIGN KEY("schema_id") REFERENCES "public"."profile_schema"("id");
ALTER TABLE "public"."profile_schema_field" ADD CONSTRAINT "fk_profile_schema_field_schema_id_profile_schema_id" FOREIGN KEY("schema_id") REFERENCES "public"."profile_schema"("id");
ALTER TABLE "public"."schedule" ADD CONSTRAINT "fk_schedule_room_id_room_id" FOREIGN KEY("room_id") REFERENCES "public"."room"("id");
ALTER TABLE "public"."attendance_status" ADD CONSTRAINT "fk_attendance_status_schedule_id_schedule_id" FOREIGN KEY("schedule_id") REFERENCES "public"."schedule"("id");
ALTER TABLE "public"."schedule" ADD CONSTRAINT "fk_schedule_status_id_schedule_status_id" FOREIGN KEY("status_id") REFERENCES "public"."schedule_status"("id");
ALTER TABLE "public"."schedule" ADD CONSTRAINT "fk_schedule_type_schedule_type_id" FOREIGN KEY("type") REFERENCES "public"."schedule_type"("id");
ALTER TABLE "public"."student_scholarship" ADD CONSTRAINT "fk_student_scholarship_policy_id_scholarship_policy_id" FOREIGN KEY("policy_id") REFERENCES "public"."scholarship_policy"("id");
ALTER TABLE "public"."course_class" ADD CONSTRAINT "fk_course_class_semester_id_semester_id" FOREIGN KEY("semester_id") REFERENCES "public"."semester"("id");
ALTER TABLE "public"."invoice" ADD CONSTRAINT "fk_invoice_semester_id_semester_id" FOREIGN KEY("semester_id") REFERENCES "public"."semester"("id");
ALTER TABLE "public"."registration_period" ADD CONSTRAINT "fk_registration_period_semester_id_semester_id" FOREIGN KEY("semester_id") REFERENCES "public"."semester"("id");
ALTER TABLE "public"."student_scholarship" ADD CONSTRAINT "fk_student_scholarship_semester_id_semester_id" FOREIGN KEY("semester_id") REFERENCES "public"."semester"("id");
ALTER TABLE "public"."main_class_member" ADD CONSTRAINT "fk_main_class_member_student_id_student_id" FOREIGN KEY("student_id") REFERENCES "public"."student"("id");
ALTER TABLE "public"."invoice" ADD CONSTRAINT "fk_invoice_student_id_student_id" FOREIGN KEY("student_id") REFERENCES "public"."student"("id");
ALTER TABLE "public"."student_scholarship" ADD CONSTRAINT "fk_student_scholarship_student_id_student_id" FOREIGN KEY("student_id") REFERENCES "public"."student"("id");
ALTER TABLE "public"."course_class" ADD CONSTRAINT "fk_course_class_subject_id_subject_id" FOREIGN KEY("subject_id") REFERENCES "public"."subject"("id");
ALTER TABLE "public"."curriculum_subject" ADD CONSTRAINT "fk_curriculum_subject_subject_id_subject_id" FOREIGN KEY("subject_id") REFERENCES "public"."subject"("id");
ALTER TABLE "public"."subject_prerequisite" ADD CONSTRAINT "fk_subject_prerequisite_prerequisite_id_subject_id" FOREIGN KEY("prerequisite_id") REFERENCES "public"."subject"("id");
ALTER TABLE "public"."subject_prerequisite" ADD CONSTRAINT "fk_subject_prerequisite_subject_id_subject_id" FOREIGN KEY("subject_id") REFERENCES "public"."subject"("id");
ALTER TABLE "public"."system_role_authority" ADD CONSTRAINT "fk_system_role_authority_authority_id_system_authority_id" FOREIGN KEY("authority_id") REFERENCES "public"."system_authority"("id");
ALTER TABLE "public"."system_broadcast_read" ADD CONSTRAINT "fk_system_broadcast_read_broadcast_id_system_broadcast_id" FOREIGN KEY("broadcast_id") REFERENCES "public"."system_broadcast"("id");
ALTER TABLE "public"."user_system_role" ADD CONSTRAINT "fk_user_system_role_system_role_system_role_id" FOREIGN KEY("system_role") REFERENCES "public"."system_role"("id");
ALTER TABLE "public"."system_role_authority" ADD CONSTRAINT "fk_system_role_authority_role_id_system_role_id" FOREIGN KEY("role_id") REFERENCES "public"."system_role"("id");