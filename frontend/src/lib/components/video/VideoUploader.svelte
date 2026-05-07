<script lang="ts">
	import { VideoUploader } from '$lib/stores/video-uploader.svelte';
	import { Button, Input } from '$lib/components/ui/index';
	import { Upload, CircleCheck, PlayCircle, Loader2 } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	const uploader = new VideoUploader();

	// Form States
	let file = $state<File | null>(null);
	let title = $state('');

	// Metadata States
	let isDetecting = $state(false);
	let sourceWidth = $state(0);
	let sourceHeight = $state(0);

	// Fungsi Pendeteksi Metadata Video
	async function handleFileChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const selectedFile = target.files?.[0];
		if (!selectedFile) return;

		isDetecting = true;
		file = selectedFile;

		// Auto-fill Title (Hapus ekstensi file)
		title = selectedFile.name.replace(/\.[^/.]+$/, '');

		// Gunakan elemen video internal untuk cek resolusi
		const video = document.createElement('video');
		video.preload = 'metadata';
		video.src = URL.createObjectURL(selectedFile);

		video.onloadedmetadata = () => {
			URL.revokeObjectURL(video.src);
			sourceWidth = video.videoWidth;
			sourceHeight = video.videoHeight;
			isDetecting = false;
		};
	}

	async function startUpload() {
		if (!file || !title) return;
		await uploader.upload(file, {
			title
		});
	}
</script>

<div class="mx-auto max-w-5xl space-y-8">
	{#if uploader.status === 'idle'}
		<!-- Drag & Drop Area -->
		<div
			class="group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border-base bg-bg-secondary/30 p-12 transition-all hover:border-primary/50"
			in:fade
		>
			<div class="mb-4 rounded-full bg-bg-elevated p-4 transition-transform group-hover:scale-110">
				{#if isDetecting}
					<Loader2 class="h-8 w-8 animate-spin text-primary" />
				{:else}
					<Upload class="h-8 w-8 text-text-main" />
				{/if}
			</div>

			<h2 class="mb-2 text-xl font-semibold text-text-main">
				{isDetecting ? 'Menganalisa Video...' : 'Drag & Drop your video here'}
			</h2>
			<p class="mb-6 text-center text-sm text-text-sub">Supports MP4, MKV, WebM, TS up to 10GB</p>

			<label class="cursor-pointer">
				<div
					class="rounded-xl border border-border-base bg-bg-surface px-8 py-2.5 font-bold text-text-main shadow-sm transition-all hover:bg-bg-elevated"
				>
					Browse files
				</div>
				<input type="file" class="hidden" accept="video/*" onchange={handleFileChange} />
			</label>

			{#if file && !isDetecting}
				<div
					class="mt-4 flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
					in:fade
				>
					<PlayCircle class="h-4 w-4" />
					{file.name} <span class="ml-1 opacity-60">({sourceWidth}x{sourceHeight})</span>
				</div>
			{/if}
		</div>

		<!-- Configuration Grid -->
		<div class="grid grid-cols-1 gap-6">
			<!-- Video Title -->
			<div class="rounded-2xl border border-border-base bg-bg-secondary p-6 shadow-sm">
				<Input
					label="VIDEO TITLE"
					bind:value={title}
					placeholder="e.g Marvel Cinematic Universe"
					class="mt-2"
				/>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex justify-end gap-4 pt-6">
			<Button
				variant="secondary"
				size="lg"
				onclick={() => {
					file = null;
					title = '';
					sourceHeight = 0;
				}}
			>
				Cancel
			</Button>
			<Button
				variant="primary"
				size="lg"
				onclick={startUpload}
				disabled={!file || !title || isDetecting}
				class="px-10"
			>
				<PlayCircle class="mr-2 h-5 w-5" /> Start Upload & Process
			</Button>
		</div>
	{:else}
		<!-- Minimalist Progress & Success State -->
		<div
			class="mx-auto max-w-2xl rounded-3xl border border-border-base bg-bg-secondary p-10 shadow-2xl shadow-primary/5"
			in:fade={{ duration: 300 }}
		>
			{#if uploader.status !== 'success'}
				<div class="flex flex-col items-center space-y-6 text-center">
					<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
						<div
							class="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
						></div>
					</div>
					<div class="space-y-1">
						<h3 class="text-xl font-bold text-text-main">
							{uploader.status === 'uploading' ? 'Mengunggah Video' : 'Menyiapkan Transcoder'}
						</h3>
						<p class="text-sm text-text-muted">
							Proses ini memakan waktu beberapa saat tergantung ukuran file.
						</p>
					</div>
					<div class="w-full space-y-3">
						<div class="relative h-2 w-full overflow-hidden rounded-full bg-bg-surface">
							<div
								class="h-full bg-primary shadow-[0_0_10px_rgba(255,23,68,0.5)] transition-all duration-500 ease-out"
								style="width: {uploader.progress}%"
							></div>
						</div>
						<div
							class="flex justify-between font-mono text-[11px] font-bold tracking-tighter uppercase"
						>
							<span class="text-text-muted">{uploader.status}...</span>
							<span class="text-primary">{uploader.progress}% Komplit</span>
						</div>
					</div>
				</div>
			{:else if uploader.status === 'success'}
				<div class="flex flex-col items-center space-y-6 text-center" in:fade>
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
						<CircleCheck class="h-8 w-8 text-emerald-500" />
					</div>
					<div class="space-y-1">
						<h3 class="text-2xl font-bold text-text-main">Upload Berhasil</h3>
						<p class="mx-auto max-w-xs text-sm text-text-muted">
							Video kamu telah masuk antrian dan sedang diproses oleh engine.
						</p>
					</div>
					<div class="flex w-full flex-col gap-3 pt-4 sm:flex-row">
						<Button href="/dashboard/videos" variant="secondary" class="flex-1"
							>Lihat Library</Button
						>
						<Button onclick={() => uploader.reset()} variant="primary" class="flex-1"
							>Upload Lagi</Button
						>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
