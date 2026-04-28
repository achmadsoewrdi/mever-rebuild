import { writable, derived } from 'svelte/store';
import type { AuthResponse } from '$lib/types/auth.types';

/**
 * store utama untuk menyimpan data user yang sedang login
 * bernilai null jika belum login
 */
export const currentUser = writable<AuthResponse | null>(null);

/**
 * store turunan (deriveded) untuk mengecek status autentikasi.
 * Otomatis bernilai true jika currentUser ada isinya
 */

export const isAuthenticated = derived(currentUser, ($user) => !!$user);

/**
 * action untuk menyimpan data kedalam store
 */

export function setUser(user: AuthResponse) {
	currentUser.set(user);
}

/**
 * Action untuk menghapus data user (Logout)
 */

export function clearUser() {
	currentUser.set(null);
}
