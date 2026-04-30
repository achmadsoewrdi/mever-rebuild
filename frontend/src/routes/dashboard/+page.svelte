<script lang="ts">
	import VideoFilter from '$lib/components/video/VideoFilter.svelte';
	import VideoGrid from '$lib/components/video/VideoGrid.svelte';
	import { videoApi } from '$lib/api/videos.api';
	import type { Video } from '$lib/types/video.types';
	import { toast } from 'svelte-sonner';

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

<div class="flex flex-col gap-6 p-2 sm:p-6">
	<div>
		<h1 class="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
			Video Library
		</h1>
		<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
			Kelola dan pantau seluruh aset video milikmu di dalam platform.
		</p>
	</div>

	<VideoFilter bind:searchQuery bind:viewMode />

	<VideoGrid {videos} {isLoading} {viewMode} />
</div>
