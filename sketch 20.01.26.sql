CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "enum_account_type" AS ENUM ('student', 'employee', 'tech', 'dev');
CREATE TYPE "enum_gender" AS ENUM ('male', 'female', 'others');
CREATE TYPE "enum_msg_state" AS ENUM ('sent', 'received', 'read', 'pending_delete', 'archived');

CREATE TABLE "public"."group_role_authority" (
    "role_id" bigint NOT NULL,
    "authority_id" varchar(255) NOT NULL,
    PRIMARY KEY ("role_id", "authority_id")
);

CREATE TABLE "public"."main_class" (
    "monitor" uuid UNIQUE,
    "id" uuid NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "teacher" uuid NOT NULL,
    "major_id" uuid NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."enrollment" (
    "id" bigserial NOT NULL,
    "student_id" uuid NOT NULL,
    "course_class_id" uuid NOT NULL,
    "status" smallint,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);
-- Indexes
CREATE UNIQUE INDEX "enrollment_enrollment_index_0" ON "public"."enrollment" ("student_id", "course_class_id");

CREATE TABLE "public"."subject" (
    "id" uuid NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "name" varchar(255) NOT NULL,
    "credits" smallint NOT NULL,
    "major_id" varchar(30),
    "des" varchar(255),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."mess2target" (
    "id" bigserial NOT NULL,
    "msg_id" bigint NOT NULL,
    "target_id" bigint,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."schedule_type" (
    "id" smallint NOT NULL,
    "code" varchar(30) NOT NULL,
    "name" varchar(255),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."notif" (
    "id" bigserial NOT NULL,
    "is_read" boolean NOT NULL,
    "title" varchar(255) NOT NULL,
    "sub" varchar(512),
    "action" jsonb NOT NULL,
    "src" bigint,
    "target" uuid NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."account" (
    "id" uuid NOT NULL,
    "username" varchar(255) NOT NULL UNIQUE,
    "pwd_hash" varchar(255) NOT NULL,
    "type" enum_account_type,
    PRIMARY KEY ("id")
);
-- Indexes
CREATE INDEX "account_idx_acc_usrname" ON "public"."account" ("username");

CREATE TABLE "public"."grade" (
    "id" bigint,
    "type_id" bigint NOT NULL,
    "enrollment_id" bigint NOT NULL UNIQUE,
    "score" real
);

CREATE TABLE "public"."group_authority" (
    "id" varchar(255) NOT NULL,
    "name" varchar(255) NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."target" (
    "id" bigserial NOT NULL,
    "type" varchar(255) NOT NULL,
    "entity_id" uuid,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."grade_type" (
    "id" bigint NOT NULL,
    "code" varchar(30) NOT NULL,
    "weight" smallint NOT NULL,
    "name" varchar(255),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."msg_state" (
    "msg_id" bigint NOT NULL,
    "recipient" uuid NOT NULL,
    "state" enum_msg_state NOT NULL DEFAULT 'sent',
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" timestamptz,
    "expired_at" timestamptz,
    PRIMARY KEY ("msg_id", "recipient")
);

CREATE TABLE "public"."group_role" (
    "id" bigint NOT NULL,
    "name" varchar(255),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."major" (
    "id" uuid NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "des" varchar(512),
    "department_id" uuid NOT NULL,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."enroll_status" (
    "id" smallint NOT NULL,
    "code" varchar(30),
    "name" varchar(255),
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."department" (
    "head" uuid,
    "id" uuid NOT NULL,
    "code" varchar(30) UNIQUE,
    "name" varchar(255) NOT NULL,
    "des" varchar(512),
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."course_class" (
    "id" uuid NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "teacher_id" uuid NOT NULL,
    "subject_id" uuid NOT NULL,
    "create_at" timestamptz,
    "cap" smallint NOT NULL DEFAULT 30,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."schedule" (
    "id" bigserial NOT NULL,
    "type" smallint NOT NULL,
    "course_class_id" uuid NOT NULL,
    "start_time" time NOT NULL,
    "end_time" time NOT NULL,
    "m_per_period" int DEFAULT 45,
    "start_date" date NOT NULL,
    "end_date" date NOT NULL,
    "week_day" varchar(3)[] NOT NULL,
    "note" varchar(512),
    PRIMARY KEY ("id")
);
-- Indexes
CREATE INDEX "schedule_idx_schedule_c_class" ON "public"."schedule" ("course_class_id");

CREATE TABLE "public"."chat_group" (
    "id" uuid NOT NULL,
    "type" varchar(255) NOT NULL,
    "head" uuid NOT NULL,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."acc_group" (
    "role" bigint,
    "group_id" uuid NOT NULL,
    "uid" uuid NOT NULL,
    "create_at" timestamptz,
    PRIMARY KEY ("group_id", "uid")
);

CREATE TABLE "public"."message" (
    "id" bigserial NOT NULL,
    "source" varchar(255),
    "type" varchar(255),
    "group_id" uuid,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" timestamptz,
    "payload" jsonb NOT NULL,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."employee" (
    "account_id" uuid UNIQUE,
    "id" uuid NOT NULL,
    "code" varchar(30) NOT NULL UNIQUE,
    "fullname" varchar(255) NOT NULL,
    "gender" enum_gender NOT NULL,
    "dob" date,
    "role_id" varchar(30) NOT NULL,
    "address" varchar(512) NOT NULL,
    "country_code" varchar(2) NOT NULL DEFAULT 'VN',
    "national_id" varchar(255),
    "department_id" uuid NOT NULL,
    "create_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);

CREATE TABLE "public"."student" (
    "account_id" uuid UNIQUE,
    "id" uuid NOT NULL,
    "main_class_id" varchar(30),
    "code" varchar(30) NOT NULL UNIQUE,
    "fullname" varchar(255) NOT NULL,
    "gender" enum_gender NOT NULL,
    "dob" date,
    "address" varchar(512),
    "country_code" varchar(2) DEFAULT 'VN',
    "national_id" varchar(255),
    PRIMARY KEY ("id")
);

-- Foreign key constraints
-- Schema: public
ALTER TABLE "public"."chat_group" ADD CONSTRAINT "fk_chat_group_head_account_id" FOREIGN KEY("head") REFERENCES "public"."account"("id");
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "fk_enrollment_course_class_id_course_class_id" FOREIGN KEY("course_class_id") REFERENCES "public"."course_class"("id");
ALTER TABLE "public"."schedule" ADD CONSTRAINT "fk_schedule_course_class_id_course_class_id" FOREIGN KEY("course_class_id") REFERENCES "public"."course_class"("id");
ALTER TABLE "public"."major" ADD CONSTRAINT "fk_major_department_id_department_id" FOREIGN KEY("department_id") REFERENCES "public"."department"("id");
ALTER TABLE "public"."employee" ADD CONSTRAINT "fk_employee_department_id_department_id" FOREIGN KEY("department_id") REFERENCES "public"."department"("id");
ALTER TABLE "public"."course_class" ADD CONSTRAINT "fk_course_class_teacher_id_employee_id" FOREIGN KEY("teacher_id") REFERENCES "public"."employee"("id");
ALTER TABLE "public"."main_class" ADD CONSTRAINT "fk_main_class_teacher_employee_id" FOREIGN KEY("teacher") REFERENCES "public"."employee"("id");
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "fk_enrollment_status_enroll_status_id" FOREIGN KEY("status") REFERENCES "public"."enroll_status"("id");
ALTER TABLE "public"."enrollment" ADD CONSTRAINT "fk_enrollment_student_id_student_id" FOREIGN KEY("student_id") REFERENCES "public"."student"("id");
ALTER TABLE "public"."acc_group" ADD CONSTRAINT "fk_acc_group_group_id_chat_group_id" FOREIGN KEY("group_id") REFERENCES "public"."chat_group"("id");
ALTER TABLE "public"."acc_group" ADD CONSTRAINT "fk_acc_group_role_group_role_id" FOREIGN KEY("role") REFERENCES "public"."group_role"("id");
ALTER TABLE "public"."acc_group" ADD CONSTRAINT "fk_acc_group_uid_account_id" FOREIGN KEY("uid") REFERENCES "public"."account"("id");
ALTER TABLE "public"."grade" ADD CONSTRAINT "fk_grade_enrollment_id_enrollment_id" FOREIGN KEY("enrollment_id") REFERENCES "public"."enrollment"("id");
ALTER TABLE "public"."grade" ADD CONSTRAINT "fk_grade_type_id_grade_type_id" FOREIGN KEY("type_id") REFERENCES "public"."grade_type"("id");
ALTER TABLE "public"."group_role_authority" ADD CONSTRAINT "fk_group_role_authority_authority_id_group_authority_id" FOREIGN KEY("authority_id") REFERENCES "public"."group_authority"("id");
ALTER TABLE "public"."group_role_authority" ADD CONSTRAINT "fk_group_role_authority_role_id_group_role_id" FOREIGN KEY("role_id") REFERENCES "public"."group_role"("id");
ALTER TABLE "public"."main_class" ADD CONSTRAINT "fk_main_class_major_id_major_id" FOREIGN KEY("major_id") REFERENCES "public"."major"("id");
ALTER TABLE "public"."subject" ADD CONSTRAINT "fk_subject_major_id_major_id" FOREIGN KEY("major_id") REFERENCES "public"."major"("id");
ALTER TABLE "public"."mess2target" ADD CONSTRAINT "fk_mess2target_msg_id_message_id" FOREIGN KEY("msg_id") REFERENCES "public"."message"("id");
ALTER TABLE "public"."mess2target" ADD CONSTRAINT "fk_mess2target_target_id_target_id" FOREIGN KEY("target_id") REFERENCES "public"."target"("id");
ALTER TABLE "public"."message" ADD CONSTRAINT "fk_message_group_id_chat_group_id" FOREIGN KEY("group_id") REFERENCES "public"."chat_group"("id");
ALTER TABLE "public"."msg_state" ADD CONSTRAINT "fk_msg_state_msg_id_message_id" FOREIGN KEY("msg_id") REFERENCES "public"."message"("id");
ALTER TABLE "public"."msg_state" ADD CONSTRAINT "fk_msg_state_recipient_student_account_id" FOREIGN KEY("recipient") REFERENCES "public"."student"("account_id");
ALTER TABLE "public"."notif" ADD CONSTRAINT "fk_notif_src_message_id" FOREIGN KEY("src") REFERENCES "public"."message"("id");
ALTER TABLE "public"."notif" ADD CONSTRAINT "fk_notif_target_account_id" FOREIGN KEY("target") REFERENCES "public"."account"("id");
ALTER TABLE "public"."schedule" ADD CONSTRAINT "fk_schedule_type_schedule_type_id" FOREIGN KEY("type") REFERENCES "public"."schedule_type"("id");
ALTER TABLE "public"."student" ADD CONSTRAINT "fk_student_main_class_id_main_class_id" FOREIGN KEY("main_class_id") REFERENCES "public"."main_class"("id");
ALTER TABLE "public"."course_class" ADD CONSTRAINT "fk_course_class_subject_id_subject_id" FOREIGN KEY("subject_id") REFERENCES "public"."subject"("id");
