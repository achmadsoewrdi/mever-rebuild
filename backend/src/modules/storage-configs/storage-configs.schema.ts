import { z } from "zod";

// ============================================
// CREATE STORAGE CONFIG SCHEMA
// ============================================
export const createStorageConfigSchema = z.object({
  name: z
    .string()
    .min(1, "Nama konfigurasi tidak boleh kosong")
    .max(100, "Nama konfigurasi maksimal 100 karakter"),

  endpointUrl: z
    .string()
    .min(1, "Endpoint URL tidak boleh kosong")
    .max(255, "Endpoint URL maksimal 255 karakter"),

  bucketInput: z
    .string()
    .min(1, "Bucket Input tidak boleh kosong")
    .max(255, "Bucket Input maksimal 255 karakter"),

  bucketOutput: z
    .string()
    .min(1, "Bucket Output tidak boleh kosong")
    .max(255, "Bucket Output maksimal 255 karakter"),

  accessKey: z
    .string()
    .min(1, "Access Key tidak boleh kosong")
    .max(255, "Access Key maksimal 255 karakter"),

  secretKey: z
    .string()
    .min(1, "Secret Key tidak boleh kosong")
    .max(255, "Secret Key maksimal 255 karakter"),

  isActive: z.boolean().optional().default(true),
});

// Infer tipe data untuk input Create
export type CreateStorageConfigInput = z.infer<
  typeof createStorageConfigSchema
>;

// ============================================
// UPDATE STORAGE CONFIG SCHEMA
// ============================================
export const updateStorageConfigSchema = createStorageConfigSchema.partial();

// Infer tipe data untuk input Update
export type UpdateStorageConfigInput = z.infer<
  typeof updateStorageConfigSchema
>;
