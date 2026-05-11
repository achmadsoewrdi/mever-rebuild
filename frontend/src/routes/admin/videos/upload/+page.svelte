<script lang="ts">
	import VideoUploader from '$lib/components/video/VideoUploader.svelte';
	import { fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Upload Video | Admin MEVER</title>
</svelte:head>

<main class="p-6 lg:p-10" in:fade>
	<div class="mb-10">
		<h1 class="mb-2 text-3xl font-bold text-text-main">Upload Video Baru (Admin)</h1>
		<p class="text-text-sub">
			Unggah video baru untuk diproses oleh sistem transcode.
		</p>
	</div>
	<div class="w-full">
		<VideoUploader libraryUrl="/admin/videos" />
	</div>
</main>
