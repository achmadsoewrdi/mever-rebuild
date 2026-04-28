import { z } from 'zod';

/**
 * skema validasi untuk login
 */

export const loginSchema = z.object({
	email: z.email({ error: 'Format Email salah' }).min(1, 'Email wajib diisi'),
	password: z.string().min(8, 'Password minimal harus 8 karaker')
});

/**
 * skema validasi untuk register
 */

export const registerSchema = z.object({
	name: z.string().min(2, 'Nama minimal 2 Karakter').max(50, 'Nama Terlalu panjang'),
	email: z.email({ error: 'Format Email salah' }).min(1, 'Email wajib diisi'),
	password: z
		.string()
		.min(8, 'Password minimal harus 8 karakter')
		.max(25, 'Password maksimal 25 Karakter')
});

/**
 * skema upload video
 */

export const uploadSchema = z.object({
	title: z.string().min(5, 'Judul minimal 5 karakter').max(100, 'Judul maksimal 100 karakter'),
	description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
