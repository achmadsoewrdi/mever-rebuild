<script lang="ts">
	import SidebarItem from './SidebarItem.svelte';

	let filters = $state({
		hls: true,
		dash: false,
		plain: false,
		h264: false
	});
</script>

<aside class="w-64 space-y-6 bg-white p-4">
	<!-- Section: Protocols -->
	<section>
		<h3 class="mb-2 px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
			Protocols
		</h3>
		<div class="space-y-1">
			<SidebarItem label="HLS" count={6} bind:checked={filters.hls} />
			<SidebarItem label="DASH" count={6} bind:checked={filters.dash} />
			<SidebarItem label="Plain" count={6} bind:checked={filters.plain} />
		</div>
	</section>

	<!-- Section: Encoders -->
	<section>
		<h3 class="mb-2 px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
			Encoders (Codec)
		</h3>
		<div class="space-y-1">
			<SidebarItem label="H.264" count={6} bind:checked={filters.h264} />
		</div>
	</section>
</aside>
