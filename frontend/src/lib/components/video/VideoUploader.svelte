<script lang="ts">
	import { VideoUploader } from '$lib/stores/video-uploader.svelte';
	import { Button, Input } from '$lib/components/ui/index'; // Menggunakan UI Primitives kamu
	import { Upload, Video, CircleCheck, PlayCircle } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import type { VideoProtocol } from '$lib/types/video.types';
	import { cn } from '$lib/utils/cn'; // Menggunakan utility cn kamu

	const uploader = new VideoUploader();
	let file = $state<File | null>(null);
	let title = $state('');
	let protocol = $state<VideoProtocol>('hls');
	let resolution = $state('FHD');
	let packager = $state('MP4');

	const protocols: VideoProtocol[] = ['hls', 'dash', 'plain'];
	const resolutions = [
		{ id: '4k', label: '2160p' },
		{ id: 'QHD', label: '1440p' },
		{ id: 'FHD', label: '1080p' },
		{ id: 'HD', label: '720p' },
		{ id: 'SD', label: '480p' },
		{ id: 'LD', label: '360p' }
	];
	const packagers = ['MP4', 'WebM', 'MKV'];

	async function startUpload() {
		if (!file || !title) return;
		await uploader.upload(file, {
			title,
			targetCodec: protocol === 'dash' ? 'vp9' : 'h264',
			targetProtocol: protocol
		});
	}
</script>

