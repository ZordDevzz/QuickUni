CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "users";
--> statement-breakpoint
CREATE SCHEMA "academic";
--> statement-breakpoint
CREATE SCHEMA "course";
--> statement-breakpoint
CREATE SCHEMA "schedule";
--> statement-breakpoint
CREATE SCHEMA "grade";
--> statement-breakpoint
CREATE SCHEMA "finance";
--> statement-breakpoint
CREATE SCHEMA "communication";
--> statement-breakpoint
CREATE SCHEMA "system";
--> statement-breakpoint
CREATE TYPE "public"."enum_account_type" AS ENUM('student', 'employee', 'tech', 'dev');--> statement-breakpoint
CREATE TYPE "public"."enum_attendance_state" AS ENUM('present', 'absent', 'late', 'excused');--> statement-breakpoint
CREATE TYPE "public"."enum_discount_type" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."enum_gender" AS ENUM('male', 'female', 'others');--> statement-breakpoint
CREATE TYPE "public"."enum_msg_state" AS ENUM('archived', 'deleted', 'normal');--> statement-breakpoint
CREATE TYPE "public"."enum_payment_status" AS ENUM('pending', 'paid', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'email', 'push', 'sms');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('queued', 'sent', 'failed', 'read', 'unread');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('system', 'academic', 'finance', 'social');--> statement-breakpoint
CREATE TABLE "auth"."account" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"pwd_hash" varchar(255) NOT NULL,
	"type" "enum_account_type",
	"email" varchar(255),
	"phone" varchar(20),
	"status" varchar(20) DEFAULT 'active',
	"last_login_at" timestamp with time zone,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "account_username_key" UNIQUE("username"),
	CONSTRAINT "account_email_key" UNIQUE("email"),
	CONSTRAINT "account_phone_key" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "auth"."account_audit" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"performed_by" uuid,
	"action" varchar(100) NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."system_authority" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"des" text,
	"is_sensitive" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth"."system_role" (
	"id" bigint PRIMARY KEY NOT NULL,
	"is_default_role" boolean,
	"name" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "auth"."system_role_authority" (
	"role_id" bigint NOT NULL,
	"authority_id" varchar(255) NOT NULL,
	CONSTRAINT "system_role_authority_pkey" PRIMARY KEY("role_id","authority_id")
);
--> statement-breakpoint
CREATE TABLE "auth"."user_device_token" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"device_token" varchar(512) NOT NULL,
	"platform" varchar(20),
	"last_active_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "auth"."user_system_role" (
	"user_id" uuid NOT NULL,
	"system_role" bigint NOT NULL,
	CONSTRAINT "user_system_role_pkey" PRIMARY KEY("user_id","system_role")
);
--> statement-breakpoint
CREATE TABLE "users"."employee" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"profile_id" uuid,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "employee_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users"."profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"account_id" uuid,
	"fullname" varchar(255),
	"gender" "enum_gender" NOT NULL,
	"dob" date NOT NULL,
	"address" text,
	"country_code" varchar(2),
	"national_id" varchar(255) NOT NULL,
	"ethnic" varchar(255),
	"religious" varchar(255),
	"schema_id" bigint NOT NULL,
	"dynamic_data" jsonb,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "profile_national_id_key" UNIQUE("national_id")
);
--> statement-breakpoint
CREATE TABLE "users"."profile_field" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"datatype" varchar(255),
	"ui_section" varchar(255) NOT NULL,
	"create_at" timestamp with time zone NOT NULL,
	"update_at" timestamp with time zone,
	"label" varchar(255),
	"des" text
);
--> statement-breakpoint
CREATE TABLE "users"."profile_schema" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"effective_date" date NOT NULL,
	"expired_date" date,
	"schema_code" varchar(255) NOT NULL,
	"create_at" timestamp with time zone NOT NULL,
	"update_at" timestamp with time zone,
	"des" text
);
--> statement-breakpoint
CREATE TABLE "users"."profile_schema_field" (
	"field_id" bigint NOT NULL,
	"schema_id" bigint NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	CONSTRAINT "profile_schema_field_pkey" PRIMARY KEY("field_id","schema_id")
);
--> statement-breakpoint
CREATE TABLE "users"."student" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"profile_id" uuid NOT NULL,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "student_code_key" UNIQUE("code"),
	CONSTRAINT "student_profile_id_key" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "academic"."curriculum" (
	"id" serial PRIMARY KEY NOT NULL,
	"major_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"academic_year" smallint NOT NULL,
	"total_credits" smallint,
	"des" text,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"update_at" timestamp with time zone,
	CONSTRAINT "curriculum_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "academic"."curriculum_subject" (
	"subject_id" uuid NOT NULL,
	"curriculum_id" integer NOT NULL,
	"semester_index" smallint,
	"is_compulsory" boolean DEFAULT true,
	"knowledge_block_id" smallint,
	CONSTRAINT "curriculum_subject_pkey" PRIMARY KEY("subject_id","curriculum_id")
);
--> statement-breakpoint
CREATE TABLE "academic"."department" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(30),
	"name" varchar(255) NOT NULL,
	"des" varchar(512),
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "department_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "academic"."education_type" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"name" varchar(255) NOT NULL,
	"des" varchar(512),
	"length" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academic"."knowledge_block" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"name" varchar(255) NOT NULL,
	"parent_id" smallint,
	"des" text,
	CONSTRAINT "knowledge_block_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "academic"."major" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"des" varchar(512),
	"department_id" uuid NOT NULL,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "major_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "academic"."registration_period" (
	"id" serial PRIMARY KEY NOT NULL,
	"semester_id" smallint NOT NULL,
	"name" varchar(255),
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "academic"."semester" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"name" varchar(255) NOT NULL,
	"academic_year" smallint NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_current" boolean DEFAULT false,
	CONSTRAINT "semester_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "academic"."subject" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"name" varchar(255) NOT NULL,
	"credits" smallint NOT NULL,
	"des" varchar(255),
	"recommended_semester_index" smallint,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "subject_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "academic"."subject_prerequisite" (
	"subject_id" uuid NOT NULL,
	"prerequisite_id" uuid NOT NULL,
	"type" varchar(50),
	CONSTRAINT "subject_prerequisite_pkey" PRIMARY KEY("subject_id","prerequisite_id")
);
--> statement-breakpoint
CREATE TABLE "course"."assignment" (
	"id" bigint PRIMARY KEY NOT NULL,
	"title" varchar(512),
	"data" jsonb,
	"course_class_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course"."class_role" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"name" varchar(255),
	"des" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "course"."course_class" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"teacher_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"cap" smallint DEFAULT 30 NOT NULL,
	"current_slot" smallint DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'opened',
	"type" smallint NOT NULL,
	"semester_id" smallint NOT NULL,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"update_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "course_class_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "course"."course_class_type" (
	"id" smallint PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"name" varchar(255),
	"des" text,
	CONSTRAINT "course_class_type_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "course"."course_material" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"course_class_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"upload_by" uuid,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "course"."enroll_status" (
	"id" smallint PRIMARY KEY NOT NULL,
	"code" varchar(30),
	"name" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "course"."enrollment" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"status" smallint,
	"student_id" uuid NOT NULL,
	"course_class_id" uuid NOT NULL,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "course"."main_class" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"teacher" uuid NOT NULL,
	"type_id" smallint,
	"major_id" uuid NOT NULL,
	"academic_year" smallint NOT NULL,
	CONSTRAINT "main_class_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "course"."main_class_member" (
	"student_id" uuid NOT NULL,
	"role_id" smallint,
	"class_id" uuid NOT NULL,
	CONSTRAINT "main_class_member_pkey" PRIMARY KEY("student_id","class_id")
);
--> statement-breakpoint
CREATE TABLE "schedule"."attendance_status" (
	"enroll_id" bigint NOT NULL,
	"schedule_id" bigint NOT NULL,
	"state" "enum_attendance_state" NOT NULL,
	"note" varchar(255),
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"update_at" timestamp with time zone,
	CONSTRAINT "attendance_status_pkey" PRIMARY KEY("enroll_id","schedule_id")
);
--> statement-breakpoint
CREATE TABLE "schedule"."building" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"name" varchar(255),
	"des" text,
	CONSTRAINT "building_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "schedule"."room" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"building_id" smallint NOT NULL,
	"capacity" smallint,
	"type" varchar(50),
	CONSTRAINT "room_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "schedule"."schedule" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"type" smallint NOT NULL,
	"course_class_id" uuid NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"period" smallint NOT NULL,
	"m_per_period" integer DEFAULT 45,
	"sch_date" date NOT NULL,
	"note" varchar(512),
	"status_id" smallint,
	"conductor_id" uuid,
	"room_id" smallint,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"update_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "schedule"."schedule_status" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"code" varchar(30),
	"name" varchar(255),
	"des" text,
	"is_complete" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule"."schedule_type" (
	"id" smallint PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"name" varchar(255),
	"des" text
);
--> statement-breakpoint
CREATE TABLE "grade"."grade" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"enrollment_id" bigint NOT NULL,
	"type_id" bigint NOT NULL,
	"assignment_id" bigint,
	"score" numeric(5, 2) NOT NULL,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "grade"."grade_audit" (
	"id" bigint PRIMARY KEY NOT NULL,
	"grade_id" bigint NOT NULL,
	"change_by" uuid NOT NULL,
	"old_score" numeric(5, 2) NOT NULL,
	"new_score" numeric(5, 2),
	"change_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grade"."grade_scale" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"min_score_10" numeric(4, 2),
	"letter_grade" varchar(5),
	"gpa_score_4" numeric(4, 2),
	"des" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "grade"."grade_type" (
	"id" bigint PRIMARY KEY NOT NULL,
	"code" varchar(30) NOT NULL,
	"weight" smallint NOT NULL,
	"name" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "finance"."invoice" (
	"id" uuid PRIMARY KEY NOT NULL,
	"student_id" uuid NOT NULL,
	"semester_id" smallint NOT NULL,
	"original_amount" numeric(15, 2) NOT NULL,
	"discount_amount" numeric(15, 2) DEFAULT '0',
	"final_amount" numeric(15, 2) NOT NULL,
	"status" "enum_payment_status",
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"update_at" timestamp with time zone,
	"due_date" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "finance"."invoice_detail" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"invoice_id" uuid NOT NULL,
	"enrollment_id" bigint NOT NULL,
	"credit_price" numeric(10, 2) NOT NULL,
	"subject_credits" smallint NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"note" varchar(255),
	CONSTRAINT "invoice_detail_enrollment_id_key" UNIQUE("enrollment_id")
);
--> statement-breakpoint
CREATE TABLE "finance"."scholarship_policy" (
	"id" "smallserial" PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "enum_discount_type" NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"des" text,
	CONSTRAINT "scholarship_policy_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "finance"."student_scholarship" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"student_id" uuid NOT NULL,
	"policy_id" smallint NOT NULL,
	"semester_id" smallint NOT NULL,
	"is_active" boolean DEFAULT true,
	"grant_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "finance"."transaction" (
	"id" uuid PRIMARY KEY NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(15, 2),
	"payment_method" varchar(50),
	"transaction_code" varchar(255),
	"pay_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "finance"."tuition_fee_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"major_id" uuid,
	"academic_year" smallint NOT NULL,
	"price_per_credit" numeric(10, 2) NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "communication"."chat_group" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" varchar(255) NOT NULL,
	"head" uuid NOT NULL,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication"."chat_group_member" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"group_id" uuid NOT NULL,
	"uid" uuid NOT NULL,
	"create_at" timestamp with time zone,
	"nickname" varchar(255),
	"pfp_url" text
);
--> statement-breakpoint
CREATE TABLE "communication"."group_authority" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication"."group_role" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"group_id" uuid,
	"is_group_role" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication"."group_role_authority" (
	"authority_id" varchar(255) NOT NULL,
	"role_id" bigint NOT NULL,
	CONSTRAINT "group_role_authority_pkey" PRIMARY KEY("authority_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "communication"."member_role" (
	"role_id" bigint NOT NULL,
	"member_id" bigint NOT NULL,
	CONSTRAINT "member_role_pkey" PRIMARY KEY("role_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "communication"."message" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"reply_to_id" bigint,
	"type" varchar(255),
	"group_id" uuid,
	"sender" uuid,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp with time zone,
	"payload" jsonb NOT NULL,
	"state" "enum_msg_state",
	"is_pinned" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "communication"."message_read" (
	"message_id" bigint NOT NULL,
	"recipient_id" uuid NOT NULL,
	CONSTRAINT "message_read_pkey" PRIMARY KEY("message_id","recipient_id")
);
--> statement-breakpoint
CREATE TABLE "communication"."notification" (
	"id" uuid PRIMARY KEY NOT NULL,
	"template_id" integer,
	"actor_id" uuid,
	"title" varchar(255) NOT NULL,
	"body" text,
	"data" jsonb,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication"."notification_recipient" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"notification_id" uuid NOT NULL,
	"recipient_id" uuid NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"status" "notification_status" DEFAULT 'unread',
	"create_at" timestamp with time zone NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "communication"."notification_template" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"title_template" varchar(255) NOT NULL,
	"body_template" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"update_at" timestamp with time zone,
	CONSTRAINT "notification_template_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "communication"."system_broadcast" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255),
	"body" text,
	"target_roles" jsonb,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"expire_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "communication"."system_broadcast_read" (
	"broadcast_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "system_broadcast_read_pkey" PRIMARY KEY("broadcast_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "communication"."user_notification_setting" (
	"user_id" uuid NOT NULL,
	"notification_type" "notification_type" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"is_enabled" boolean DEFAULT true,
	CONSTRAINT "user_notification_setting_pkey" PRIMARY KEY("user_id","notification_type","channel")
);
--> statement-breakpoint
CREATE TABLE "system"."archive" (
	"id" bigint PRIMARY KEY NOT NULL,
	"origin" varchar(255),
	"data" json,
	"create_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "system"."department_employment" (
	"employee_id" uuid NOT NULL,
	"department_id" uuid NOT NULL,
	"assign_date" date NOT NULL,
	"unassign_date" date,
	"role_code" varchar(30),
	"role_name" varchar(255),
	CONSTRAINT "department_employment_pkey" PRIMARY KEY("employee_id","department_id")
);
--> statement-breakpoint
CREATE TABLE "system"."feature_flag" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"enabled" boolean,
	"display_name" varchar(255),
	"version" varchar(30),
	"des" text,
	"target" jsonb,
	"create_at" timestamp with time zone NOT NULL,
	"update_at" timestamp with time zone,
	"update_by" uuid,
	"expires_at" timestamp with time zone,
	"status" varchar(30)
);
--> statement-breakpoint
CREATE TABLE "system"."feature_flag_audit" (
	"id" bigint PRIMARY KEY NOT NULL,
	"change_by" uuid NOT NULL,
	"flag_id" varchar(255) NOT NULL,
	"old_enabled" boolean NOT NULL,
	"new_enabled" boolean NOT NULL,
	"change_at" timestamp with time zone NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "system"."system_audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"target_resource" varchar(100),
	"target_id" varchar(255),
	"payload" jsonb,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "system"."system_setting" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" jsonb,
	"value_type" varchar(255),
	"display_name" varchar(255),
	"des" text,
	"update_at" timestamp with time zone,
	"update_by" uuid,
	"is_sensitive" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auth"."account_audit" ADD CONSTRAINT "fk_account_audit_account_id_account_id" FOREIGN KEY ("account_id") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."account_audit" ADD CONSTRAINT "fk_account_audit_performed_by_account_id" FOREIGN KEY ("performed_by") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."system_role_authority" ADD CONSTRAINT "fk_system_role_authority_authority_id_system_authority_id" FOREIGN KEY ("authority_id") REFERENCES "auth"."system_authority"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."system_role_authority" ADD CONSTRAINT "fk_system_role_authority_role_id_system_role_id" FOREIGN KEY ("role_id") REFERENCES "auth"."system_role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."user_device_token" ADD CONSTRAINT "fk_user_device_token_user_id_account_id" FOREIGN KEY ("user_id") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."user_system_role" ADD CONSTRAINT "fk_user_system_role_user_id_account_id" FOREIGN KEY ("user_id") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth"."user_system_role" ADD CONSTRAINT "fk_user_system_role_system_role_system_role_id" FOREIGN KEY ("system_role") REFERENCES "auth"."system_role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."employee" ADD CONSTRAINT "fk_employee_profile_id_profile_id" FOREIGN KEY ("profile_id") REFERENCES "users"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."profile" ADD CONSTRAINT "fk_profile_account_id_account_id" FOREIGN KEY ("account_id") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."profile" ADD CONSTRAINT "fk_profile_schema_id_profile_schema_id" FOREIGN KEY ("schema_id") REFERENCES "users"."profile_schema"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."profile_schema_field" ADD CONSTRAINT "fk_profile_schema_field_field_id_profile_field_id" FOREIGN KEY ("field_id") REFERENCES "users"."profile_field"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."profile_schema_field" ADD CONSTRAINT "fk_profile_schema_field_schema_id_profile_schema_id" FOREIGN KEY ("schema_id") REFERENCES "users"."profile_schema"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."student" ADD CONSTRAINT "fk_student_profile_id_profile_id" FOREIGN KEY ("profile_id") REFERENCES "users"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."curriculum" ADD CONSTRAINT "fk_curriculum_major_id_major_id" FOREIGN KEY ("major_id") REFERENCES "academic"."major"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."curriculum_subject" ADD CONSTRAINT "fk_curriculum_subject_curriculum_id_curriculum_id" FOREIGN KEY ("curriculum_id") REFERENCES "academic"."curriculum"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."curriculum_subject" ADD CONSTRAINT "fk_curriculum_subject_knowledge_block_id_knowledge_block_id" FOREIGN KEY ("knowledge_block_id") REFERENCES "academic"."knowledge_block"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."curriculum_subject" ADD CONSTRAINT "fk_curriculum_subject_subject_id_subject_id" FOREIGN KEY ("subject_id") REFERENCES "academic"."subject"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."knowledge_block" ADD CONSTRAINT "fk_knowledge_block_parent_id_knowledge_block_id" FOREIGN KEY ("parent_id") REFERENCES "academic"."knowledge_block"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."major" ADD CONSTRAINT "fk_major_department_id_department_id" FOREIGN KEY ("department_id") REFERENCES "academic"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."registration_period" ADD CONSTRAINT "fk_registration_period_semester_id_semester_id" FOREIGN KEY ("semester_id") REFERENCES "academic"."semester"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."subject_prerequisite" ADD CONSTRAINT "fk_subject_prerequisite_prerequisite_id_subject_id" FOREIGN KEY ("prerequisite_id") REFERENCES "academic"."subject"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."subject_prerequisite" ADD CONSTRAINT "fk_subject_prerequisite_subject_id_subject_id" FOREIGN KEY ("subject_id") REFERENCES "academic"."subject"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."assignment" ADD CONSTRAINT "fk_assignment_course_class_id_course_class_id" FOREIGN KEY ("course_class_id") REFERENCES "course"."course_class"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."course_class" ADD CONSTRAINT "fk_course_class_type_course_class_type_id" FOREIGN KEY ("type") REFERENCES "course"."course_class_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."course_class" ADD CONSTRAINT "fk_course_class_teacher_id_employee_id" FOREIGN KEY ("teacher_id") REFERENCES "users"."employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."course_class" ADD CONSTRAINT "fk_course_class_semester_id_semester_id" FOREIGN KEY ("semester_id") REFERENCES "academic"."semester"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."course_class" ADD CONSTRAINT "fk_course_class_subject_id_subject_id" FOREIGN KEY ("subject_id") REFERENCES "academic"."subject"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."course_material" ADD CONSTRAINT "fk_course_material_course_class_id_course_class_id" FOREIGN KEY ("course_class_id") REFERENCES "course"."course_class"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."course_material" ADD CONSTRAINT "fk_course_material_upload_by_employee_id" FOREIGN KEY ("upload_by") REFERENCES "users"."employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."enrollment" ADD CONSTRAINT "fk_enrollment_course_class_id_course_class_id" FOREIGN KEY ("course_class_id") REFERENCES "course"."course_class"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."enrollment" ADD CONSTRAINT "fk_enrollment_status_enroll_status_id" FOREIGN KEY ("status") REFERENCES "course"."enroll_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."enrollment" ADD CONSTRAINT "fk_enrollment_student_id_student_id" FOREIGN KEY ("student_id") REFERENCES "users"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."main_class" ADD CONSTRAINT "fk_main_class_type_id_education_type_id" FOREIGN KEY ("type_id") REFERENCES "academic"."education_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."main_class" ADD CONSTRAINT "fk_main_class_teacher_employee_id" FOREIGN KEY ("teacher") REFERENCES "users"."employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."main_class" ADD CONSTRAINT "fk_main_class_major_id_major_id" FOREIGN KEY ("major_id") REFERENCES "academic"."major"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."main_class_member" ADD CONSTRAINT "fk_main_class_member_class_id_main_class_id" FOREIGN KEY ("class_id") REFERENCES "course"."main_class"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."main_class_member" ADD CONSTRAINT "fk_main_class_member_role_id_class_role_id" FOREIGN KEY ("role_id") REFERENCES "course"."class_role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course"."main_class_member" ADD CONSTRAINT "fk_main_class_member_student_id_student_id" FOREIGN KEY ("student_id") REFERENCES "users"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule"."attendance_status" ADD CONSTRAINT "fk_attendance_status_enroll_id_enrollment_id" FOREIGN KEY ("enroll_id") REFERENCES "course"."enrollment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule"."attendance_status" ADD CONSTRAINT "fk_attendance_status_schedule_id_schedule_id" FOREIGN KEY ("schedule_id") REFERENCES "schedule"."schedule"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule"."room" ADD CONSTRAINT "fk_room_building_id_building_id" FOREIGN KEY ("building_id") REFERENCES "schedule"."building"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule"."schedule" ADD CONSTRAINT "fk_schedule_course_class_id_course_class_id" FOREIGN KEY ("course_class_id") REFERENCES "course"."course_class"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule"."schedule" ADD CONSTRAINT "fk_schedule_conductor_id_employee_id" FOREIGN KEY ("conductor_id") REFERENCES "users"."employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule"."schedule" ADD CONSTRAINT "fk_schedule_room_id_room_id" FOREIGN KEY ("room_id") REFERENCES "schedule"."room"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule"."schedule" ADD CONSTRAINT "fk_schedule_status_id_schedule_status_id" FOREIGN KEY ("status_id") REFERENCES "schedule"."schedule_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule"."schedule" ADD CONSTRAINT "fk_schedule_type_schedule_type_id" FOREIGN KEY ("type") REFERENCES "schedule"."schedule_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade"."grade" ADD CONSTRAINT "fk_grade_assignment_id_assignment_id" FOREIGN KEY ("assignment_id") REFERENCES "course"."assignment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade"."grade" ADD CONSTRAINT "fk_grade_enrollment_id_enrollment_id" FOREIGN KEY ("enrollment_id") REFERENCES "course"."enrollment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade"."grade" ADD CONSTRAINT "fk_grade_type_id_grade_type_id" FOREIGN KEY ("type_id") REFERENCES "grade"."grade_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade"."grade_audit" ADD CONSTRAINT "fk_grade_audit_change_by_employee_id" FOREIGN KEY ("change_by") REFERENCES "users"."employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade"."grade_audit" ADD CONSTRAINT "fk_grade_audit_grade_id_grade_id" FOREIGN KEY ("grade_id") REFERENCES "grade"."grade"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."invoice" ADD CONSTRAINT "fk_invoice_semester_id_semester_id" FOREIGN KEY ("semester_id") REFERENCES "academic"."semester"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."invoice" ADD CONSTRAINT "fk_invoice_student_id_student_id" FOREIGN KEY ("student_id") REFERENCES "users"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."invoice_detail" ADD CONSTRAINT "fk_invoice_detail_enrollment_id_enrollment_id" FOREIGN KEY ("enrollment_id") REFERENCES "course"."enrollment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."invoice_detail" ADD CONSTRAINT "fk_invoice_detail_invoice_id_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "finance"."invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."student_scholarship" ADD CONSTRAINT "fk_student_scholarship_policy_id_scholarship_policy_id" FOREIGN KEY ("policy_id") REFERENCES "finance"."scholarship_policy"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."student_scholarship" ADD CONSTRAINT "fk_student_scholarship_semester_id_semester_id" FOREIGN KEY ("semester_id") REFERENCES "academic"."semester"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."student_scholarship" ADD CONSTRAINT "fk_student_scholarship_student_id_student_id" FOREIGN KEY ("student_id") REFERENCES "users"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."transaction" ADD CONSTRAINT "fk_transaction_invoice_id_invoice_id" FOREIGN KEY ("invoice_id") REFERENCES "finance"."invoice"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance"."tuition_fee_config" ADD CONSTRAINT "fk_tuition_fee_config_major_id_major_id" FOREIGN KEY ("major_id") REFERENCES "academic"."major"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."chat_group" ADD CONSTRAINT "fk_chat_group_head_account_id" FOREIGN KEY ("head") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."chat_group_member" ADD CONSTRAINT "fk_chat_group_member_group_id_chat_group_id" FOREIGN KEY ("group_id") REFERENCES "communication"."chat_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."chat_group_member" ADD CONSTRAINT "fk_chat_group_member_uid_account_id" FOREIGN KEY ("uid") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."group_role" ADD CONSTRAINT "fk_group_role_group_id_chat_group_id" FOREIGN KEY ("group_id") REFERENCES "communication"."chat_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."group_role_authority" ADD CONSTRAINT "fk_group_role_authority_authority_id_group_authority_id" FOREIGN KEY ("authority_id") REFERENCES "communication"."group_authority"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."group_role_authority" ADD CONSTRAINT "fk_group_role_authority_role_id_group_role_id" FOREIGN KEY ("role_id") REFERENCES "communication"."group_role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."member_role" ADD CONSTRAINT "fk_member_role_member_id_chat_group_member_id" FOREIGN KEY ("member_id") REFERENCES "communication"."chat_group_member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."member_role" ADD CONSTRAINT "fk_member_role_role_id_group_role_id" FOREIGN KEY ("role_id") REFERENCES "communication"."group_role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."message" ADD CONSTRAINT "fk_message_sender_account_id" FOREIGN KEY ("sender") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."message" ADD CONSTRAINT "fk_message_group_id_chat_group_id" FOREIGN KEY ("group_id") REFERENCES "communication"."chat_group"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."message" ADD CONSTRAINT "fk_message_reply_to_id_message_id" FOREIGN KEY ("reply_to_id") REFERENCES "communication"."message"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."message_read" ADD CONSTRAINT "fk_message_read_recipient_id_account_id" FOREIGN KEY ("recipient_id") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."message_read" ADD CONSTRAINT "fk_message_read_message_id_message_id" FOREIGN KEY ("message_id") REFERENCES "communication"."message"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."notification" ADD CONSTRAINT "fk_notification_actor_id_account_id" FOREIGN KEY ("actor_id") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."notification" ADD CONSTRAINT "fk_notification_template_id_notification_template_id" FOREIGN KEY ("template_id") REFERENCES "communication"."notification_template"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."notification_recipient" ADD CONSTRAINT "fk_notification_recipient_recipient_id_account_id" FOREIGN KEY ("recipient_id") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."notification_recipient" ADD CONSTRAINT "fk_notification_recipient_notification_id_notification_id" FOREIGN KEY ("notification_id") REFERENCES "communication"."notification"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."system_broadcast_read" ADD CONSTRAINT "fk_system_broadcast_read_user_id_account_id" FOREIGN KEY ("user_id") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."system_broadcast_read" ADD CONSTRAINT "fk_system_broadcast_read_broadcast_id_system_broadcast_id" FOREIGN KEY ("broadcast_id") REFERENCES "communication"."system_broadcast"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication"."user_notification_setting" ADD CONSTRAINT "fk_user_notification_setting_user_id_account_id" FOREIGN KEY ("user_id") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."department_employment" ADD CONSTRAINT "fk_department_employment_department_id_department_id" FOREIGN KEY ("department_id") REFERENCES "academic"."department"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."department_employment" ADD CONSTRAINT "fk_department_employment_employee_id_employee_id" FOREIGN KEY ("employee_id") REFERENCES "users"."employee"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."feature_flag" ADD CONSTRAINT "fk_feature_flag_update_by_account_id" FOREIGN KEY ("update_by") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."feature_flag_audit" ADD CONSTRAINT "fk_feature_flag_audit_change_by_account_id" FOREIGN KEY ("change_by") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."feature_flag_audit" ADD CONSTRAINT "fk_feature_flag_audit_flag_id_feature_flag_id" FOREIGN KEY ("flag_id") REFERENCES "system"."feature_flag"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."system_audit_log" ADD CONSTRAINT "fk_system_audit_log_actor_id_account_id" FOREIGN KEY ("actor_id") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system"."system_setting" ADD CONSTRAINT "fk_system_setting_update_by_account_id" FOREIGN KEY ("update_by") REFERENCES "auth"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_idx_acc_usrname" ON "auth"."account" USING btree ("username" text_ops);--> statement-breakpoint
CREATE INDEX "account_audit_idx_account_id" ON "auth"."account_audit" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "account_audit_idx_performed_by" ON "auth"."account_audit" USING btree ("performed_by");--> statement-breakpoint
CREATE UNIQUE INDEX "user_device_token_idx_user_device_token_user_id_device_token" ON "auth"."user_device_token" USING btree ("user_id" uuid_ops,"device_token" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "enrollment_enrollment_index_0" ON "course"."enrollment" USING btree ("student_id" uuid_ops,"course_class_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "schedule_idx_schedule_c_class" ON "schedule"."schedule" USING btree ("course_class_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "schedule_idx_schedule_conductor" ON "schedule"."schedule" USING btree ("conductor_id" uuid_ops,"sch_date" date_ops);--> statement-breakpoint
CREATE INDEX "grade_idx_grade_enrollment_id" ON "grade"."grade" USING btree ("enrollment_id" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "grade_idx_grade_unique_entry" ON "grade"."grade" USING btree ("enrollment_id" int8_ops,"type_id" int8_ops,"assignment_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_student_scholarship_student_id_semester_id" ON "finance"."student_scholarship" USING btree ("student_id" uuid_ops,"semester_id" int2_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "chat_group_member_idx_chat_gmember" ON "communication"."chat_group_member" USING btree ("group_id" uuid_ops,"uid" uuid_ops);--> statement-breakpoint
CREATE INDEX "notification_recipient_idx_notif_feed" ON "communication"."notification_recipient" USING btree ("recipient_id" uuid_ops,"create_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "notification_recipient_idx_notif_unread_count" ON "communication"."notification_recipient" USING btree ("recipient_id" uuid_ops,"status" enum_ops);