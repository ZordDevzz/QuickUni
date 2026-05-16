CREATE TABLE "users"."profile_section" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"schema_id" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"update_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "users"."profile_schema_field" ADD COLUMN "section_id" bigint;--> statement-breakpoint
ALTER TABLE "users"."profile_schema_field" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users"."profile_section" ADD CONSTRAINT "fk_profile_section_schema_id" FOREIGN KEY ("schema_id") REFERENCES "users"."profile_schema"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."profile_schema_field" ADD CONSTRAINT "fk_profile_schema_field_section_id" FOREIGN KEY ("section_id") REFERENCES "users"."profile_section"("id") ON DELETE no action ON UPDATE no action;