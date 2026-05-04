<script lang="ts">
	import VideoFilter from '$lib/components/video/VideoFilter.svelte';
	import VideoGrid from '$lib/components/video/VideoGrid.svelte';
	import { videoApi } from '$lib/api/videos.api';
	import type { Video } from '$lib/types/video.types';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils/cn';
	import { filterStore } from '$lib/stores/video-filter.svelte';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Data States
	let videos = $state<Video[]>([]);
	let isLoading = $state(true);
	let currentPage = $state(1);
	let limit = 12;

	// Deteksi apakah kita sedang di halaman detail (punya ID di URL)
	const isDetailOpen = $derived(!!$page.params.id);

	// Fungsi Load Data (Mengambil semua parameter dari Store)
	async function loadVideos() {
		const active = filterStore.activeFilters;
		isLoading = true;
		try {
			const res = await videoApi.getVideos({
				search: filterStore.searchQuery,
				page: currentPage,
				limit: limit,
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

	$effect(() => {
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
		}, 300);
		return () => clearTimeout(timeoutId);
	});
</script>

<div class="flex h-full w-full overflow-hidden">
	<!-- BAGIAN KIRI: DAFTAR VIDEO -->
	<div
		class={cn(
			'flex flex-col border-r border-border-base transition-all duration-500 ease-in-out',
			// Jika detail buka & mode list -> Kecilkan list (380px)
			isDetailOpen && filterStore.viewMode === 'list' ? 'w-[420px]' : 'w-full',
			// Jika detail buka & mode grid -> Sembunyikan list sepenuhnya
			isDetailOpen && filterStore.viewMode === 'grid' ? 'hidden' : 'flex'
		)}
	>
		<!-- Sticky Header Section -->
		<div
			class={cn(
				'sticky top-0 z-10 border-b border-border-base bg-bg-secondary/80 px-6 py-3 backdrop-blur-md transition-all duration-300',
				isDetailOpen ? 'flex flex-col gap-3' : 'flex items-center justify-between'
			)}
		>
			<!-- Top Section: Title & Info -->
			<div class="flex items-center justify-between">
				<div class="flex flex-col">
					<h1
						class={cn(
							'font-bold tracking-tight text-text-main transition-all duration-300',
							isDetailOpen ? 'text-sm' : 'text-2xl'
						)}
					>
						Video Library
					</h1>
					<div class="mt-0.5 flex items-center gap-2 text-[10px] font-medium text-text-muted">
						<span>{videos.length} videos</span>
						{#if isDetailOpen}
							<span class="opacity-30">•</span>
							<span class="text-rose-500">3 Live</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Divider & Filter Section -->
			{#if isDetailOpen}
				<hr class="border-border-base/50" />
				<div class="w-full">
					<VideoFilter
						bind:searchQuery={filterStore.searchQuery}
						bind:viewMode={filterStore.viewMode}
						compact={true}
					/>
				</div>
			{:else}
				<div class="flex items-center gap-4">
					<VideoFilter
						bind:searchQuery={filterStore.searchQuery}
						bind:viewMode={filterStore.viewMode}
						compact={false}
					/>
				</div>
			{/if}
		</div>

		<!-- Kontainer List -->
		<div
			class={cn(
				'flex-1 overflow-y-auto bg-bg-secondary',
				filterStore.viewMode === 'grid' ? 'p-6' : 'p-0'
			)}
		>
			<VideoGrid {videos} {isLoading} viewMode={filterStore.viewMode} isCompact={isDetailOpen} />
		</div>
	</div>

	<!-- BAGIAN KANAN: DETAIL VIDEO (CHILDREN) -->
	{#if isDetailOpen}
		<div class="flex-1 overflow-y-auto bg-bg-primary transition-all duration-500">
			{@render children()}
		</div>
	{/if}
</div>
