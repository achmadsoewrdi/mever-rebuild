<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';

	// 1. Import komponen VideoFilter
	import VideoFilter from '$lib/components/video/VideoFilter.svelte';

	// 2. Buat state untuk menampung nilai dari filter (menggunakan Svelte 5 Runes)
	let searchQuery = $state('');
	let viewMode = $state<'grid' | 'list'>('list');

	// Contoh data dummy untuk simulasi pencarian
	let allVideos = $state([
		{ id: 1, title: 'Spiderman: No Way Home', type: '4K Live' },
		{ id: 2, title: 'Thor: Love and Thunder', type: 'dash' }
	]);

	let filteredVideos = $derived(
		allVideos.filter((v) => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
	);
</script>

<div class="flex flex-col gap-2">
	<!-- Header Dashboard -->
	<div class="mb-2 flex items-center justify-between">
		<div>
			<h1 class="font-outfit text-2xl font-bold text-slate-900 dark:text-white">Video Library</h1>
			<p class="text-sm text-slate-500">{filteredVideos.length} videos • 3 Live</p>
		</div>
		<Button variant="primary" class="gap-2">
			<Plus size={18} />
			Upload Video
		</Button>
	</div>

	<VideoFilter bind:searchQuery bind:viewMode />

	<!-- Area Daftar Video -->
	<div class="mt-4">
		{#if viewMode === 'list'}
			<!-- Render tampilan baris (List) -->
			<div class="flex flex-col gap-4">
				<!-- Ubah bagian ini -->
				{#each filteredVideos as video (video.id)}
					<div
						class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-bg-surface"
					>
						{video.title}
					</div>
				{/each}
			</div>
		{:else}
			<!-- Render tampilan kotak (Grid) -->
			<div class="grid grid-cols-3 gap-4">
				{#each filteredVideos as video (video.id)}
					<div
						class="flex aspect-video items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-bg-surface"
					>
						{video.title}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
