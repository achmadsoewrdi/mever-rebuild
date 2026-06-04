<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { QualityPresetData } from '$lib/api/presets.api';

	let {
		isOpen,
		mode,
		formData = $bindable(),
		onSubmit,
		onClose
	} = $props<{
		isOpen: boolean;
		mode: 'create' | 'edit';
		formData: QualityPresetData;
		onSubmit: () => void;
		onClose: () => void;
	}>();
</script>

<Modal
	open={isOpen}
	onclose={onClose}
	title={mode === 'create' ? 'Tambah Preset Kualitas' : 'Edit Preset Kualitas'}
>
	<form
		onsubmit={(e) => {
			e.preventDefault();
			onSubmit();
		}}
		class="space-y-4 p-4"
	>
		<Input
			label="Nama Preset"
			placeholder="Misal: 1080p, 720p Low"
			bind:value={formData.name}
			required
		/>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="preset-codec" class="mb-1 block text-sm font-medium text-text-main">Codec</label>
				<div class="relative">
					<select
						id="preset-codec"
						bind:value={formData.codec}
						class="w-full appearance-none rounded-md border border-border-base bg-bg-surface p-2.5 pr-8 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary"
					>
						<option value="h264">H.264</option>
						<option value="h265">H.265 (HEVC)</option>
						<option value="vp8">VP8</option>
						<option value="vp9">VP9</option>
						<option value="av1">AV1</option>
						<option value="prores">ProRes</option>
					</select>
					<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
					</div>
				</div>
			</div>
			<div>
				<label for="preset-format" class="mb-1 block text-sm font-medium text-text-main">Format</label>
				<div class="relative">
					<select
						id="preset-format"
						bind:value={formData.format}
						class="w-full appearance-none rounded-md border border-border-base bg-bg-surface p-2.5 pr-8 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary"
					>
						<option value="mp4">MP4 (.mp4)</option>
						<option value="webm">WebM (.webm)</option>
						<option value="mkv">Matroska (.mkv)</option>
						<option value="mov">QuickTime (.mov)</option>
					</select>
					<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
					</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<Input label="Resolusi" placeholder="Misal: 1920x1080" bind:value={formData.resolution} />
			<Input
				label="Bitrate (kbps)"
				type="number"
				placeholder="Misal: 5000"
				bind:value={formData.bitrateKbps}
			/>
		</div>

		<div class="flex items-center gap-2 pt-2">
			<input
				type="checkbox"
				id="isActive"
				bind:checked={formData.isActive}
				class="h-4 w-4 rounded border-border-base text-primary focus:ring-primary"
			/>
			<label for="isActive" class="cursor-pointer text-sm font-medium text-text-main"
				>Aktifkan Preset</label
			>
		</div>

		<div class="flex justify-end gap-2 border-t border-border-base pt-4">
			<Button variant="outline" onclick={onClose}>Batal</Button>
			<Button type="submit" variant="primary">Simpan Preset</Button>
		</div>
	</form>
</Modal>
