<script lang="ts">
	import VideoFilter from '$lib/components/video/VideoFilter.svelte';
	import VideoGrid from '$lib/components/video/VideoGrid.svelte';
	import { videoApi } from '$lib/api/videos.api';
	import type { Video } from '$lib/types/video.types';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils/cn';
	import { filterStore } from '$lib/stores/video-filter.svelte';

	// Data States
	let videos = $state<Video[]>([]);
	let isLoading = $state(true);
	let currentPage = $state(1);
	let limit = 12;

	// Fungsi Load Data (Mengambil semua parameter dari Store)
	async function loadVideos() {
		const active = filterStore.activeFilters;
		console.log('[DEBUG] Memanggil loadVideos dengan filter:', active);

		isLoading = true;
		try {
			const res = await videoApi.getVideos({
				search: filterStore.searchQuery,
				page: currentPage,
				limit: limit,
				// Mengirim array filter aktif dari Sidebar
				protocols: active.protocols,
				encoders: active.encoders,
				resolutions: active.resolutions
			});

			videos = res.data || [];
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Gagal memuat video';
			toast.error(errorMessage);
		} finally {
			isLoading = false;
		}
	}

	// Reaktivitas Otomatis: Panggil API setiap kali isi Store berubah
	$effect(() => {
		// Deep tracking menggunakan JSON.stringify agar perubahan di dalam objek terdeteksi
		const _track = JSON.stringify([
			filterStore.protocols,
			filterStore.encoders,
			filterStore.resolutions,
			filterStore.searchQuery,
			currentPage
		]);
		void _track;

		const timeoutId = setTimeout(() => {
			loadVideos();
		}, 300); // Debounce 300ms agar tidak terlalu sering hit API saat mengetik
		return () => clearTimeout(timeoutId);
	});
</script>

<div class="flex flex-col transition-all duration-500">
	<!-- 1. Sticky Header Section with Blur Effect (Glassmorphism) -->
	<div
		class="sticky top-0 z-10 border-b border-border-base bg-bg-secondary/80 px-6 py-2 backdrop-blur-md"
	>
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-text-main">Video Library</h1>
				<div class="mt-1 flex gap-4 text-[11px] font-medium text-text-muted">
					<span>{videos.length} videos</span>
					<span>•</span>
					<span class="font-bold text-rose-500">Live Engine Active</span>
				</div>
			</div>

			<!-- Filter & Search (Binding Langsung ke Store) -->
			<div class="flex items-center gap-4">
				<VideoFilter
					bind:searchQuery={filterStore.searchQuery}
					bind:viewMode={filterStore.viewMode}
				/>
			</div>
		</div>
	</div>

	<!-- 2. Kontainer Konten (Dinamis berdasarkan ViewMode di Store) -->
	<div
		class={cn(
			'transition-all duration-300 ease-in-out',
			filterStore.viewMode === 'list'
				? 'w-full bg-bg-secondary' // Full width di mode list
				: 'grid gap-6 bg-transparent p-6' // Padding & Grid di mode grid
		)}
	>
		<!-- Komponen Grid/List Video -->
		<VideoGrid {videos} {isLoading} viewMode={filterStore.viewMode} />
	</div>
</div>
