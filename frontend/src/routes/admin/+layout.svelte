<script lang="ts">
	import type { Snippet } from 'svelte';
	import AdminSidebar from '$lib/components/layout/AdminSidebar.svelte';
	import AdminNavbar from '$lib/components/layout/AdminNavbar.svelte';

	// Di Svelte 5, layout menerima children sebagai Snippet
	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="flex h-screen w-full bg-bg-primary text-text-main">
	<!-- 1. Sidebar (Kiri) -->
	<AdminSidebar />

	<!-- 2. Pembungkus Konten (Kanan) -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Navbar / Header Atas -->
		<AdminNavbar />

		<!-- Area Halaman (Scrollable) -->
		<main class="flex-1 overflow-y-auto p-6">
			{@render children()}
		</main>
	</div>
</div>
