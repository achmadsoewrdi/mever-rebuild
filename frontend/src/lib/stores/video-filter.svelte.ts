// src/lib/stores/video-filter.svelte.ts
export class VideoFilterStore {
	searchQuery = $state('');
	viewMode = $state<'grid' | 'list'>('grid');

	// State centang di Sidebar
	protocols = $state({ hls: false, dash: false, plain: false });
	encoders = $state({ h264: false, av1: false, h265: false, vp8: false, vp9: false });
	resolutions = $state({ r4k: false, qhd: false, fhd: false, hd: false, sd: false });

	// Helper untuk mengambil filter yang aktif saja (untuk dikirim ke API)
	get activeFilters() {
		return {
			protocols: Object.entries(this.protocols)
				.filter(([, v]) => v) // Hapus '_' dan ganti jadi kosong
				.map(([k]) => k),
			encoders: Object.entries(this.encoders)
				.filter(([, v]) => v)
				.map(([k]) => k),
			resolutions: Object.entries(this.resolutions)
				.filter(([, v]) => v)
				.map(([k]) => k)
		};
	}
}

export const filterStore = new VideoFilterStore();
