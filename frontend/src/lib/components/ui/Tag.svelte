<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		label: string;
		variant?: 'dash' | 'mp4' | 'h264' | 'hevc' | 'default';
		class?: string;
	}

	let { label, variant = 'default', class: className }: Props = $props();

	// Map variant ke warna spesifik (Clean & Scalable)
	const variants = {
		default:
			'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700',
		dash: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
		mp4: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
		h264: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
		hevc: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
	};
</script>

<div
	class={cn(
		'inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold transition-colors',
		variants[variant],
		className
	)}
>
	{label}
</div>
