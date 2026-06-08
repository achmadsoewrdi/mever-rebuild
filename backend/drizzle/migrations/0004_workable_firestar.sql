ALTER TYPE "public"."format_type" ADD VALUE 'mov';--> statement-breakpoint
ALTER TYPE "public"."format_type" ADD VALUE 'mkv';--> statement-breakpoint
CREATE TABLE "account_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"department" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "account_requests_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department" varchar(255);