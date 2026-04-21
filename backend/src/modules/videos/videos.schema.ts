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
