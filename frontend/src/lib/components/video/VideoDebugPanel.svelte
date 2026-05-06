<script lang="ts">
	export interface DebugStats {
		bandwidth: number; // bits/s
		decodedFrames: number;
		droppedFrames: number;
		corruptedFrames: number;
		loadTime: number; // ms
		width: number;
		height: number;
	}

	interface Props {
		stats: DebugStats;
		onClose?: () => void;
	}

	let { stats, onClose }: Props = $props();

	function formatBandwidth(bps: number): string {
		if (bps <= 0) return '—';
		if (bps < 1000) return `${bps} bps`;
		if (bps < 1_000_000) return `${(bps / 1000).toFixed(1)} Kbps`;
		if (bps < 1_000_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`;
		return `${(bps / 1_000_000_000).toFixed(2)} Gbps`;
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="pointer-events-auto relative min-w-[240px] rounded-xl border border-white/10 bg-zinc-900/90 p-4 shadow-2xl backdrop-blur-md"
	onclick={(e) => e.stopPropagation()}
>
	<!-- Close button -->
	{#if onClose}
		<button 
			class="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/50 transition-colors hover:bg-white/20 hover:text-white" 
			onclick={onClose} 
			type="button" 
			aria-label="Close debug panel"
		>
			<svg viewBox="0 0 24 24" fill="currentColor" class="h-2.5 w-2.5">
				<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
			</svg>
		</button>
	{/if}

	<div class="flex flex-col gap-1.5">
		<div class="flex items-center justify-between gap-6">
			<span class="whitespace-nowrap font-mono text-[11px] tracking-wide text-zinc-300/80">Bandwidth</span>
			<span class="whitespace-nowrap font-mono text-[11px] font-semibold tracking-wider text-emerald-400">{formatBandwidth(stats.bandwidth)}</span>
		</div>
		<div class="flex items-center justify-between gap-6">
			<span class="whitespace-nowrap font-mono text-[11px] tracking-wide text-zinc-300/80">Decoded Frames</span>
			<span class="whitespace-nowrap font-mono text-[11px] font-semibold tracking-wider text-slate-100">{stats.decodedFrames}</span>
		</div>
		<div class="flex items-center justify-between gap-6">
			<span class="whitespace-nowrap font-mono text-[11px] tracking-wide text-zinc-300/80">Dropped Frames</span>
			<span class="whitespace-nowrap font-mono text-[11px] font-semibold tracking-wider {stats.droppedFrames > 0 ? 'text-rose-400' : 'text-amber-400'}">{stats.droppedFrames}</span>
		</div>
		<div class="flex items-center justify-between gap-6">
			<span class="whitespace-nowrap font-mono text-[11px] tracking-wide text-zinc-300/80">Corrupted Frames</span>
			<span class="whitespace-nowrap font-mono text-[11px] font-semibold tracking-wider {stats.corruptedFrames > 0 ? 'text-rose-400' : 'text-slate-100'}">{stats.corruptedFrames}</span>
		</div>
		<div class="flex items-center justify-between gap-6">
			<span class="whitespace-nowrap font-mono text-[11px] tracking-wide text-zinc-300/80">Load Time</span>
			<span class="whitespace-nowrap font-mono text-[11px] font-semibold tracking-wider text-slate-100">{stats.loadTime > 0 ? `${stats.loadTime} ms` : '—'}</span>
		</div>
		<div class="flex items-center justify-between gap-6">
			<span class="whitespace-nowrap font-mono text-[11px] tracking-wide text-zinc-300/80">Width</span>
			<span class="whitespace-nowrap font-mono text-[11px] font-semibold tracking-wider text-slate-100">{stats.width > 0 ? `${stats.width} px` : '—'}</span>
		</div>
		<div class="flex items-center justify-between gap-6">
			<span class="whitespace-nowrap font-mono text-[11px] tracking-wide text-zinc-300/80">Height</span>
			<span class="whitespace-nowrap font-mono text-[11px] font-semibold tracking-wider text-slate-100">{stats.height > 0 ? `${stats.height} px` : '—'}</span>
		</div>
	</div>
</div>
