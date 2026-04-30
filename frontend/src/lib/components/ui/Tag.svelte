<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		label: string;
		variant?: 'dash' | 'mp4' | 'h264' | 'hevc' | 'vp9' | 'webm' | 'default';
		class?: string;
	}

	let { label, variant, class: className }: Props = $props();

	const variants = {
		default:
			'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/20',
		dash: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
		mp4: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
		h264: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400',
		hevc: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400',
		vp9: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
		webm: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400'
	};

	const activeVariant = $derived(
		variants[variant as keyof typeof variants] ||
			variants[label.toLowerCase() as keyof typeof variants] ||
			variants.default
	);
</script>

<div
	class={cn(
		'inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold shadow-sm transition-all',
		activeVariant,
		className
	)}
>
	{label}
</div>
