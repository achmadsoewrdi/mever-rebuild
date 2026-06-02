<script lang="ts">
	import type { Snippet } from 'svelte';
	import AdminSidebar from '$lib/components/layout/AdminSidebar.svelte';
	import AdminNavbar from '$lib/components/layout/AdminNavbar.svelte';

	import { onMount, untrack } from 'svelte';
	import { getMe } from '$lib/api/users.api';
	import { profileState } from '$lib/stores/profile.svelte';
	import type { LayoutData } from './$types';

	interface Props {
		children: Snippet;
		data: LayoutData;
	}

	let { children, data }: Props = $props();

	// Inisialisasi awal dari token/server-side data
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

<div class="flex h-screen w-full bg-slate-50 text-text-main dark:bg-bg-primary">
	<AdminSidebar />

	<!-- 2. Pembungkus Konten (Kanan) -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<AdminNavbar />

		<main class="flex-1 overflow-y-auto p-6">
			{@render children()}
		</main>
	</div>
</div>
