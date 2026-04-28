<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
	import { Moon, Sun } from 'lucide-svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	// State untuk dark mode
	let isDark = $state(false);

	// Terapkan .dark class ke <html> setiap kali state berubah
	$effect(() => {
		if (browser) {
			document.documentElement.classList.toggle('dark', isDark);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- Toggle Dark Mode — Fixed di pojok kanan atas -->
<button
	onclick={() => (isDark = !isDark)}
	aria-label="Toggle dark mode"
	class="fixed top-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-md border
	       border-border-base bg-bg-secondary text-text-sub shadow-sm transition-all
	       hover:bg-bg-surface hover:text-text-main focus:outline-none focus:ring-2 focus:ring-primary/20"
>
	{#if isDark}
		<Sun size={16} />
	{:else}
		<Moon size={16} />
	{/if}
</button>

{@render children()}
<ToastContainer />
