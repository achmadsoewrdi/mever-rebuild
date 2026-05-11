<script lang="ts">
	import { Pencil, Power, Trash2, Cpu, HardDrive } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import type { QualityPresetData } from '$lib/api/presets.api';

	interface Preset extends QualityPresetData {
		id: string;
	}

	// Menggunakan snippet Svelte 5 untuk props
	let { preset, onEdit, onToggleActive, onDelete } = $props<{
		preset: Preset;
		onEdit: () => void;
		onToggleActive: () => void;
		onDelete: () => void;
	}>();
</script>

<div
	class="rounded-lg border border-border-base bg-bg-surface p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg {preset.isActive
		? ''
		: 'opacity-75 hover:opacity-100'}"
	in:fade={{ duration: 200 }}
>
	<div class="mb-4 flex items-center justify-between">
		<div class="flex items-center gap-2">
			<div
				class="h-3 w-3 rounded-full {preset.isActive ? 'bg-green-500' : 'bg-red-500'} shrink-0"
			></div>
			<h3 class="font-medium text-text-main">{preset.name}</h3>
		</div>

		<!-- Actions Inline -->
		<div class="flex items-center gap-1">
			<button
				onclick={onEdit}
				class="rounded-md p-1.5 text-text-sub transition-colors hover:bg-bg-elevated hover:text-primary"
				title="Edit"
			>
				<Pencil size={14} />
			</button>
			<button
				onclick={onToggleActive}
				class="rounded-md p-1.5 text-text-sub transition-colors hover:bg-bg-elevated {preset.isActive
					? 'hover:text-yellow-500'
					: 'hover:text-green-500'}"
				title={preset.isActive ? 'Nonaktifkan' : 'Aktifkan'}
			>
				<Power size={14} />
			</button>
			<button
				onclick={onDelete}
				class="rounded-md p-1.5 text-text-sub transition-colors hover:bg-bg-elevated hover:text-red-500"
				title="Hapus"
			>
				<Trash2 size={14} />
			</button>
		</div>
	</div>

	<!-- Info Grid Ringkas -->
	<div class="grid grid-cols-2 gap-3 border-t border-border-base pt-3 text-xs text-text-sub">
		<div class="flex items-center gap-1.5">
			<Cpu size={12} class="text-slate-400" />
			<span>Codec: <b class="text-text-main">{preset.codec || '-'}</b></span>
		</div>
		<div class="flex items-center gap-1.5">
			<HardDrive size={12} class="text-slate-400" />
			<span>Format: <b class="text-text-main uppercase">{preset.format || '-'}</b></span>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-slate-400">📐</span>
			<span>Res: <b class="text-text-main">{preset.resolution || '-'}</b></span>
		</div>
		<div class="flex items-center gap-1.5">
			<span class="text-slate-400">🚀</span>
			<span
				>Bitrate: <b class="text-text-main"
					>{preset.bitrateKbps ? `${preset.bitrateKbps} kbps` : '-'}</b
				></span
			>
		</div>
	</div>
</div>
