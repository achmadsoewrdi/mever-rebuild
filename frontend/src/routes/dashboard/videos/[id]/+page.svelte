<script lang="ts">
	import { page } from '$app/stores';
	import { videoApi } from '$lib/api/videos.api';
	import type { Video } from '$lib/types/video.types';
	import { ArrowLeft, Copy, BarChart2 } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Tag from '$lib/components/ui/Tag.svelte';
	import { formatBytes, formatDate } from '$lib/utils/format';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';

	import VideoPlayer from '$lib/components/video/VideoPlayer.svelte';

	let video = $state<Video | null>(null);
	let isLoading = $state(true);

	const videoId = $derived($page.params.id);

	// Helper untuk mendapatkan MIME type video.js
	function getMimeType(protocol?: string) {
		if (protocol === 'dash') return 'application/dash+xml';
		if (protocol === 'hls') return 'application/x-mpegURL';
		return 'video/mp4';
	}

	// Pilihan Protokol
	let selectedProtocol = $state<string>('');

	// Ambil aset berdasarkan protokol yang dipilih
	const mainAsset = $derived(
		video?.assets?.find((a) => a.protocol === selectedProtocol) || video?.assets?.[0]
	);
	const videoSrc = $derived(mainAsset?.manifestUrl || '');
	const videoType = $derived(getMimeType(mainAsset?.protocol));

	// Set default protocol saat data video masuk
	$effect(() => {
		if (video?.assets?.length && !selectedProtocol) {
			selectedProtocol = video.assets[0].protocol;
		}
	});

	async function fetchVideoDetail() {
		if (!videoId) return;
		isLoading = true;
		try {
			const [videoRes, assetsRes] = await Promise.all([
				videoApi.getVideoById(videoId),
				videoApi.getVideoAssets(videoId)
			]);

			video = videoRes.data;
			if (video) {
				video.assets = assetsRes.data;
			}
		} catch (error) {
			console.error('Gagal mengambil detail video:', error);
		} finally {
			isLoading = false;
		}
	}

	$effect(() => {
		if (videoId) {
			fetchVideoDetail();
		}
	});
</script>

