<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getPresets,
		createPreset,
		updatePreset,
		deletePreset,
		type QualityPresetData
	} from '$lib/api/presets.api';
	import Button from '$lib/components/ui/Button.svelte';
	import PresetCard from '$lib/components/presets/PresetCard.svelte';
	import PresetFormModal from '$lib/components/presets/PresetFormModal.svelte';
	import { Plus } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	interface Preset extends QualityPresetData {
		id: string;
		createdAt: string;
		updatedAt: string;
	}

	let presets = $state<Preset[]>([]);
	let loading = $state(true);

	let isModalOpen = $state(false);
	let modalMode = $state<'create' | 'edit'>('create');
	let selectedPreset = $state<Preset | null>(null);

	let formData = $state<QualityPresetData>({
		name: '',
		codec: 'h264',
		format: 'hls',
		resolution: '1280x720',
		bitrateKbps: 2500,
		isActive: true
	});

	async function loadPresets() {
		loading = true;
		try {
			const res = await getPresets();
			presets = res.data.data || res.data;
		} catch (error: unknown) {
			const axiosError = error as { response?: { data?: { message?: string } } };
			toast.error(axiosError.response?.data?.message || 'Gagal memuat preset');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadPresets();
	});

	function openCreateModal() {
		modalMode = 'create';
		formData = {
			name: '',
			codec: 'h264',
			format: 'hls',
			resolution: '1280x720',
			bitrateKbps: 2500,
			isActive: true
		};
		isModalOpen = true;
	}

	function openEditModal(preset: Preset) {
		modalMode = 'edit';
		selectedPreset = preset;
		formData = {
			name: preset.name,
			codec: preset.codec,
			format: preset.format,
			resolution: preset.resolution,
			bitrateKbps: preset.bitrateKbps,
			isActive: preset.isActive
		};
		isModalOpen = true;
	}

	async function handleSubmit() {
		try {
			if (modalMode === 'create') await createPreset(formData);
			else if (modalMode === 'edit' && selectedPreset)
				await updatePreset(selectedPreset.id, formData);
			isModalOpen = false;
			loadPresets();
		} catch (error: unknown) {
			const axiosError = error as { response?: { data?: { message?: string } } };
			toast.error(axiosError.response?.data?.message || 'Terjadi kesalahan');
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Hapus preset ini secara permanen?')) return;
		try {
			await deletePreset(id);
			loadPresets();
		} catch (error: unknown) {
			const axiosError = error as { response?: { data?: { message?: string } } };
			toast.error(axiosError.response?.data?.message || 'Gagal menghapus preset');
		}
	}

	async function toggleActive(preset: Preset) {
		try {
			await updatePreset(preset.id, { isActive: !preset.isActive });
			loadPresets();
		} catch (error: unknown) {
			const axiosError = error as { response?: { data?: { message?: string } } };
			toast.error(axiosError.response?.data?.message || 'Gagal mengubah status preset');
		}
	}

	const activePresets = $derived(presets.filter((p) => p.isActive));
	const inactivePresets = $derived(presets.filter((p) => !p.isActive));
</script>

<div class="space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-text-main">Quality Presets</h1>
			<p class="text-sm text-text-sub">Kelola konfigurasi kualitas untuk transcoding video</p>
		</div>
		<Button onclick={openCreateModal} variant="primary" class="gap-2">
			<Plus size={18} /> Tambah Preset
		</Button>
	</div>

	{#if loading && presets.length === 0}
		<!-- Loading state tetap di sini -->
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Kolom Aktif -->
			<div class="rounded-xl border border-border-base bg-bg-secondary p-5">
				<!-- Header Kolom -->
				<div class="space-y-4">
					{#each activePresets as preset (preset.id)}
						<PresetCard
							{preset}
							onEdit={() => openEditModal(preset)}
							onToggleActive={() => toggleActive(preset)}
							onDelete={() => handleDelete(preset.id)}
						/>
					{/each}
					
					{#if activePresets.length === 0}
						<div class="text-center py-10 border-2 border-dashed border-border-base rounded-lg text-text-sub text-sm">
							Belum ada preset aktif
						</div>
					{/if}
				</div>
			</div>

			<!-- Kolom Nonaktif -->
			<div class="rounded-xl border border-border-base bg-bg-secondary p-5">
				<!-- Header Kolom -->
				<div class="space-y-4">
					{#each inactivePresets as preset (preset.id)}
						<PresetCard
							{preset}
							onEdit={() => openEditModal(preset)}
							onToggleActive={() => toggleActive(preset)}
							onDelete={() => handleDelete(preset.id)}
						/>
					{/each}
					
					{#if inactivePresets.length === 0}
						<div class="text-center py-10 border-2 border-dashed border-border-base rounded-lg text-text-sub text-sm">
							Semua preset aktif
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- Modal Form -->
	<PresetFormModal
		isOpen={isModalOpen}
		mode={modalMode}
		bind:formData
		onSubmit={handleSubmit}
		onClose={() => (isModalOpen = false)}
	/>
</div>
