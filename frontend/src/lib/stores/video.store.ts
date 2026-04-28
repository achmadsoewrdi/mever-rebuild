import { writable } from 'svelte/store';
import type { VideoFilters } from '$lib/types/video.types';

/**
 * Nilai awal (default) untuk filter
 */

const initialFilters: VideoFilters = {
	search: '',
	status: undefined,
	page: 1,
	limit: 12
};

/**
 * store untuk menyimpan state filter Video saat ini
 */

export const videoFilters = writable<VideoFilters>({
	...initialFilters
});

/**
 * action untuk mengupdate filter secara parsial (hanya sebagian)
 * contoh: updateFilter({search:'tutorial})
 */

export function updateFilter(partial: Partial<VideoFilters>) {
	videoFilters.update((state) => ({
		...state,
		...partial,
		page: partial.page ?? (partial.search !== undefined ? 1 : state.page)
	}));
}

/**
 * action untuk mereset semua filter ke kondisi awal
 */

export function resetFilters() {
	videoFilters.set({ ...initialFilters });
}
