<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte'; // 1. Import Sidebar
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<div class="flex h-screen w-full flex-col bg-slate-50 dark:bg-bg-primary">
	<div class="sticky top-0 z-50 w-full">
		<Navbar userName={data.user?.name} userInitials={data.user?.initials} />
	</div>
	<div class="flex flex-1 overflow-hidden">
		<Sidebar />

		<main class="flex-1 overflow-y-auto">
			{#if children}
				{@render children()}
			{/if}
		</main>
	</div>
</div>
