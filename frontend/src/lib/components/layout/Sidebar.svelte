<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';
	import { filterStore } from '$lib/stores/video-filter.svelte';
</script>

<aside
	class="flex h-full w-72 flex-col gap-8 border-r border-slate-200 bg-white px-4 py-8 dark:border-border-base/50 dark:bg-bg-secondary"
>
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
</aside>