<div class="mx-auto max-w-5xl space-y-8">
	{#if uploader.status === 'idle'}
		<!-- Drag & Drop Area (Mengikuti Design System) -->
		<div
			class="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border-base bg-bg-secondary/30 p-12 transition-all hover:border-primary/50"
			in:fade
		>
			<div class="mb-4 rounded-full bg-bg-elevated p-4 transition-transform group-hover:scale-110">
				<Upload class="h-8 w-8 text-text-main" />
			</div>
			<h2 class="mb-2 text-xl font-semibold text-text-main">Drag & Drop your video here</h2>
			<p class="mb-6 text-center text-sm text-text-sub">
				Supports MP4, MKV, WebM, TS, MOV up to 10GB
			</p>

			<label class="cursor-pointer">
				<div
					class="rounded-xl border border-border-base bg-bg-surface px-8 py-2.5 font-bold text-text-main shadow-sm transition-all hover:bg-bg-elevated"
				>
					Browse files
				</div>
				<input
					type="file"
					class="hidden"
					accept="video/*"
					onchange={(e) => (file = e.currentTarget.files?.[0] || null)}
				/>
			</label>

			{#if file}
				<div
					class="mt-4 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
					in:fade
				>
					<PlayCircle class="h-4 w-4" />
					{file.name}
				</div>
			{/if}
		</div>

		<!-- Configuration Grid -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Video Title (Menggunakan Component Input Kamu) -->
			<div class="rounded-2xl border border-border-base bg-bg-secondary p-6 shadow-sm">
				<Input
					label="VIDEO TITLE"
					bind:value={title}
					placeholder="e.g Thor - FHD test"
					class="mt-2"
				/>
			</div>

			<!-- Protocols (Segmented Buttons) -->
			<div class="rounded-2xl border border-border-base bg-bg-secondary p-6 shadow-sm">
				<span class="mb-4 block text-[10px] font-black tracking-widest text-text-muted uppercase"
					>Protocols</span
				>
				<div class="flex flex-wrap gap-2">
					{#each protocols as p (p)}
						<button
							onclick={() => (protocol = p)}
							class={cn(
								'rounded-full border px-6 py-2 text-xs font-bold uppercase transition-all',
								protocol === p
									? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
									: 'border-border-base bg-bg-surface/50 text-text-sub hover:border-text-muted'
							)}
						>
							{p}
						</button>
					{/each}
				</div>
			</div>

			<!-- Resolution -->
			<div class="rounded-2xl border border-border-base bg-bg-secondary p-6 shadow-sm">
				<span class="mb-4 block text-[10px] font-black tracking-widest text-text-muted uppercase"
					>Resolution</span
				>
				<div class="grid grid-cols-3 gap-2">
					{#each resolutions as res (res.id)}
						<button
							onclick={() => (resolution = res.id)}
							class={cn(
								'flex flex-col items-center rounded-xl border py-2.5 transition-all',
								resolution === res.id
									? 'border-primary bg-primary/10 text-primary'
									: 'border-border-base bg-bg-surface/30 text-text-muted hover:border-text-sub'
							)}
						>
							<span class="text-[10px] font-black uppercase">{res.id}</span>
							<span class="text-[9px] font-medium opacity-70">{res.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Packagers -->
			<div class="rounded-2xl border border-border-base bg-bg-secondary p-6 shadow-sm">
				<span class="mb-4 block text-[10px] font-black tracking-widest text-text-muted uppercase"
					>Packagers</span
				>
				<div class="flex flex-wrap gap-2">
					{#each packagers as pkg (pkg)}
						<button
							onclick={() => (packager = pkg)}
							class={cn(
								'rounded-full border px-6 py-2 text-xs font-bold uppercase transition-all',
								packager === pkg
									? 'border-primary bg-primary text-white shadow-md shadow-primary/10'
									: 'border-border-base bg-bg-surface/50 text-text-sub hover:border-text-muted'
							)}
						>
							{pkg}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Action Buttons (Menggunakan Component Button Kamu) -->
		<div class="flex justify-end gap-4 pt-6">
			<Button
				variant="secondary"
				size="lg"
				onclick={() => {
					file = null;
					title = '';
				}}
			>
				Cancel
			</Button>
			<Button
				variant="primary"
				size="lg"
				onclick={startUpload}
				disabled={!file || !title}
				class="px-10"
			>
				<PlayCircle class="mr-2 h-5 w-5" />
				Start Upload & Process
			</Button>
		</div>
	{:else}
		<!-- Progress & Success State -->
		<div
			class="space-y-8 rounded-3xl border border-border-base bg-bg-secondary p-16 text-center shadow-xl"
			in:fade
		>
			{#if uploader.status !== 'success'}
				<div class="relative mx-auto h-24 w-24">
					<Video class="h-full w-full animate-pulse text-primary" />
					<div
						class="absolute inset-0 animate-spin rounded-full border-4 border-primary/10 border-t-primary"
					></div>
				</div>
				<div>
					<h3 class="text-2xl font-black tracking-tight text-text-main uppercase">
						{uploader.status === 'uploading' ? 'Uploading Video...' : 'Preparing Job...'}
					</h3>
					<p class="mt-2 text-text-sub">Don't close this tab until the process is finished.</p>
				</div>
				<div class="mx-auto max-w-md">
					<div
						class="h-3 w-full overflow-hidden rounded-full border border-border-base bg-bg-surface"
					>
						<div
							class="h-full bg-primary transition-all duration-500 ease-out"
							style="width: {uploader.progress}%"
						></div>
					</div>
					<div class="mt-4 flex items-center justify-between font-mono text-sm">
						<span class="text-text-muted">Progress</span>
						<span class="text-lg font-black text-primary">{uploader.progress}%</span>
					</div>
				</div>
			{:else if uploader.status === 'success'}
				<div class="animate-bounce-in">
					<CircleCheck class="mx-auto h-24 w-24 text-green-500" />
				</div>
				<h3 class="mt-6 text-3xl font-black text-text-main uppercase">Mission Accomplished!</h3>
				<p class="mt-2 text-lg text-text-sub">
					Your video is now being processed by our transcoding engine.
				</p>
				<div class="mt-10 flex justify-center gap-4">
					<Button href="/dashboard/videos" variant="outline" size="lg">Go to Dashboard</Button>
					<Button onclick={() => uploader.reset()} variant="primary" size="lg"
						>Upload Another</Button
					>
				</div>
			{/if}
		</div>
	{/if}
</div>
