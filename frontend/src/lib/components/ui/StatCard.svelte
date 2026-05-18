<script lang="ts">
	// Menggunakan Svelte 5 Runes untuk Props
	interface Props {
		title: string;
		value: string | number;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon?: any; // Menerima Icon dari Lucide (eslint dinonaktifkan untuk baris ini)
		description?: string;
	}

	let { title, value, icon: Icon, description }: Props = $props();
</script>

<div
	class="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-border-base/50 dark:bg-bg-secondary"
>
	<div class="flex items-center justify-between">
		<div>
			<p class="text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-text-muted">
				{title}
			</p>
			<h3 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
				{value}
			</h3>
			{#if description}
				<p class="mt-1 text-xs text-slate-500 dark:text-text-muted">
					{description}
				</p>
			{/if}
		</div>

		{#if Icon}
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-[#FF1E4D] dark:bg-red-900/20 dark:text-red-400"
			>
				<!-- Render icon secara dinamis -->
				<Icon size={24} />
			</div>
		{/if}
	</div>
</div>
