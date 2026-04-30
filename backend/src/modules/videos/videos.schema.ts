import { z } from "zod";
// ================================
// VIDEO FILTER SCHEMA
// ================================

export const videoFilterSchema = z.object({
  status: z
    .enum(["uploading", "queued", "processing", "ready", "failed"])
    .optional(),
  page: z.coerce
    .number()
    .int("Page harus berupa angka bulat")
    .min(1, "Page minimal 1")
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .int("Limit Harus angka bulat")
    .min(1, "Limit minimal 1")
    .max(100, "limit maksimal 100")
    .optional()
    .default(10),
  search: z.string().optional(),
});

export type VideoFilterInput = z.infer<typeof videoFilterSchema>;

// ================================
// REQUEST UPLOAD SCHEMA
// ================================

export const requestUploadSchema = z.object({
  title: z.string().min(1, "Judul tidak boleh kosong"),
  description: z.string().optional(),
  originalName: z.string().min(1, "Nama file asli dibutuhkan misal: Video.mp4"),
  fileSizeBytes: z.number().positive("ukuran file harus angka positif").nullish(),
  targetCodec: z.enum(["h264", "h265", "vp9", "av1", "vp8"]).optional(),
  targetProtocol: z.enum(["hls", "dash", "plain"]).optional(),
});

export type RequestUploadInput = z.infer<typeof requestUploadSchema>;
