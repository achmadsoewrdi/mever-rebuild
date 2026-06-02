<script lang="ts">
	import { CircleAlert, X } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	interface Props {
		message: string;
		onClose?: () => void;
	}

	let { message, onClose }: Props = $props();
</script>

<div
	transition:slide={{ duration: 250, axis: 'y' }}
	class="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-500 shadow-sm dark:bg-red-500/5 dark:border-red-500/10 dark:text-red-400"
>
	<CircleAlert size={18} class="shrink-0" />
	<p class="flex-1 font-medium leading-tight">{message}</p>
	{#if onClose}
		<button
			type="button"
			onclick={onClose}
			class="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
			aria-label="Tutup"
		>
			<X size={14} />
		</button>
	{/if}
</div>
