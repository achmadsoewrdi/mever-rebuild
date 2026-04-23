CREATE TYPE "public"."codec_type" AS ENUM('h264', 'h265', 'hevc', 'vp9', 'av1', 'vp8');--> statement-breakpoint
CREATE TYPE "public"."format_type" AS ENUM('mp4', 'webm');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('queued', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."mfa_method" AS ENUM('totp');--> statement-breakpoint
CREATE TYPE "public"."streaming_protocol" AS ENUM('hls', 'dash', 'plain');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."video_status" AS ENUM('uploading', 'queued', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"mfa_method" "mfa_method",
	"mfa_secret_enc" varchar(512),
	"mfa_backup_codes" varchar(2048),
	"mfa_verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uploaded_by" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"slug" varchar(255) NOT NULL,
	"original_name" varchar(255),
	"source_path" varchar(500),
	"status" "video_status" DEFAULT 'uploading' NOT NULL,
	"thumbnail_url" varchar(500),
	"duration_seconds" integer,
	"file_size_bytes" bigint,
	"total_jobs" integer DEFAULT 0,
	"done_jobs" integer DEFAULT 0,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "videos_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "video_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"job_id" uuid,
	"codec" "codec_type" NOT NULL,
	"format" "format_type" NOT NULL,
	"protocol" "streaming_protocol" NOT NULL,
	"resolution" varchar(20) NOT NULL,
	"bitrate_kbps" integer,
	"storage_path" varchar(500),
	"cdn_url" varchar(500),
	"manifest_url" varchar(500),
	"file_size_bytes" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transcode_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"asset_id" uuid,
	"redis_job_id" varchar(255),
	"worker_id" varchar(100),
	"output_filename" varchar(255),
	"codec" varchar(20),
	"resolution" varchar(20),
	"packager" varchar(20),
	"status" "job_status" DEFAULT 'queued' NOT NULL,
	"progress_pct" integer DEFAULT 0,
	"error_message" text,
	"queued_at" timestamp DEFAULT now(),
	"started_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_assets" ADD CONSTRAINT "video_assets_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcode_jobs" ADD CONSTRAINT "transcode_jobs_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE no action ON UPDATE no action;