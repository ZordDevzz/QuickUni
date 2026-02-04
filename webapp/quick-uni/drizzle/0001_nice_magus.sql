CREATE TYPE "public"."enum_account_status" AS ENUM('active', 'suspended', 'banned', 'expired');--> statement-breakpoint
CREATE TABLE "account_audit" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"create_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."enum_account_status";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "status" SET DATA TYPE "public"."enum_account_status" USING "status"::"public"."enum_account_status";--> statement-breakpoint
ALTER TABLE "account_audit" ADD CONSTRAINT "fk_account_audit_account_id_account_id" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_audit_idx_account_id" ON "account_audit" USING btree ("account_id");