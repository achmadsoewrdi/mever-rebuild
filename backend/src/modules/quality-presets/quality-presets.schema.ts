import { z } from "zod";

// ============================================
// CREATE QUALITY PRESET SCHEMA
// ============================================
export const createQualityPresetSchema = z.object({
  name: z
    .string()
    .min(1, "Nama preset tidak boleh kosong")
    .max(50, "Nama preset maksimal 50 karakter"),

  codec: z
    .enum(["h264", "h265", "vp9", "av1", "vp8", "prores"], {
      message: "Codec tidak didukung",
    })
    .optional(),

  format: z
    .enum(["hls", "dash", "mp4", "webm", "mkv", "mov"], {
      message: "Format tidak didukung",
    })
    .optional(),

  resolution: z
    .string()
    .regex(/^\d+x\d+$/, "Format resolusi harus seperti '1920x1080'")
    .optional(),

  bitrateKbps: z.coerce
    .number()
    .int("Bitrate harus berupa angka bulat")
    .positive("Bitrate harus bernilai positif")
    .optional(),

  isActive: z.boolean().optional().default(true),
});

// Infer tipe data untuk input Create
export type CreateQualityPresetInput = z.infer<
  typeof createQualityPresetSchema
>;

// ============================================
// UPDATE QUALITY PRESET SCHEMA
// ============================================
export const updateQualityPresetSchema = createQualityPresetSchema.partial();

// Infer tipe data untuk input Update
export type UpdateQualityPresetInput = z.infer<
  typeof updateQualityPresetSchema
>;
