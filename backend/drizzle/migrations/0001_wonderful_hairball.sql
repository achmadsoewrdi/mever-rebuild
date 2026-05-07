ALTER TYPE "public"."format_type" ADD VALUE 'mpd';--> statement-breakpoint
ALTER TYPE "public"."format_type" ADD VALUE 'm3u8';--> statement-breakpoint
CREATE TABLE "quality_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid,
	"name" varchar(50) NOT NULL,
	"codec" varchar(50),
	"format" varchar(50),
	"resolution" varchar(20),
	"bitrate_kbps" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid,
	"name" varchar(100),
	"endpoint_url" varchar(255),
	"bucket_input" varchar(255),
	"bucket_output" varchar(255),
	"access_key" varchar(255),
	"secret_key_enc" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "target_codec" "codec_type";--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "target_protocol" "streaming_protocol";--> statement-breakpoint
ALTER TABLE "video_assets" ADD COLUMN "preset_id" uuid;--> statement-breakpoint
ALTER TABLE "transcode_jobs" ADD COLUMN "preset_id" uuid;--> statement-breakpoint
ALTER TABLE "quality_presets" ADD CONSTRAINT "quality_presets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storage_configs" ADD CONSTRAINT "storage_configs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_assets" ADD CONSTRAINT "video_assets_preset_id_quality_presets_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."quality_presets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcode_jobs" ADD CONSTRAINT "transcode_jobs_preset_id_quality_presets_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."quality_presets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcode_jobs" DROP COLUMN "codec";--> statement-breakpoint
ALTER TABLE "transcode_jobs" DROP COLUMN "resolution";--> statement-breakpoint
ALTER TABLE "transcode_jobs" DROP COLUMN "packager";