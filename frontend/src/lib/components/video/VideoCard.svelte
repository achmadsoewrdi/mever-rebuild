<script lang="ts">
	import type { Video } from '$lib/types/video.types';
	import { Play } from 'lucide-svelte';
	import Tag from '../ui/Tag.svelte';
	import { formatBytes, formatDate } from '$lib/utils/format';
	import { VideoAssetManager } from '$lib/stores/video-assets.svelte';

	interface Props {
		video: Video;
		viewMode?: 'grid' | 'list';
	}
	let { video, viewMode = 'grid' }: Props = $props();
	let imageError = $state(false);
	let assetManager = new VideoAssetManager(() => video);
</script>

{#if viewMode === 'grid'}
	<!-- GRID VIEW -->
	<a
		href="/dashboard/videos/{video.id}"
		class="group flex w-full flex-col overflow-hidden rounded-md bg-bg-secondary shadow-sm ring-1 ring-border-base transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-primary/50"
	>
		<!-- Bagian Thumbnail Atas -->
		<div class="relative aspect-video w-full overflow-hidden bg-bg-surface">
			{#if video.thumbnailUrl && !imageError}
				<img
					src={video.thumbnailUrl}
					alt={video.title}
					class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
					onerror={() => (imageError = true)}
				/>
			{:else}
				<div class="flex h-full w-full items-center justify-center bg-bg-surface text-text-muted">
					<span class="text-sm font-medium">No Image</span>
				</div>
			{/if}

			<!-- Overlay Play Button di Tengah -->
			<div class="absolute inset-0 flex items-center justify-center">
				<div
					class="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
				>
					<Play size={24} fill="currentColor" class="ml-1" />
				</div>
			</div>

			<!-- Badge Resolusi Tertinggi Dinamis -->
			{#if assetManager.highestResolution}
				<div
					class="absolute right-3 bottom-3 rounded-sm bg-black/80 px-2 py-0.5 text-xs font-bold tracking-wider text-white shadow-sm dark:bg-black/90"
				>
					{assetManager.highestResolution}
				</div>
			{/if}
		</div>

		<!-- Bagian Informasi Bawah -->
		<div class="flex flex-1 flex-col justify-between p-5">
			<div>
				<h3 class="line-clamp-1 text-xl font-bold tracking-wide text-text-main">
					{video.title}
				</h3>

				<!-- Tags Kustom -->
				<div class="mt-3 flex flex-wrap gap-2">
					{#each assetManager.uniqueCodecs as codec, id (id)}
						<Tag label={codec} variant={VideoAssetManager.getTagVariant(codec)} />
					{/each}

					{#each assetManager.uniqueFormats as format, id (id)}
						<Tag label={format} variant={VideoAssetManager.getTagVariant(format)} />
					{/each}

					{#if assetManager.uniqueCodecs.length === 0 && assetManager.uniqueFormats.length === 0}
						<span class="text-xs text-text-muted italic">Processing assets...</span>
					{/if}
				</div>
			</div>

			<!-- Footer Info -->
			<div
				class="mt-5 flex items-center justify-between border-t border-border-base pt-4 font-mono text-[13px]"
			>
				<span class="font-semibold tracking-wider text-primary uppercase">
					{formatBytes(video.fileSizeBytes || 0)}
				</span>
				<span class="font-medium text-text-sub">
					{formatDate(video.createdAt)}
				</span>
			</div>
		</div>
	</a>
{:else}
	<!-- LIST VIEW (Minimalist Row) -->
	<a
		href="/dashboard/videos/{video.id}"
		class="group flex w-full items-center justify-between border-b border-border-base bg-transparent p-4 transition-colors hover:bg-bg-surface/50"
	>
		<!-- Kiri: Thumbnail, Judul, Tags -->
		<div class="flex items-center gap-5">
			<!-- Thumbnail Kotak Kecil -->
			<div
				class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bg-surface shadow-sm ring-1 ring-border-base"
			>
				{#if video.thumbnailUrl && !imageError}
					<img
						src={video.thumbnailUrl}
						alt={video.title}
						class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
						onerror={() => (imageError = true)}
					/>
				{:else}
					<div class="flex h-full w-full items-center justify-center text-text-muted">
						<span class="text-[10px] font-medium">No Img</span>
					</div>
				{/if}
			</div>

			<!-- Info -->
			<div class="flex flex-col gap-2">
				<h3
					class="text-base font-semibold text-text-main transition-colors group-hover:text-primary"
				>
					{video.title}
				</h3>
				<div class="flex flex-wrap gap-1.5">
					{#each assetManager.uniqueCodecs as codec, id (id)}
						<Tag label={codec} variant={VideoAssetManager.getTagVariant(codec)} />
					{/each}
					{#each assetManager.uniqueFormats as format, id (id)}
						<Tag label={format} variant={VideoAssetManager.getTagVariant(format)} />
					{/each}
					{#if assetManager.uniqueCodecs.length === 0 && assetManager.uniqueFormats.length === 0}
						<span class="text-[10px] text-text-muted italic">Processing...</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Kanan: Size & Resolusi -->
		<div class="flex flex-col items-end gap-1.5 font-mono">
			<span class="text-sm font-semibold text-text-sub">
				{formatBytes(video.fileSizeBytes || 0)}
			</span>
			{#if assetManager.highestResolution}
				<span class="text-[11px] font-medium text-text-muted">
					{assetManager.highestResolution}
				</span>
			{/if}
		</div>
	</a>
{/if}
