<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ToastContainer from '$lib/components/ui/ToastContainer.svelte';

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
		get isDark() {
			return isDark;
		},
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

{@render children()}
<ToastContainer />
