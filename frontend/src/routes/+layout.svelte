<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ToastContainer from '$lib/components/ui/ToastContainer.svelte';
	import { Moon, Sun } from 'lucide-svelte';

	import { setContext } from 'svelte';
	import { browser } from '$app/environment';

	let { children } = $props();

	// State Tema Utama (Stabil karena ada di Root Layout)
	let isDark = $state(
		browser
			? localStorage.getItem('theme') === 'dark' ||
					(!localStorage.getItem('theme') &&
						window.matchMedia('(prefers-color-scheme: dark)').matches)
			: false
	);

	// Bagikan state ini ke seluruh aplikasi via Context
	setContext('theme', {
		get isDark() { return isDark; },
		toggle: () => {
			isDark = !isDark;
		}
	});

	// Sinkronisasi ke DOM dan Storage
	$effect(() => {
		if (browser) {
			document.documentElement.classList.toggle('dark', isDark);
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
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
