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
		const mbps = bps / 1_000_000;
		return `${mbps.toFixed(2)} Mbps`;
	}

	// Warna nilai: bandwidth = green, dropped > 0 = red, dropped = 0 = yellow, lainnya = white
	function droppedColor(n: number): string {
		return n > 0 ? '#f87171' : '#fbbf24';
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="debug-panel"
	onclick={(e) => e.stopPropagation()}
>
	<!-- Close button -->
	{#if onClose}
		<button class="close-btn" onclick={onClose} type="button" aria-label="Close debug panel">
			<svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
				<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
			</svg>
		</button>
	{/if}

	<table class="stats-table">
		<tbody>
			<tr>
				<td class="label">Bandwidth</td>
				<td class="value" style="color: #4ade80">{formatBandwidth(stats.bandwidth)}</td>
			</tr>
			<tr>
				<td class="label">Decoded Frames</td>
				<td class="value" style="color: #f1f5f9">{stats.decodedFrames}</td>
			</tr>
			<tr>
				<td class="label">Dropped Frames</td>
				<td class="value" style="color: {droppedColor(stats.droppedFrames)}">{stats.droppedFrames}</td>
			</tr>
			<tr>
				<td class="label">Corrupted Frames</td>
				<td class="value" style="color: {stats.corruptedFrames > 0 ? '#f87171' : '#f1f5f9'}">
					{stats.corruptedFrames} s
				</td>
			</tr>
			<tr>
				<td class="label">Load Time</td>
				<td class="value" style="color: #f1f5f9">{stats.loadTime > 0 ? `${stats.loadTime} ms` : '—'}</td>
			</tr>
			<tr>
				<td class="label">Width</td>
				<td class="value" style="color: #f1f5f9">{stats.width > 0 ? `${stats.width} px` : '—'}</td>
			</tr>
			<tr>
				<td class="label">Height</td>
				<td class="value" style="color: #f1f5f9">{stats.height > 0 ? `${stats.height} px` : '—'}</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	.debug-panel {
		position: relative;
		background: rgba(40, 44, 42, 0.92);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		padding: 14px 16px;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		min-width: 240px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		pointer-events: all;
	}

	.close-btn {
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		border: none;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}
	.close-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.stats-table {
		border-collapse: collapse;
		width: 100%;
	}

	.stats-table tr + tr td {
		padding-top: 7px;
	}

	.label {
		font-family: 'Courier New', 'Consolas', monospace;
		font-size: 11px;
		color: rgba(200, 210, 205, 0.75);
		padding-right: 20px;
		white-space: nowrap;
		letter-spacing: 0.01em;
	}

	.value {
		font-family: 'Courier New', 'Consolas', monospace;
		font-size: 11px;
		font-weight: 600;
		text-align: right;
		white-space: nowrap;
		letter-spacing: 0.02em;
	}
</style>
