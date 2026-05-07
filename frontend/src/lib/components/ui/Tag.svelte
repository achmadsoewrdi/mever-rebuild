<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		label: string;
		variant?:
			| 'primary'
			| 'success'
			| 'info'
			| 'warning'
			| 'danger'
			| 'secondary'
			| 'outline'
			| 'dash'
			| 'mp4'
			| 'h264'
			| 'hevc'
			| 'vp9'
			| 'webm'
			| 'default';
		class?: string;
	}

	let { label, variant, class: className }: Props = $props();

	const variants = {
		default:
			'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/20',
		primary: 'bg-primary/10 text-primary border-primary/20',
		success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
		info: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
		warning: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400',
		danger: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
		secondary:
			'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:bg-slate-400/10 dark:text-slate-400 dark:border-slate-400/20',
		outline: 'bg-transparent border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400',

		// CATEGORICAL MAPPING
		dash: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
		hls: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
		mp4: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
		h264: 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400',
		hevc: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400',
		h265: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400',
		vp9: 'bg-amber-400/20 text-amber-600 border-amber-500/30 dark:text-amber-400',
		vp8: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400',
		webm: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400',
		m3u8: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
		mpd: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400'
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
