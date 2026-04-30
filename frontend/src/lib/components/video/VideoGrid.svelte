<script lang="ts">
	import type { Video } from '$lib/types/video.types';
	import VideoCard from './VideoCard.svelte';
	import Skeleton from '../ui/Skeleton.svelte';
	import { Inbox } from 'lucide-svelte';

	interface Props {
		videos?: Video[];
		isLoading?: boolean;
		viewMode?: 'grid' | 'list';
	}

	let { videos = [], isLoading = false, viewMode = 'grid' }: Props = $props();

	// Array dummy untuk me-render skeleton sejumlah tertentu saat loading
	const skeletons = [1, 2, 3, 4, 5, 6, 7, 8];
</script>

{#if isLoading}
	<!-- STATE 1: LOADING -->
	<div
		class="grid gap-6
			{viewMode === 'grid'
			? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
			: 'grid-cols-1 gap-y-4'}"
	>
		{#each skeletons as id (id)}
			<div class="flex {viewMode === 'grid' ? 'flex-col' : 'flex-row gap-4'} w-full">
				<!-- Skeleton Thumbnail -->
				<Skeleton
					class="{viewMode === 'grid' ? 'aspect-video w-full' : 'h-28 w-48 shrink-0'} rounded-xl"
				/>

				<!-- Skeleton Info (Judul & Keterangan) -->
				<div class="mt-3 flex w-full flex-col gap-2 {viewMode === 'list' ? 'mt-0 py-1' : ''}">
					<Skeleton class="h-5 w-3/4 rounded-md" />
					<Skeleton class="h-4 w-1/2 rounded-md" />
				</div>
			</div>
		{/each}
	</div>
{:else if videos.length === 0}
	<!-- STATE 2: EMPTY (TIDAK ADA DATA) -->
	<div
		class="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center dark:border-border-base/50 dark:bg-bg-surface/50"
	>
		<div
			class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-bg-elevated dark:text-border-base/90"
		>
			<Inbox size={32} />
		</div>
		<h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200">Tidak ada video</h3>
		<p class="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
			Video yang kamu cari tidak ditemukan atau belum ada video yang diunggah.
		</p>
	</div>
{:else}
	<!-- STATE 3: BERISI DATA -->
	<div
		class="grid gap-6
			{viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}"
	>
		{#each videos as video (video.id)}
			<VideoCard {video} {viewMode} />
		{/each}
	</div>
{/if}
