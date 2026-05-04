<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';
	import { filterStore } from '$lib/stores/video-filter.svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Props {
		isCollapsed?: boolean;
		onToggle?: () => void;
	}

	let { isCollapsed = false, onToggle }: Props = $props();
</script>

<aside
	class="relative h-full border-r border-slate-200 bg-white transition-all duration-300 dark:border-border-base/50 dark:bg-bg-secondary {isCollapsed
		? 'w-0 border-none'
		: 'w-52'}"
>
	<!-- Toggle Button (Premium Pill Design) -->
	<button
		onclick={onToggle}
		class="absolute top-16 z-60 flex h-8 w-8 items-center justify-center rounded-full border shadow-md transition-all duration-300 hover:scale-110 active:scale-95 {isCollapsed
			? '-left-3 border-rose-200 bg-rose-500 text-white '
			: '-right-4 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-rose-500 dark:border-border-base/50 dark:bg-bg-surface dark:text-text-muted dark:hover:bg-bg-elevated'}"
		aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
	>
		{#if isCollapsed}
			<ChevronRight size={18} strokeWidth={3} />
		{:else}
			<ChevronLeft size={18} strokeWidth={3} />
		{/if}
	</button>

	<!-- Content Wrapper: Hanya ini yang disembunyikan -->
	<div
		class="flex h-full flex-col gap-8 overflow-hidden transition-all duration-300 {isCollapsed
			? 'w-0 opacity-0'
			: 'w-full px-4 py-8 opacity-100'}"
	>
		<div class="flex flex-col gap-8">
			<!-- Section: Protocols -->
			<section>
				<h3
					class="mb-3 px-3 text-[11px] font-bold tracking-[2px] text-slate-400 uppercase dark:text-border-base/90"
				>
					Protocols
				</h3>
				<div class="flex flex-col gap-1">
					<SidebarItem label="HLS" bind:checked={filterStore.protocols.hls} />
					<SidebarItem label="DASH" bind:checked={filterStore.protocols.dash} />
					<SidebarItem label="Plain" bind:checked={filterStore.protocols.plain} />
				</div>
			</section>

			<!-- Section: Encoders -->
			<section>
				<h3
					class="mb-3 px-3 text-[11px] font-bold tracking-[2px] text-slate-400 uppercase dark:text-border-base/90"
				>
					Encoders (Codec)
				</h3>
				<div class="flex flex-col gap-1">
					<SidebarItem label="H.264" bind:checked={filterStore.encoders.h264} />
					<SidebarItem label="AV1" bind:checked={filterStore.encoders.av1} />
					<SidebarItem label="H.265 / HEVC" bind:checked={filterStore.encoders.h265} />
					<SidebarItem label="VP8" bind:checked={filterStore.encoders.vp8} />
					<SidebarItem label="VP9" bind:checked={filterStore.encoders.vp9} />
				</div>
			</section>

			<!-- Section: Resolutions -->
			<section>
				<h3
					class="mb-3 px-3 text-[11px] font-bold tracking-[2px] text-slate-400 uppercase dark:text-border-base/90"
				>
					Resolutions
				</h3>
				<div class="flex flex-col gap-1">
					<SidebarItem label="4K (2160p)" bind:checked={filterStore.resolutions.r4k} />
					<SidebarItem label="QHD (1440p)" bind:checked={filterStore.resolutions.qhd} />
					<SidebarItem label="FHD (1080p)" bind:checked={filterStore.resolutions.fhd} />
					<SidebarItem label="HD (720p)" bind:checked={filterStore.resolutions.hd} />
					<SidebarItem label="SD (480p)" bind:checked={filterStore.resolutions.sd} />
				</div>
			</section>

			<!-- Section: Packagers -->
			<section>
				<h3
					class="mb-3 px-3 text-[11px] font-bold tracking-[2px] text-slate-400 uppercase dark:text-border-base/90"
				>
					Packagers
				</h3>
				<div class="flex flex-col gap-1">
					<SidebarItem label="MP4" bind:checked={filterStore.packagers.mp4} />
				</div>
			</section>
		</div>
	</div>
</aside>
