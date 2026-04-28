<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from 'lucide-svelte';

	interface Props {
		open?: boolean;
		title?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		onclose?: () => void;
		children: Snippet;
		footer?: Snippet;
		class?: string;
	}

	let {
		open = $bindable(false),
		title,
		size = 'md',
		onclose,
		children,
		footer,
		class: className
	}: Props = $props();

	const sizes = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-2xl'
	};

	// Referensi ke elemen <dialog> native
	let dialogEl = $state<HTMLDialogElement | null>(null);

	function handleClose() {
		open = false;
		onclose?.();
	}

	// Saat open berubah, panggil showModal() atau close() secara programatik
	$effect(() => {
		if (!dialogEl) return;
		if (open) {
			dialogEl.showModal(); // Membuka native dialog (auto-fokus & trap focus)
		} else {
			dialogEl.close();
		}
	});

	// Handle klik backdrop (area luar panel)
	function handleBackdropClick(e: MouseEvent) {
		const rect = dialogEl?.getBoundingClientRect();
		if (!rect) return;
		const clickedOutside =
			e.clientX < rect.left ||
			e.clientX > rect.right ||
			e.clientY < rect.top ||
			e.clientY > rect.bottom;
		if (clickedOutside) handleClose();
	}

	// Handle event 'cancel' (tombol Escape bawaan browser)
	function handleCancel(e: Event) {
		e.preventDefault(); // Cegah browser menutup sendiri, biar kita yang kontrol
		handleClose();
	}
</script>

<!--
	Menggunakan elemen <dialog> native HTML:
	- Natively focusable (tidak perlu tabindex atau role="dialog")
	- Otomatis trap focus di dalam modal
	- Escape key ditangani via event 'cancel'
	- Backdrop dirender secara native dengan ::backdrop CSS pseudo-element
-->
<dialog
	bind:this={dialogEl}
	oncancel={handleCancel}
	onclick={handleBackdropClick}
	aria-label={title ?? 'Modal'}
	class="m-auto max-h-[90vh] w-full rounded-lg border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm open:flex open:flex-col focus:outline-none dark:border-[#2a2a2a] dark:bg-[#141414] {sizes[
		size
	]} {className ?? ''}"
>
	<!-- Header -->
	{#if title}
		<div
			class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-[#2a2a2a]"
		>
			<h2 class="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
			<button
				type="button"
				onclick={handleClose}
				aria-label="Close modal"
				class="focus:focus:ring-primary/20focus:outline-none flex items-center justify-center rounded-md p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 focus:ring-2 dark:text-[#666666] dark:hover:bg-[#1e1e1e] dark:hover:text-white"
			>
				<X size={18} />
			</button>
		</div>
	{/if}

	<!-- Body -->
	<div class="flex-1 overflow-y-auto px-5 py-4 text-sm text-slate-700 dark:text-[#a0a0a0]">
		{@render children()}
	</div>

	<!-- Footer (opsional) -->
	{#if footer}
		<div class="border-t border-slate-200 px-5 py-4 dark:border-[#2a2a2a]">
			{@render footer()}
		</div>
	{/if}
</dialog>
