import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);
export const videoStatusEnum = pgEnum("video_status", [
  "uploading",
  "queued",
  "processing",
  "ready",
  "failed",
]);
export const jobStatusEnum = pgEnum("job_status", [
  "queued",
  "processing",
  "completed",
  "failed",
]);
export const codecTypeEnum = pgEnum("codec_type", [
  "h264",
  "h265",
  "hevc",
  "vp9",
  "av1",
  "vp8",
]);
export const formatTypeEnum = pgEnum("format_type", ["mp4", "webm", "mpd", "m3u8"]);
export const protocolTypeEnum = pgEnum("streaming_protocol", [
  "hls",
  "dash",
  "plain",
]);
export const mfaMethodEnum = pgEnum("mfa_method", ["totp"]);
