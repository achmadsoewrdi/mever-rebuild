<script lang="ts">
	import VideoFilter from '$lib/components/video/VideoFilter.svelte';
	import VideoGrid from '$lib/components/video/VideoGrid.svelte';
	import { videoApi } from '$lib/api/videos.api';
	import type { Video } from '$lib/types/video.types';
	import { toast } from 'svelte-sonner';
	import { cn } from '$lib/utils/cn';

	let videos = $state<Video[]>([]);
	let isLoading = $state(true);

	let searchQuery = $state('');
	let viewMode = $state<'grid' | 'list'>('grid');

	let currentPage = $state(1);
	let limit = 12;

	async function loadVideos(query: string, page: number) {
		isLoading = true;
		try {
			const res = await videoApi.getVideos({
				search: query,
				page: page,
				limit: limit
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
		const timeoutId = setTimeout(() => {
			loadVideos(searchQuery, currentPage);
		}, 500);
		return () => clearTimeout(timeoutId);
	});
</script>

<!-- ... bagian script tetap sama ... -->

<div class="flex flex-col transition-all duration-500">
	<!-- 1. Sticky Header Section with Blur Effect -->
	<div
		class="sticky top-0 z-10 border-b border-border-base bg-bg-secondary/80 px-6 py-1 backdrop-blur-md"
	>
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-text-main">Video Library</h1>
				<div class="mt-1 flex gap-4 text-[11px] font-medium text-text-muted">
					<span>13 videos</span>
					<span>•</span>
					<span class="font-bold text-rose-500">3 Live Now</span>
				</div>
			</div>
			<!-- Filter & Search terintegrasi di kanan -->
			<div class="flex items-center gap-4">
				<VideoFilter bind:searchQuery bind:viewMode />
			</div>
		</div>
	</div>

	<!-- 2. Kontainer Konten (Dinamis) -->
	<div
		class={cn(
			'transition-all duration-300',
			viewMode === 'list'
				? 'w-full bg-bg-secondary' // Full width tanpa margin & tanpa rounded
				: 'grid gap-6 bg-transparent p-6' // Mode Grid tetap pake padding
		)}
	>
		<!-- Jika ada kategori "LIVE NOW" atau "ON DEMAND" bisa ditambah di VideoGrid -->
		<VideoGrid {videos} {isLoading} {viewMode} />
	</div>
</div>
