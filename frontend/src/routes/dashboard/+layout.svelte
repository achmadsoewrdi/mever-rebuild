<script lang="ts">
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte'; // 1. Import Sidebar
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { onMount, untrack } from 'svelte';
	import { getMe } from '$lib/api/users.api';
	import { profileState } from '$lib/stores/profile.svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	// State untuk manajemen Sidebar Collapse
	let isSidebarCollapsed = $state(false);

	function toggleSidebar() {
		isSidebarCollapsed = !isSidebarCollapsed;
	}

	// Inisialisasi awal dari token
	profileState.name = untrack(() => data.user?.name) || '';

	onMount(async () => {
		try {
			const res = await getMe();
			if (res.data?.name) {
				profileState.name = res.data.name;
			}
		} catch (error) {
			console.error("Gagal mengambil profil terbaru", error);
		}
	});
</script>

<div class="flex h-screen w-full flex-col bg-slate-50 dark:bg-bg-primary">
	<div class="sticky top-0 z-50 w-full">
		<Navbar userName={profileState.name} />
	</div>
	<div class="flex flex-1 overflow-hidden">
		<Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

		<main class="flex-1 overflow-y-auto">
			{#if children}
				<div class="h-full w-full transition-all duration-500">
					{@render children()}
				</div>
			{/if}
		</main>
	</div>
</div>
