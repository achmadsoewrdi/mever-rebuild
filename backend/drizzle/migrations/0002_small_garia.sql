ALTER TYPE "public"."video_status" ADD VALUE 'deleted';--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "storage_config_id" uuid;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_storage_config_id_storage_configs_id_fk" FOREIGN KEY ("storage_config_id") REFERENCES "public"."storage_configs"("id") ON DELETE no action ON UPDATE no action;