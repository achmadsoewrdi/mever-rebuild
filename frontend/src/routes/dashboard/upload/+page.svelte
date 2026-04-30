<script lang="ts">
	import VideoUploader from '$lib/components/video/VideoUploader.svelte';
	import { fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Upload Video | MEVER</title>
</svelte:head>

<main class="p-6 lg:p-10" in:fade>
	<div class="mb-10">
		<!-- Pakai text-text-main dan text-text-sub -->
		<h1 class="mb-2 text-3xl font-bold text-text-main">Upload Video Baru</h1>
		<p class="text-text-sub">
			Siapkan video terbaikmu dan biarkan MEVER yang mengurus proses transkodingnya.
		</p>
	</div>
	<div class="w-full">
		<VideoUploader />
	</div>
</main>
