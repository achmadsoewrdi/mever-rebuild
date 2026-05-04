<script lang="ts">
	import { Search, LayoutGrid, List } from 'lucide-svelte';

	// Import Komponen UI milikmu
	import Input from '../ui/Input.svelte';
	import Button from '../ui/Button.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		searchQuery?: string;
		viewMode?: 'grid' | 'list';
		compact?: boolean;
	}

	let {
		searchQuery = $bindable(''),
		viewMode = $bindable('list'),
		compact = false
	}: Props = $props();

	function setView(mode: 'grid' | 'list') {
		viewMode = mode;
	}
</script>

<div class={cn('flex items-center justify-between gap-3', compact ? 'py-1' : 'py-2')}>
	<!-- Bagian Input Pencarian Menggunakan Input.svelte -->
	<div class="flex-1 transition-all duration-300">
		<Input
			placeholder="Search"
			bind:value={searchQuery}
			variant="outline"
			class={cn(
				'rounded-xl border border-slate-300 bg-white text-slate-900 transition-all dark:border-border-base/50 dark:bg-bg-surface dark:text-white',
				compact ? 'h-10 text-sm' : 'h-12'
			)}
		>
			{#snippet leadingIcon()}
				<Search size={compact ? 18 : 20} strokeWidth={2} class="text-slate-400" />
			{/snippet}
		</Input>
	</div>

	<!-- Bagian Toggle View Menggunakan Button.svelte -->
	<div
		class={cn(
			'flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 transition-all dark:border-border-base/50 dark:bg-bg-surface',
			compact && 'scale-90'
		)}
	>
		<!-- Tombol Grid -->
		<Button
			variant={viewMode === 'grid' ? 'primary' : 'ghost'}
			size="icon"
			onclick={() => setView('grid')}
			class={cn(
				'rounded-lg transition-all',
				compact ? 'h-8 w-8' : 'h-10 w-10',
				viewMode === 'grid'
					? 'bg-primary text-white shadow-md'
					: 'text-slate-400 dark:text-border-base/50'
			)}
		>
			<LayoutGrid size={compact ? 16 : 20} />
		</Button>

		<!-- Tombol List -->
		<Button
			variant={viewMode === 'list' ? 'primary' : 'ghost'}
			size="icon"
			onclick={() => setView('list')}
			class={cn(
				'rounded-lg transition-all',
				compact ? 'h-8 w-8' : 'h-10 w-10',
				viewMode === 'list'
					? 'bg-primary text-white shadow-md'
					: 'text-slate-400 dark:text-border-base/50'
			)}
		>
			<List size={compact ? 16 : 20} />
		</Button>
	</div>
</div>
