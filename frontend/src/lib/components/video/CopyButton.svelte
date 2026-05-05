<script lang="ts">
	import { Copy, Check } from 'lucide-svelte';
	import { toast } from '$lib/stores/toast.store';
	import { cn } from '$lib/utils/cn';

	interface Props {
		textToCopy: string;
		label?: string;
		class?: string;
	}

	let { textToCopy, label = 'Copy Link', class: className }: Props = $props();

	let isCopied = $state(false);
	// BUG FIX #2: simpan referensi timer agar bisa di-clear jika klik cepat (race condition)
	let resetTimer: ReturnType<typeof setTimeout> | null = null;

	async function handleCopy() {
		// BUG FIX #1 (guard tambahan): blokir jika sedang dalam state copied
		if (!textToCopy || isCopied) return;

		try {
			// BUG FIX #3: fallback untuk clipboard API yang tidak tersedia di HTTP (non-HTTPS)
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(textToCopy);
			} else {
				// Fallback: pakai execCommand (deprecated tapi masih didukung luas)
				const textarea = document.createElement('textarea');
				textarea.value = textToCopy;
				textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
				document.body.appendChild(textarea);
				textarea.focus();
				textarea.select();
				const success = document.execCommand('copy');
				document.body.removeChild(textarea);
				if (!success) throw new Error('execCommand copy failed');
			}

			// BUG FIX #2: clear timer sebelumnya sebelum set yang baru
			if (resetTimer) clearTimeout(resetTimer);

			isCopied = true;
			toast.success('Link berhasil disalin ke clipboard!');

			resetTimer = setTimeout(() => {
				isCopied = false;
				resetTimer = null;
			}, 2000);
		} catch {
			toast.error('Gagal menyalin link');
		}
	}
</script>

<!--
	BUG FIX #1: Tambah type="button" agar tidak submit form secara tidak sengaja.
	BUG FIX #2: Ganti pointer-events-none dengan disabled agar keyboard (Enter/Space)
	            juga diblokir — bukan hanya interaksi mouse.
-->
<button
	type="button"
	onclick={handleCopy}
	disabled={isCopied}
	class={cn(
		'group inline-flex h-10 items-center gap-2 rounded-xl border border-border-base bg-bg-secondary px-4 text-xs font-medium transition-colors duration-150',
		isCopied
			? 'cursor-default text-emerald-600 dark:text-emerald-400'
			: 'text-text-sub hover:bg-bg-surface hover:text-text-main',
		className
	)}
>
	{#if isCopied}
		<Check size={13} class="shrink-0" />
		<span>Copied!</span>
	{:else}
		<Copy size={13} class="shrink-0 text-text-muted group-hover:text-text-main" />
		<span>{label}</span>
	{/if}
</button>
