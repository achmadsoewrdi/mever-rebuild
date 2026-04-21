import { z } from "zod";

// ====================
// REGISTER SCHEMA
// ====================

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Nama tidak Boleh Kosong")
    .max(100, "Nama maksimal 100 karakter"),

  email: z.email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password masksimal 100 karakter"),
});

// ====================
// LOGIN SCHEMA
// ====================

export const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(1, "password tidak boleh kosong"),
});

export type ResgiterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