{#if isLoading}
	<div class="flex flex-col gap-6 p-8">
		<Skeleton class="h-10 w-1/3 rounded-lg" />
		<Skeleton class="aspect-[2.1/1] w-full rounded-2xl" />
		<div class="grid grid-cols-4 gap-4">
			<Skeleton class="h-24 rounded-xl" />
			<Skeleton class="h-24 rounded-xl" />
			<Skeleton class="h-24 rounded-xl" />
			<Skeleton class="h-24 rounded-xl" />
		</div>
	</div>
{:else if video}
	<div class="animate-in fade-in slide-in-from-right-4 flex flex-col gap-6 p-8 duration-500">
		<!-- HEADER AREA -->
		<div class="mx-auto flex w-full max-w-5xl items-start justify-between">
			<div class="flex flex-col gap-1">
				<div class="flex items-center gap-3">
					<a
						href="/dashboard/videos"
						class="group flex h-10 w-10 items-center justify-center rounded-xl border border-border-base bg-white text-text-muted transition-all hover:bg-rose-50 hover:text-rose-500 dark:bg-bg-surface"
					>
						<ArrowLeft size={20} class="transition-transform group-hover:-translate-x-0.5" />
					</a>
					<h1 class="text-3xl font-bold tracking-tight text-text-main">{video.title}</h1>
				</div>
				<p class="ml-13 text-sm font-medium text-text-muted">
					Added {formatDate(video.createdAt)} • {formatBytes(video.fileSizeBytes || 0)}
				</p>
			</div>
		</div>

		<!-- INTEGRATED PLAYER CARD (BUNGKUS) -->
		<div
			class="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-border-base bg-bg-secondary shadow-xl ring-1 ring-black/5"
		>
			<!-- VIDEO AREA -->
			<div class="bg-black">
				{#if videoSrc}
					<VideoPlayer src={videoSrc} {videoType} poster={video.thumbnailUrl} />
				{:else}
					<div class="flex aspect-[2.1/1] w-full items-center justify-center bg-slate-950">
						<p class="text-sm text-slate-500">Tidak ada stream tersedia untuk protokol ini.</p>
					</div>
				{/if}
			</div>

			<!-- ACTIONS BAR (CONNECTED TO BUNGKUS) -->
			<div
				class="flex flex-wrap items-center justify-between gap-4 border-t border-border-base bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20"
			>
				<div class="flex items-center gap-3">
					<div
						class="flex h-11 items-center gap-2 rounded-xl bg-white px-4 ring-1 ring-slate-200 dark:bg-bg-surface dark:ring-border-base"
					>
						<span class="text-[10px] font-bold tracking-wider text-text-muted uppercase"
							>Protocol</span
						>
						<select
							bind:value={selectedProtocol}
							class="cursor-pointer bg-transparent text-sm font-bold text-text-main outline-none"
						>
							{#if !video.assets?.length}
								<option value="">None</option>
							{:else}
								{#each video.assets as asset (asset.id)}
									<option value={asset.protocol}>{asset.protocol.toUpperCase()}</option>
								{/each}
							{/if}
						</select>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<Button
						variant="ghost"
						class="flex h-11 gap-2 rounded-xl border border-border-base bg-white px-5 text-xs font-bold dark:bg-bg-surface"
						onclick={() => {
							alert(`Manifest URL: ${videoSrc}\nType: ${videoType}`);
						}}
					>
						<BarChart2 size={14} class="text-rose-500" />
						Debug
					</Button>
					<Button
						variant="ghost"
						class="flex h-11 gap-2 rounded-xl border border-border-base bg-white px-5 text-xs font-bold dark:bg-bg-surface"
						onclick={() => {
							navigator.clipboard.writeText(videoSrc);
							alert('URL copied to clipboard!');
						}}
					>
						<Copy size={14} class="text-rose-500" />
						Copy Link
					</Button>
				</div>
			</div>
		</div>

		<!-- INFO GRID -->
		<div class="mx-auto grid w-full max-w-5xl grid-cols-2 gap-4 md:grid-cols-4">
			<div
				class="flex flex-col gap-2 rounded-2xl border border-border-base bg-bg-secondary p-5 shadow-sm"
			>
				<span class="text-[10px] font-bold tracking-widest text-text-muted uppercase"
					>Resolution</span
				>
				<span class="text-lg font-bold text-text-main"
					>1080p <span class="ml-1 text-sm font-medium text-text-muted">(FHD)</span></span
				>
			</div>
			<div
				class="flex flex-col gap-2 rounded-2xl border border-border-base bg-bg-secondary p-5 shadow-sm"
			>
				<span class="text-[10px] font-bold tracking-widest text-text-muted uppercase">Duration</span
				>
				<span class="text-lg font-bold text-text-main">1h 42m</span>
			</div>
			<div
				class="flex flex-col gap-2 rounded-2xl border border-border-base bg-bg-secondary p-5 shadow-sm"
			>
				<span class="text-[10px] font-bold tracking-widest text-text-muted uppercase"
					>File Size</span
				>
				<span class="text-lg font-bold text-text-main">{formatBytes(video.fileSizeBytes || 0)}</span
				>
			</div>
			<div
				class="flex flex-col gap-2 rounded-2xl border border-border-base bg-bg-secondary p-5 shadow-sm"
			>
				<span class="text-[10px] font-bold tracking-widest text-text-muted uppercase">Status</span>
				<span class="flex items-center gap-2 text-lg font-bold text-text-main">
					<div class="h-2 w-2 rounded-full bg-green-500"></div>
					Ready
				</span>
			</div>
		</div>

		<!-- TAGS SECTION -->
		<div class="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
			<div
				class="flex flex-col gap-4 rounded-2xl border border-border-base bg-bg-secondary p-5 shadow-sm"
			>
				<h3 class="text-[10px] font-bold tracking-[2px] text-text-muted uppercase">Protocols</h3>
				<div class="flex flex-wrap gap-2">
					<Tag label="dash" variant="dash" />
					<Tag label="plain" variant="default" />
				</div>
			</div>
			<div
				class="flex flex-col gap-4 rounded-2xl border border-border-base bg-bg-secondary p-5 shadow-sm"
			>
				<h3 class="text-[10px] font-bold tracking-[2px] text-text-muted uppercase">Encoders</h3>
				<div class="flex flex-wrap gap-2">
					<Tag label="av1" variant="default" />
				</div>
			</div>
			<div
				class="flex flex-col gap-4 rounded-2xl border border-border-base bg-bg-secondary p-5 shadow-sm"
			>
				<h3 class="text-[10px] font-bold tracking-[2px] text-text-muted uppercase">Packagers</h3>
				<div class="flex flex-wrap gap-2">
					<Tag label="mp4" variant="mp4" />
				</div>
			</div>
		</div>
	</div>
{/if}
