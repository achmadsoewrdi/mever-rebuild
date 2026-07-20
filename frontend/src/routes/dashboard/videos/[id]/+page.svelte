<script lang="ts">
	import { page } from '$app/stores';
	import { videoApi } from '$lib/api/videos.api';
	import type { Video, VideoAsset } from '$lib/types/video.types';
	import { ArrowLeft, BarChart2, ChevronDown, Check } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import CopyButton from '$lib/components/video/CopyButton.svelte';
	import Tag from '$lib/components/ui/Tag.svelte';
	import { formatBytes, formatDate } from '$lib/utils/format';
	import Skeleton from '$lib/components/ui/Skeleton.svelte';
	import { clickOutside } from '$lib/utils/clickOutside';

	import VideoPlayer from '$lib/components/video/VideoPlayer.svelte';
	import VideoDebugPanel from '$lib/components/video/VideoDebugPanel.svelte';
	import type { DebugStats } from '$lib/components/video/VideoDebugPanel.svelte';
	import type { VideoStreamInfo } from '$lib/types/video.types';

	let video = $state<Video | null>(null);
	let streamInfo = $state<VideoStreamInfo | null>(null);
	let isLoading = $state(true);
	let showVideoDebug = $state(false);
	let videoDebugStats = $state<DebugStats>({
		bandwidth: 0,
		decodedFrames: 0,
		droppedFrames: 0,
		corruptedFrames: 0,
		loadTime: 0,
		width: 0,
		height: 0
	});

	const videoId = $derived($page.params.id);

	// Helper untuk mendapatkan MIME type video.js
	function getMimeType(protocol?: string, format?: string) {
		// DASH: hanya kalau file-nya memang .mpd
		if (protocol === 'dash' && format === 'mpd') return 'application/dash+xml';
		// HLS: hanya kalau file-nya memang .m3u8
		// HLS preset dengan file .mp4 (nginx-vod) tetap diplay sebagai video/mp4
		if (protocol === 'hls' && format === 'm3u8') return 'application/x-mpegURL';
		if (format === 'mov') return 'video/quicktime';
		if (format === 'webm') return 'video/webm';
		if (format === 'mkv') return 'video/x-matroska';
		return 'video/mp4';
	}

	// Pilihan Asset (ID)
	let selectedAssetId = $state<string>('');
	let isDropdownOpen = $state(false);

	// Ambil aset berdasarkan ID yang dipilih
	const mainAsset = $derived(
		video?.assets?.find((a) => a.id === selectedAssetId) || video?.assets?.[0]
	);
	const videoSrc = $derived(mainAsset?.manifestUrl || '');
	const videoType = $derived(getMimeType(mainAsset?.protocol, mainAsset?.format));

	// Helper Label Dropdown
	function getAssetLabel(asset: VideoAsset | { id: string, protocol: string, resolution: string }) {
		if (asset.id === 'auto-dash') return 'Auto (Adaptive DASH)';
		if (asset.id === 'auto-hls') return 'Auto (Adaptive HLS)';
		
		// Ekstrak hanya resolusi (misal: "1080p", "4k") dari string yang mungkin panjang seperti "360p Matroska (MKV)"
		const match = asset.resolution.match(/\b\d+p\b|\b4k\b/i);
		let resLabel = match ? match[0].toLowerCase() : asset.resolution;
		
		// Jika resolusi dari format '1920x1080'
		if (!match && asset.resolution.includes('x')) {
			const height = asset.resolution.split('x')[1];
			if (height) resLabel = `${height}p`;
		}

		if (asset.protocol === 'plain') {
			return `Plain (${resLabel})`;
		}
		return `${asset.protocol.toUpperCase()} (${resLabel})`;
	}

	// Set default asset saat data video masuk
	$effect(() => {
		if (video?.assets?.length && !selectedAssetId) {
			if (streamInfo?.dashUrl) {
				selectedAssetId = 'auto-dash';
			} else if (streamInfo?.hlsUrl) {
				selectedAssetId = 'auto-hls';
			} else {
				selectedAssetId = video.assets[0].id;
			}
		}
	});

	async function fetchVideoDetail() {
		if (!videoId) return;
		isLoading = true;
		try {
			const [videoRes, assetsRes, streamRes] = await Promise.all([
				videoApi.getVideoById(videoId),
				videoApi.getVideoAssets(videoId),
				videoApi.getVideoStream(videoId).catch(() => ({ data: null }))
			]);

			video = videoRes.data;
			if (video) {
				video.assets = assetsRes.data;
			}
			streamInfo = streamRes?.data;
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

	// Derived Metadata
	const resolutionMap: Record<string, string> = {
		'3840x2160': '4K (UHD)',
		'2560x1440': '1440p (QHD)',
		'1920x1080': '1080p (FHD)',
		'1280x720': '720p (HD)',
		'854x480': '480p (SD)'
	};

	const resolutionDisplay = $derived(
		mainAsset?.resolution ? (() => {
			if (resolutionMap[mainAsset.resolution]) return resolutionMap[mainAsset.resolution];
			const match = mainAsset.resolution.match(/\b\d+p\b|\b4k\b/i);
			return match ? match[0].toLowerCase() : mainAsset.resolution;
		})() : 'N/A'
	);

	function formatDurationHuman(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = Math.floor(seconds % 60);

		if (h > 0) return `${h}h ${m}m`;
		if (m > 0) return `${m}m ${s}s`;
		return `${s}s`;
	}

	const durationDisplay = $derived(formatDurationHuman(video?.durationSeconds || 0));

	const statusMap = {
		ready: { label: 'Ready', color: 'bg-green-500' },
		processing: { label: 'Processing', color: 'bg-amber-500 animate-pulse' },
		queued: { label: 'Queued', color: 'bg-slate-400' },
		uploading: { label: 'Uploading', color: 'bg-blue-500 animate-pulse' },
		failed: { label: 'Failed', color: 'bg-rose-500' }
	};

	const statusConfig = $derived(
		video?.status ? statusMap[video.status] : { label: 'Unknown', color: 'bg-slate-500' }
	);

	// Derived Tags Data
	const uniqueProtocols = $derived([...new Set(video?.assets?.map((a) => a.protocol) || [])]);
	const uniqueCodecs = $derived([...new Set(video?.assets?.map((a) => a.codec) || [])]);
	const uniqueFormats = $derived([...new Set(video?.assets?.map((a) => a.format) || [])]);
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
		<div class="mx-auto mb-8 flex w-full max-w-7xl items-center justify-between px-4">
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
			class="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border border-border-base bg-bg-secondary shadow-xl ring-1 ring-black/5"
		>
			<!-- VIDEO AREA -->
			<div class="relative bg-black">
				{#if showVideoDebug}
					<div class="animate-in fade-in absolute top-3 left-3 z-20 duration-200">
						<VideoDebugPanel stats={videoDebugStats} onClose={() => (showVideoDebug = false)} />
					</div>
				{/if}
				{#if selectedAssetId === 'auto-dash' && streamInfo?.dashUrl}
					<VideoPlayer
						src={streamInfo.dashUrl}
						videoType="application/dash+xml"
						poster={streamInfo.thumbnailUrl || video?.thumbnailUrl}
						bind:showDebug={showVideoDebug}
						bind:debugStats={videoDebugStats}
					/>
				{:else if selectedAssetId === 'auto-hls' && streamInfo?.hlsUrl}
					<VideoPlayer
						src={streamInfo.hlsUrl}
						videoType="application/x-mpegURL"
						poster={streamInfo.thumbnailUrl || video?.thumbnailUrl}
						bind:showDebug={showVideoDebug}
						bind:debugStats={videoDebugStats}
					/>
				{:else if videoSrc}
					{#key selectedAssetId}
						<VideoPlayer
							src={videoSrc}
							{videoType}
							poster={video?.thumbnailUrl}
							bind:showDebug={showVideoDebug}
							bind:debugStats={videoDebugStats}
						/>
					{/key}
				{:else}
					<div class="flex aspect-[2.1/1] w-full items-center justify-center bg-slate-950">
						<p class="text-sm text-slate-500">Video belum diproses atau tidak tersedia.</p>
					</div>
				{/if}
			</div>

			<!-- ACTIONS BAR (CONNECTED TO BUNGKUS) -->
			<div
				class="flex flex-wrap items-center justify-between gap-4 border-t border-border-base bg-white/50 p-4 backdrop-blur-sm dark:bg-black/20"
			>
				<div class="flex items-center gap-3">
					<div class="relative">
						<button
							use:clickOutside={() => (isDropdownOpen = false)}
							onclick={() => (isDropdownOpen = !isDropdownOpen)}
							class="flex h-11 items-center gap-4 rounded-xl border border-border-base bg-white px-4
							       transition-all hover:bg-slate-50 hover:shadow-md active:scale-[0.98]
							       dark:bg-bg-surface dark:hover:bg-white/5"
						>
							<div class="flex flex-col items-start leading-tight">
								<span class="text-[9px] font-bold tracking-widest text-text-muted uppercase"
									>Protocol</span
								>
								<span class="font-atkinson text-sm font-extrabold text-text-main">
									{mainAsset ? getAssetLabel(mainAsset) : 'Select Protocol'}
								</span>
							</div>
							<ChevronDown
								size={16}
								class="text-text-muted transition-transform duration-300 {isDropdownOpen
									? 'rotate-180'
									: ''}"
							/>
						</button>

						{#if isDropdownOpen}
							<div
								class="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 absolute bottom-full left-0 z-50
								       mb-2 w-64 overflow-hidden rounded-2xl border border-border-base
								       bg-white/90 p-1 shadow-2xl backdrop-blur-xl duration-200
								       dark:bg-bg-elevated/90"
							>
								{#if !video?.assets?.length}
									<div class="p-4 text-center text-xs text-text-muted">No assets available</div>
								{:else}
									<div class="flex flex-col gap-0.5">
										{#if streamInfo?.dashUrl}
											<button
												class={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedAssetId === 'auto-dash' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' : ''}`}
												onclick={() => {
													selectedAssetId = 'auto-dash';
													isDropdownOpen = false;
												}}
											>
												<span class="font-medium">Auto (Adaptive DASH)</span>
												{#if selectedAssetId === 'auto-dash'}
													<Check size={16} />
												{/if}
											</button>
										{/if}
										{#if streamInfo?.hlsUrl}
											<button
												class={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedAssetId === 'auto-hls' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' : ''}`}
												onclick={() => {
													selectedAssetId = 'auto-hls';
													isDropdownOpen = false;
												}}
											>
												<span class="font-medium">Auto (Adaptive HLS)</span>
												{#if selectedAssetId === 'auto-hls'}
													<Check size={16} />
												{/if}
											</button>
										{/if}
										{#each video.assets || [] as asset (asset.id)}
											<button
												onclick={() => {
													selectedAssetId = asset.id;
													isDropdownOpen = false;
												}}
												class="flex items-center justify-between rounded-xl px-4 py-3 text-left
												       transition-colors hover:bg-primary/10 hover:text-primary
												       {selectedAssetId === asset.id ? 'bg-primary/5 text-primary' : 'text-text-main'}"
											>
												<span class="font-atkinson text-sm font-bold">
													{getAssetLabel(asset)}
												</span>
												{#if selectedAssetId === asset.id}
													<Check size={14} strokeWidth={3} />
												{/if}
											</button>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>

				<div class="flex items-center gap-2">
					<Button
						variant="ghost"
						class="flex h-11 gap-2 rounded-xl border border-border-base px-5 text-xs font-bold transition-colors
						       {showVideoDebug
							? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
							: 'bg-white dark:bg-bg-surface'}"
						onclick={() => (showVideoDebug = !showVideoDebug)}
					>
						<BarChart2 size={14} class="text-rose-500" />
						{showVideoDebug ? 'Hide Debug' : 'Debug'}
					</Button>
					<CopyButton textToCopy={videoSrc} />
				</div>
			</div>
		</div>

		<!-- UNIFIED INFO BAR -->
		<div
			class="mx-auto flex w-full max-w-7xl overflow-hidden rounded-2xl border border-border-base bg-bg-secondary shadow-sm"
		>
			<!-- Resolution -->
			<div
				class="flex flex-1 flex-col gap-1.5 border-r border-border-base p-5 transition-colors hover:bg-white/50 dark:hover:bg-white/5"
			>
				<span class="text-[10px] font-bold tracking-[2px] text-text-muted uppercase"
					>Resolution</span
				>
				<span class="font-atkinson text-lg font-bold text-text-main">{resolutionDisplay}</span>
			</div>

			<!-- Duration -->
			<div
				class="flex flex-1 flex-col gap-1.5 border-r border-border-base p-5 transition-colors hover:bg-white/50 dark:hover:bg-white/5"
			>
				<span class="text-[10px] font-bold tracking-[2px] text-text-muted uppercase">Duration</span>
				<span class="font-atkinson text-lg font-bold text-text-main">{durationDisplay}</span>
			</div>

			<!-- File Size -->
			<div
				class="flex flex-1 flex-col gap-1.5 border-r border-border-base p-5 transition-colors hover:bg-white/50 dark:hover:bg-white/5"
			>
				<span class="text-[10px] font-bold tracking-[2px] text-text-muted uppercase">File Size</span
				>
				<span class="font-atkinson text-lg font-bold text-text-main"
					>{formatBytes(video.fileSizeBytes || 0)}</span
				>
			</div>

			<!-- Status -->
			<div
				class="flex flex-1 flex-col gap-1.5 p-5 transition-colors hover:bg-white/50 dark:hover:bg-white/5"
			>
				<span class="text-[10px] font-bold tracking-[2px] text-text-muted uppercase">Status</span>
				<span class="flex items-center gap-2 text-lg font-bold text-text-main">
					<div class="h-2 w-2 rounded-full {statusConfig.color}"></div>
					<span class="font-atkinson font-bold">{statusConfig.label}</span>
				</span>
			</div>
		</div>

		<!-- TAGS SECTION -->
		<div class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 md:grid-cols-3">
			<div
				class="flex flex-col gap-4 rounded-2xl border border-border-base bg-bg-secondary p-5 shadow-sm"
			>
				<h3 class="text-[10px] font-bold tracking-[2px] text-text-muted uppercase">Protocols</h3>
				<div class="flex flex-wrap gap-2">
					{#each uniqueProtocols as protocol (protocol)}
						<Tag label={protocol} />
					{:else}
						<span class="text-xs text-text-muted">No protocols</span>
					{/each}
				</div>
			</div>
			<div
				class="flex flex-col gap-4 rounded-2xl border border-border-base bg-bg-secondary p-5 shadow-sm"
			>
				<h3 class="text-[10px] font-bold tracking-[2px] text-text-muted uppercase">Encoders</h3>
				<div class="flex flex-wrap gap-2">
					{#each uniqueCodecs as codec (codec)}
						<Tag label={codec} />
					{:else}
						<span class="text-xs text-text-muted">No encoders</span>
					{/each}
				</div>
			</div>
			<div
				class="flex flex-col gap-4 rounded-2xl border border-border-base bg-bg-secondary p-5 shadow-sm"
			>
				<h3 class="text-[10px] font-bold tracking-[2px] text-text-muted uppercase">Packagers</h3>
				<div class="flex flex-wrap gap-2">
					{#each uniqueFormats as format (format)}
						<Tag label={format} />
					{:else}
						<span class="text-xs text-text-muted">No packagers</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.font-atkinson {
		font-family: 'Atkinson Hyperlegible Mono', monospace;
	}
</style>
