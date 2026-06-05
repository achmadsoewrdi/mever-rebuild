<script lang="ts">
	import { page } from '$app/stores';
	import { getVideo } from '$lib/api/admin-videos.api';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { ArrowLeft, Video, Clock, Shield } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { videoApi } from '$lib/api/videos.api';
	import VideoPlayer from '$lib/components/video/VideoPlayer.svelte';
	import type { VideoAsset, VideoStreamInfo } from '$lib/types/video.types';
	import type { ApiResponse } from '$lib/types/api.types';

	interface VideoData {
		id: string;
		title: string;
		slug: string;
		description?: string;
		status: string;
		originalName?: string;
		fileSizeBytes?: number;
		durationSeconds?: number;
		totalJobs?: number;
		doneJobs?: number;
		targetCodec?: string;
		targetProtocol?: string;
		thumbnailUrl?: string;
		assets?: VideoAsset[];
	}

	let videoId = $derived($page.params.id);
	let video = $state<VideoData | null>(null);
	let streamInfo = $state<VideoStreamInfo | null>(null);
	let loading = $state(true);

	async function loadVideoDetail() {
		loading = true;
		try {
			const [res, assetsRes, streamRes] = await Promise.all([
				getVideo(videoId!) as unknown as Promise<ApiResponse<VideoData>>,
				videoApi.getVideoAssets(videoId!),
				videoApi.getVideoStream(videoId!).catch(() => ({ data: null }))
			]);
			if (res && res.data) {
				video = res.data;
				video!.assets = assetsRes.data || [];
			}
			streamInfo = streamRes?.data;
		} catch (err: unknown) {
			console.error(err);
			toast.error('Gagal mengambil detail video');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadVideoDetail();
	});

	function getStatusColor(status: string): 'green' | 'yellow' | 'red' | 'default' {
		switch (status) {
			case 'ready':
				return 'green';
			case 'processing':
				return 'yellow';
			case 'queued':
				return 'default';
			case 'failed':
				return 'red';
			case 'deleted':
				return 'red';
			default:
				return 'default';
		}
	}

	let selectedAssetId = $state<string>('');

	const mainAsset = $derived(
		video?.assets?.find((a) => a.id === selectedAssetId) || video?.assets?.[0]
	);

	$effect(() => {
		if (video?.assets?.length && !selectedAssetId) {
			if (streamInfo?.hlsUrl) {
				selectedAssetId = 'auto-hls';
			} else {
				selectedAssetId = video.assets[0].id;
			}
		}
	});

	function getAssetLabel(asset: VideoAsset) {
		const height = asset.resolution.split('x')[1] || asset.resolution;
		const resLabel = height.includes('p') ? height : `${height}p`;
		return asset.protocol === 'plain'
			? `Plain (${resLabel})`
			: `${asset.protocol.toUpperCase()} (${resLabel})`;
	}

	function getMimeType(protocol?: string, format?: string) {
		if (protocol === 'dash' && format === 'mpd') return 'application/dash+xml';
		if (protocol === 'hls' && format === 'm3u8') return 'application/x-mpegURL';
		if (format === 'mov') return 'video/quicktime';
		if (format === 'webm') return 'video/webm';
		if (format === 'mkv') return 'video/x-matroska';
		return 'video/mp4';
	}

	const videoSrc = $derived(mainAsset?.manifestUrl || '');
	const videoType = $derived(getMimeType(mainAsset?.protocol, mainAsset?.format));
</script>

