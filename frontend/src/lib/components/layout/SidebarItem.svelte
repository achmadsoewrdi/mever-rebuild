<script lang="ts">
	import Checkbox from '../ui/Checkbox.svelte';
	import { cn } from '../../utils/cn';

	// Menggunakan Svelte 5 Props (Runes)
	interface Props {
		label: string;
		checked?: boolean;
		class?: string;
	}

	let { label, checked = $bindable(false), class: className }: Props = $props();
</script>

<label
	class={cn(
		'group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 transition-all duration-200 select-none',
		checked ? 'bg-slate-100 dark:bg-white/10' : 'hover:bg-slate-50 dark:hover:bg-white/5',
		className
	)}
>
	<div class="flex items-center gap-3">
		<!-- Checkbox sinkron dengan prop 'checked' -->
		<Checkbox bind:checked />

		<!-- Style teks Label -->
		<span
			class={cn(
				'text-[13px] font-medium transition-colors',
				checked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/50'
			)}
		>
			{label}
		</span>
	</div>
</label>
