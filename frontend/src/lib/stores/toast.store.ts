import { writable } from 'svelte/store';

/**
 * Tipe data notifikasi
 */
export interface Toast {
	id: string;
	message: string;
	type: 'success' | 'error' | 'info' | 'warning';
	duration?: number;
}

/**
 * Store utama yang menyimpan daftar toast yang sedang aktif
 */
export const toasts = writable<Toast[]>([]);

/**
 * Action untuk menambahkan notifikasi baru
 */
export function addToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
	const id = crypto.randomUUID(); // Membuat ID unik

	// Tambahkan toast ke dalam array
	toasts.update((all) => [{ id, message, type, duration }, ...all]);

	// Hapus otomatis setelah durasi tertentu
	if (duration > 0) {
		setTimeout(() => {
			removeToast(id);
		}, duration);
	}
}

/**
 * Action untuk menghapus notifikasi berdasarkan ID
 */
export function removeToast(id: string) {
	toasts.update((all) => all.filter((t) => t.id !== id));
}

/**
 * Shortcut pembantu agar pemanggilan lebih singkat
 */
export const toast = {
	success: (m: string, d?: number) => addToast(m, 'success', d),
	error: (m: string, d?: number) => addToast(m, 'error', d),
	info: (m: string, d?: number) => addToast(m, 'info', d),
	warning: (m: string, d?: number) => addToast(m, 'warning', d)
};