<div class="space-y-6 px-6 py-6">
	<div class="flex items-center gap-3">
		<button
			onclick={() => goto('/admin/videos')}
			class="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-bg-secondary"
			title="Kembali"
		>
			<ArrowLeft size={20} />
		</button>
		<div>
			<h1 class="text-2xl font-bold text-text-main">Video Detail</h1>
			<p class="text-sm text-text-sub">Pantau aset dan informasi lengkap video.</p>
		</div>
	</div>

	{#if loading}
		<div class="flex flex-col items-center justify-center space-y-4 py-12">
			<div class="animate-spin text-primary">⏳</div>
			<span class="text-sm text-text-sub">Sedang memuat detail video...</span>
		</div>
	{:else if video}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="space-y-6 lg:col-span-2">
				<div
					class="space-y-4 rounded-lg border border-border-base bg-white p-6 shadow-sm dark:bg-bg-secondary"
				>
					<div class="flex items-start justify-between">
						<div>
							<h2 class="text-xl font-bold text-text-main">{video.title}</h2>
							<p class="mt-1 text-sm text-text-sub">{video.slug}</p>
						</div>
						<Badge color={getStatusColor(video.status)} label={video.status} />
					</div>

					<div class="border-t border-border-base pt-4">
						<h3 class="text-sm font-semibold text-text-main">Deskripsi</h3>
						<p class="mt-1 text-sm text-text-sub">
							{video.description || 'Tidak ada deskripsi untuk video ini.'}
						</p>
					</div>
				</div>

				<div class="overflow-hidden rounded-lg border border-border-base bg-black shadow-sm">
					{#if selectedAssetId === 'auto-hls' && streamInfo?.hlsUrl}
						<VideoPlayer src={streamInfo.hlsUrl} videoType="application/x-mpegURL" poster={video.thumbnailUrl} />
					{:else if videoSrc}
						{#key selectedAssetId}
							<VideoPlayer src={videoSrc} {videoType} poster={video.thumbnailUrl} />
						{/key}
					{:else}
						<div
							class="flex aspect-video flex-col items-center justify-center text-white"
						>
							<Video size={48} class="mb-4 text-slate-600" />
							<span class="text-sm text-slate-400">Stream tidak tersedia</span>
							<span class="mt-1 text-xs text-slate-600">Video belum diproses atau file rusak.</span>
						</div>
					{/if}
				</div>
			</div>

			<div class="space-y-6 lg:col-span-1">
				<div
					class="space-y-4 rounded-lg border border-border-base bg-white p-6 shadow-sm dark:bg-bg-secondary"
				>
					<h3 class="flex items-center gap-2 font-bold text-text-main">
						<Shield size={16} class="text-text-sub" />
						Metadata
					</h3>

					<div class="space-y-3 text-sm">
						<div class="flex justify-between">
							<span class="text-text-sub">ID Video</span>
							<span class="font-mono text-xs text-text-main">{video.id}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-text-sub">Original Name</span>
							<span class="max-w-[150px] truncate text-text-main" title={video.originalName}
								>{video.originalName || '-'}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-text-sub">File Size</span>
							<span class="text-text-main">
								{video.fileSizeBytes
									? (video.fileSizeBytes / (1024 * 1024)).toFixed(2) + ' MB'
									: '-'}
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-text-sub">Duration</span>
							<span class="text-text-main">
								{video.durationSeconds ? `${video.durationSeconds} detik` : '-'}
							</span>
						</div>
					</div>
				</div>

				<div
					class="space-y-4 rounded-lg border border-border-base bg-white p-6 shadow-sm dark:bg-bg-secondary"
				>
					<h3 class="flex items-center gap-2 font-bold text-text-main">
						<Clock size={16} class="text-text-sub" />
						Transcode Status
					</h3>

					<div class="space-y-3 text-sm">
						<div class="flex justify-between">
							<span class="text-text-sub">Total Jobs</span>
							<span class="text-text-main">{video.totalJobs || 0}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-text-sub">Done Jobs</span>
							<span class="text-green-500">{video.doneJobs || 0}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-text-sub">Target Codec</span>
							<span class="font-mono text-xs text-text-main">{video.targetCodec || '-'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-text-sub">Protocol</span>
							<span class="font-mono text-xs text-text-main uppercase"
								>{video.targetProtocol || '-'}</span
							>
						</div>
					</div>
				</div>

				<!-- Asset / Resolution Selector Card -->
				<div class="space-y-4 rounded-lg border border-border-base bg-white p-6 shadow-sm dark:bg-bg-secondary">
					<h3 class="flex items-center gap-2 font-bold text-text-main">
						<Video size={16} class="text-text-sub" />
						Available Assets
					</h3>

					{#if !video.assets || video.assets.length === 0}
						<p class="text-sm text-text-sub">Belum ada aset resolusi yang tersedia.</p>
					{:else}
						<div class="flex flex-col gap-2">
							{#if streamInfo?.hlsUrl}
								<button
									onclick={() => selectedAssetId = 'auto-hls'}
									class="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-colors {selectedAssetId === 'auto-hls' 
										? 'border-primary bg-primary/5 text-primary' 
										: 'border-border-base hover:bg-slate-50 dark:hover:bg-bg-surface text-text-main'}"
								>
									<span>Auto (Adaptive HLS)</span>
								</button>
							{/if}
							{#each video.assets as asset (asset.id)}
								<button
									onclick={() => selectedAssetId = asset.id}
									class="flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-colors {selectedAssetId === asset.id 
										? 'border-primary bg-primary/5 text-primary' 
										: 'border-border-base hover:bg-slate-50 dark:hover:bg-bg-surface text-text-main'}"
								>
									<span>{getAssetLabel(asset)}</span>
									<span class="text-xs {selectedAssetId === asset.id ? 'text-primary' : 'text-text-sub'}">
										{asset.codec}
									</span>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center space-y-4 py-12">
			<span class="text-sm text-text-sub">Video tidak ditemukan atau telah dihapus.</span>
			<Button variant="secondary" onclick={() => goto('/admin/videos')}>Kembali ke List</Button>
		</div>
	{/if}
</div>
