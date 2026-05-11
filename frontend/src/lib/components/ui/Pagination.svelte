<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	// Definisi props menggunakan Runes Svelte 5
	interface Props {
		currentPage: number;
		totalPages: number;
		itemsPerPage: number;
		onPageChange: (page: number) => void;
	}

	let { currentPage, totalPages, itemsPerPage, onPageChange }: Props = $props();
</script>

<div
	class="flex items-center justify-between border-t border-border-base bg-white px-6 py-2 dark:bg-transparent"
>
	<!-- Info Halaman di sebelah kiri -->
	<div class="text-xs font-medium text-text-muted dark:text-slate-300">
		PAGE {currentPage} OF {totalPages} ({itemsPerPage} per page)
	</div>

	<!-- Tombol Navigasi di sebelah kanan -->
	<div class="flex gap-2">
		<Button
			variant="secondary"
			size="sm"
			disabled={currentPage === 1}
			onclick={() => onPageChange(currentPage - 1)}
		>
			Previous
		</Button>
		<Button
			variant="primary"
			size="sm"
			disabled={currentPage === totalPages}
			onclick={() => onPageChange(currentPage + 1)}
		>
			Next
		</Button>
	</div>
</div>
