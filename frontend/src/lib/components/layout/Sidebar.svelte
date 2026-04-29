<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';

	// State untuk manajemen filter menggunakan Svelte 5 Runes
	let filters = $state({
		protocols: {
			hls: true,
			dash: false,
			plain: false
		},
		encoders: {
			h264: false,
			av1: false,
			h265: false,
			vp8: false,
			vp9: false
		},
		resolutions: {
			r4k: false,
			qhd: false,
			fhd: false,
			hd: false,
			sd: false
		},
		packagers: {
			mp4: false
		}
	});
</script>

<aside
	class="flex h-full w-72 flex-col gap-8 border-r border-slate-200 bg-white px-4 py-8 dark:border-bg-surface dark:bg-bg-secondary"
>
	<!-- Section: Protocols -->
	<section>
		<h3 class="mb-3 px-3 text-[11px] font-bold tracking-[2px] text-slate-400 uppercase">
			Protocols
		</h3>
		<div class="flex flex-col gap-1">
			<SidebarItem label="HLS" count={6} bind:checked={filters.protocols.hls} />
			<SidebarItem label="DASH" count={6} bind:checked={filters.protocols.dash} />
			<SidebarItem label="Plain" count={6} bind:checked={filters.protocols.plain} />
		</div>
	</section>

	<!-- Section: Encoders -->
	<section>
		<h3 class="mb-3 px-3 text-[11px] font-bold tracking-[2px] text-slate-400 uppercase">
			Encoders (Codec)
		</h3>
		<div class="flex flex-col gap-1">
			<SidebarItem label="H.264" count={6} bind:checked={filters.encoders.h264} />
			<SidebarItem label="AV1" count={6} bind:checked={filters.encoders.av1} />
			<SidebarItem label="H.265 / HEVC" count={6} bind:checked={filters.encoders.h265} />
			<SidebarItem label="VP8" count={6} bind:checked={filters.encoders.vp8} />
			<SidebarItem label="VP9" count={6} bind:checked={filters.encoders.vp9} />
		</div>
	</section>

	<!-- Section: Resolutions -->
	<section>
		<h3 class="mb-3 px-3 text-[11px] font-bold tracking-[2px] text-slate-400 uppercase">
			Resolutions
		</h3>
		<div class="flex flex-col gap-1">
			<SidebarItem label="4K (2160p)" count={6} bind:checked={filters.resolutions.r4k} />
			<SidebarItem label="QHD (1440p)" count={6} bind:checked={filters.resolutions.qhd} />
			<SidebarItem label="FHD (1080p)" count={6} bind:checked={filters.resolutions.fhd} />
			<SidebarItem label="HD (720p)" count={6} bind:checked={filters.resolutions.hd} />
			<SidebarItem label="SD (480p)" count={6} bind:checked={filters.resolutions.sd} />
		</div>
	</section>

	<!-- Section: Packagers -->
	<section>
		<h3 class="mb-3 px-3 text-[11px] font-bold tracking-[2px] text-slate-400 uppercase">
			Packagers
		</h3>
		<div class="flex flex-col gap-1">
			<SidebarItem label="MP4" count={6} bind:checked={filters.packagers.mp4} />
		</div>
	</section>
</aside>
