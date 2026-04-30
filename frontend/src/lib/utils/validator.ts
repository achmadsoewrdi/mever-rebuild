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
	title: z.string().min(3, 'Judul minimal 3 karakter').max(100, 'Judul maksimal 100 karakter'),
	description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
	targetCodec: z.enum(['h264', 'h265', 'hevc', 'vp9', 'av1', 'vp8']).optional(),
	targetProtocol: z.enum(['hls', 'dash', 'plain']).optional()
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UploadSchema = z.infer<typeof uploadSchema>;
