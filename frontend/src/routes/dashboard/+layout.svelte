<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<div class="flex h-screen w-full flex-col bg-slate-50 dark:bg-bg-primary">
	<div class="sticky top-0 z-50 w-full">
		<Navbar userName={data.user?.name} userInitials={data.user?.initials} />
	</div>
	<div class="flex flex-1 overflow-hidden">
		<main class="flex-1 overflow-y-auto p-6">
			{#if children}
				{@render children()}
			{/if}
		</main>
	</div>
</div>
