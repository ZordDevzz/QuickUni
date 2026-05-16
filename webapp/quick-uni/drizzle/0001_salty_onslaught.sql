CREATE TYPE "schedule"."availability_entity_type" AS ENUM('teacher', 'room', 'subject', 'class', 'global');--> statement-breakpoint
CREATE TYPE "public"."onboarding_session_status" AS ENUM('draft', 'validating', 'ready', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "schedule"."availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" varchar(50) NOT NULL,
	"entity_type" "schedule"."availability_entity_type" NOT NULL,
	"day_of_week" smallint NOT NULL,
	"occupied_mask" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedule"."holiday_blacklist" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_global" boolean DEFAULT true,
	"semester_id" integer
);
--> statement-breakpoint
CREATE TABLE "schedule"."weekly_template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_class_id" uuid NOT NULL,
	"room_id" smallint NOT NULL,
	"day_of_week" smallint NOT NULL,
	"start_period" smallint NOT NULL,
	"end_period" smallint NOT NULL,
	"occupy_mask" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system"."onboarding_session" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"entity_type" varchar(20) NOT NULL,
	"schema_id" bigint NOT NULL,
	"status" "onboarding_session_status" DEFAULT 'draft' NOT NULL,
	"config" jsonb,
	"summary" jsonb,
	"created_by" uuid,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "users"."profile" ADD COLUMN "session_id" uuid;--> statement-breakpoint
ALTER TABLE "schedule"."schedule" ADD COLUMN "end_period" smallint;--> statement-breakpoint
ALTER TABLE "schedule"."holiday_blacklist" ADD CONSTRAINT "fk_holiday_blacklist_semester_id" FOREIGN KEY ("semester_id") REFERENCES "academic"."semester"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule"."weekly_template" ADD CONSTRAINT "fk_weekly_template_course_class_id_course_class_id" FOREIGN KEY ("course_class_id") REFERENCES "course"."course_class"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule"."weekly_template" ADD CONSTRAINT "fk_weekly_template_room_id_room_id" FOREIGN KEY ("room_id") REFERENCES "schedule"."room"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "availability_entity_idx" ON "schedule"."availability" USING btree ("entity_id","entity_type");--> statement-breakpoint
ALTER TABLE "users"."profile" ADD CONSTRAINT "fk_profile_onboarding_session_id" FOREIGN KEY ("session_id") REFERENCES "system"."onboarding_session"("id") ON DELETE no action ON UPDATE no action;