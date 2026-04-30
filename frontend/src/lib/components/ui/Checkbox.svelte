<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Check } from 'lucide-svelte';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'size'> {
		label?: string;
		checked?: boolean;
	}

	let {
		id = `checkbox-${Math.random().toString(36).substring(2, 9)}`,
		label,
		checked = $bindable(false),
		class: className,
		disabled,
		...rest
	}: Props = $props();
</script>

<div class={cn('group flex items-center gap-2.5', className)}>
	<div class="relative flex h-5 w-5 items-center justify-center">
		<!-- Input asli (Hidden but functional) -->
		<input
			{id}
			{disabled}
			{...rest}
			type="checkbox"
			bind:checked
			class="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-slate-300 bg-white
                   shadow-sm transition-all duration-200
                   checked:border-primary checked:bg-primary
                   hover:border-primary/50
                   focus:ring-4 focus:ring-primary/10 focus:outline-none
                   disabled:cursor-not-allowed disabled:opacity-50
                   dark:border-border-base/50 dark:bg-slate-500/5
                   dark:checked:border-primary dark:checked:bg-primary"
		/>

		<!-- Custom Checkmark Icon (Lucide) -->
		<div
			class="pointer-events-none absolute scale-50 text-white opacity-0 transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100"
		>
			<Check size={14} strokeWidth={4} />
		</div>
	</div>

	{#if label}
		<label
			for={id}
			class={cn(
				'cursor-pointer text-sm font-semibold transition-colors select-none',
				'text-slate-700 dark:text-text-main',
				disabled && 'cursor-not-allowed opacity-50'
			)}
		>
			{label}
		</label>
	{/if}
</div>
