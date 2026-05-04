<script lang="ts">
	import { Search, LayoutGrid, List } from 'lucide-svelte';

	// Import Komponen UI milikmu
	import Input from '../ui/Input.svelte';
	import Button from '../ui/Button.svelte';

	interface Props {
		searchQuery?: string;
		viewMode?: 'grid' | 'list';
	}

	let { searchQuery = $bindable(''), viewMode = $bindable('list') }: Props = $props();

	function setView(mode: 'grid' | 'list') {
		viewMode = mode;
	}
</script>

<div class="flex items-center justify-between gap-4 py-4">
	<!-- Bagian Input Pencarian Menggunakan Input.svelte -->
	<div class="max-w-2xl flex-1">
		<Input
			placeholder="Search videos..."
			bind:value={searchQuery}
			variant="filled"
			class="h-12 rounded-xl border border-slate-400 dark:border-border-base/50 dark:bg-bg-surface"
		>
			{#snippet leadingIcon()}
				<Search size={20} strokeWidth={2} />
			{/snippet}
		</Input>
	</div>

	<!-- Bagian Toggle View Menggunakan Button.svelte -->
	<div
		class="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-border-base/50 dark:bg-bg-surface"
	>
		<!-- Tombol Grid -->
		<Button
			variant={viewMode === 'grid' ? 'primary' : 'ghost'}
			size="icon"
			onclick={() => setView('grid')}
			class="h-10 w-10 rounded-lg {viewMode === 'grid'
				? 'shadow-md'
				: 'text-slate-400 dark:text-border-base/50'}"
		>
			<LayoutGrid size={20} />
		</Button>

		<!-- Tombol List -->
		<Button
			variant={viewMode === 'list' ? 'primary' : 'ghost'}
			size="icon"
			onclick={() => setView('list')}
			class="h-10 w-10 rounded-lg {viewMode === 'list'
				? 'shadow-md'
				: 'text-slate-400 dark:text-border-base/50'}"
		>
			<List size={20} />
		</Button>
	</div>
</div>
