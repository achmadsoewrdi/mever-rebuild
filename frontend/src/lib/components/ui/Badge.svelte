<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		label: string;
		color?: 'green' | 'yellow' | 'red' | 'default';
		class?: string;
	}

	let { label, color = 'default', class: className }: Props = $props();

	const variants = {
		default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
		green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
		yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500',
		red: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
	};
</script>

<span
	class={cn(
		'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-200',
		variants[color],
		className
	)}
>
	{label}
</span>
