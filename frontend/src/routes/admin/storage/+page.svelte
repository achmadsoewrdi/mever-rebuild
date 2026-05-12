<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getStorageConfigs,
		createStorageConfig,
		updateStorageConfig,
		deleteStorageConfig,
		type StorageConfigData
	} from '$lib/api/storage.api';
	import Button from '$lib/components/ui/Button.svelte';
	import { Plus, Pencil, Trash2, Globe, ShieldCheck, ShieldAlert } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import Modal from '$lib/components/ui/Modal.svelte';

	interface StorageConfig extends StorageConfigData {
		id: string;
		createdAt: string;
		updatedAt: string;
	}

	let configs = $state<StorageConfig[]>([]);
	let loading = $state(true);

	let isModalOpen = $state(false);
	let modalMode = $state<'create' | 'edit'>('create');
	let selectedConfig = $state<StorageConfig | null>(null);

	let formData = $state<StorageConfigData>({
		name: '',
		endpointUrl: '',
		bucketInput: '',
		bucketOutput: '',
		accessKey: '',
		secretKey: '',
		isActive: true
	});

	async function loadConfigs() {
		loading = true;
		try {
			const res = await getStorageConfigs();
			configs = res.data.data || res.data;
		} catch (error: unknown) {
			const axiosError = error as { response?: { data?: { message?: string } } };
			toast.error(axiosError.response?.data?.message || 'Gagal memuat konfigurasi');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadConfigs();
	});

	function openCreateModal() {
		modalMode = 'create';
		formData = {
			name: '',
			endpointUrl: '',
			bucketInput: '',
			bucketOutput: '',
			accessKey: '',
			secretKey: '',
			isActive: true
		};
		isModalOpen = true;
	}

	function openEditModal(config: StorageConfig) {
		modalMode = 'edit';
		selectedConfig = config;
		formData = {
			name: config.name,
			endpointUrl: config.endpointUrl,
			bucketInput: config.bucketInput,
			bucketOutput: config.bucketOutput,
			accessKey: config.accessKey,
			secretKey: '', // Kosongkan password/secret demi keamanan
			isActive: config.isActive
		};
		isModalOpen = true;
	}

	async function handleSubmit() {
		try {
			if (modalMode === 'create') {
				await createStorageConfig(formData);
				toast.success('Berhasil menambahkan konfigurasi');
			} else if (modalMode === 'edit' && selectedConfig) {
				// Jika secret key kosong, jangan dikirim (agar tidak mengubah yang lama)
				const dataToUpdate: Partial<StorageConfigData> = { ...formData };
				if (!dataToUpdate.secretKey) {
					delete dataToUpdate.secretKey;
				}
				await updateStorageConfig(selectedConfig.id, dataToUpdate);
				toast.success('Berhasil memperbarui konfigurasi');
			}
			isModalOpen = false;
			loadConfigs();
		} catch (error: unknown) {
			const axiosError = error as { response?: { data?: { message?: string } } };
			toast.error(axiosError.response?.data?.message || 'Terjadi kesalahan');
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Hapus konfigurasi ini secara permanen?')) return;
		try {
			await deleteStorageConfig(id);
			toast.success('Berhasil menghapus konfigurasi');
			loadConfigs();
		} catch (error: unknown) {
			const axiosError = error as { response?: { data?: { message?: string } } };
			toast.error(axiosError.response?.data?.message || 'Gagal menghapus konfigurasi');
		}
	}

	async function toggleActive(config: StorageConfig) {
		try {
			await updateStorageConfig(config.id, { isActive: !config.isActive });
			toast.success(`Status ${config.name} berhasil diubah`);
			loadConfigs();
		} catch (error: unknown) {
			const axiosError = error as { response?: { data?: { message?: string } } };
			toast.error(axiosError.response?.data?.message || 'Gagal mengubah status');
		}
	}
</script>

<div class="space-y-6 p-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-text-main">Storage Configurations</h1>
			<p class="text-sm text-text-sub">
				Kelola tempat penyimpanan file video Anda (Local / S3 / MinIO)
			</p>
		</div>
		<Button onclick={openCreateModal} variant="primary" class="gap-2">
			<Plus size={18} /> Tambah Konfigurasi
		</Button>
	</div>

	{#if loading && configs.length === 0}
		<div class="py-10 text-center text-text-sub">Memuat data...</div>
	{:else}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each configs as config (config.id)}
				<div class="space-y-4 rounded-xl border border-border-base bg-bg-secondary p-5">
					<div class="flex items-start justify-between">
						<div>
							<h2 class="text-lg font-semibold text-text-main">{config.name}</h2>
							<span class="mt-1 flex items-center gap-1 text-xs text-text-sub">
								<Globe size={12} />
								{config.endpointUrl}
							</span>
						</div>
						<span
							class={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${config.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
						>
							{#if config.isActive}
								<ShieldCheck size={12} /> Aktif
							{:else}
								<ShieldAlert size={12} /> Nonaktif
							{/if}
						</span>
					</div>

					<div class="grid grid-cols-2 gap-2 text-sm">
						<div class="bg-bg-main rounded-lg p-2">
							<span class="text-xs text-text-sub">Bucket Input</span>
							<p class="truncate font-mono text-text-main">{config.bucketInput}</p>
						</div>
						<div class="bg-bg-main rounded-lg p-2">
							<span class="text-xs text-text-sub">Bucket Output</span>
							<p class="truncate font-mono text-text-main">{config.bucketOutput}</p>
						</div>
					</div>

					<div class="flex items-center justify-between border-t border-border-base pt-2">
						<button
							onclick={() => toggleActive(config)}
							class="text-xs text-text-sub transition-colors hover:text-text-main"
						>
							{config.isActive ? 'Nonaktifkan' : 'Aktifkan'}
						</button>
						<div class="flex gap-2">
							<button
								onclick={() => openEditModal(config)}
								class="hover:bg-bg-main rounded-lg p-1.5 text-text-sub transition-colors hover:text-text-main"
							>
								<Pencil size={16} />
							</button>
							<button
								onclick={() => handleDelete(config.id)}
								class="hover:bg-bg-main rounded-lg p-1.5 text-text-sub transition-colors hover:text-red-500"
							>
								<Trash2 size={16} />
							</button>
						</div>
					</div>
				</div>
			{/each}

			{#if configs.length === 0}
				<div
					class="col-span-full rounded-lg border-2 border-dashed border-border-base py-10 text-center text-sm text-text-sub"
				>
					Belum ada konfigurasi penyimpanan. Klik "Tambah Konfigurasi" untuk membuat baru.
				</div>
			{/if}
		</div>
	{/if}

	<!-- Modal Form -->
	{#if isModalOpen}
		<!-- Modal Form menggunakan komponen UI Modal -->
		<Modal
			bind:open={isModalOpen}
			title={modalMode === 'create' ? 'Tambah Konfigurasi' : 'Edit Konfigurasi'}
			size="lg"
		>
			<form id="storage-form" onsubmit={handleSubmit} class="space-y-3">
				<div>
					<label class="text-xs text-text-sub" for="name">Nama Konfigurasi</label>
					<input
						id="name"
						type="text"
						bind:value={formData.name}
						class="bg-bg-main w-full rounded-lg border border-border-base p-2 text-text-main"
						placeholder="Contoh: AWS S3 Production"
						required
					/>
				</div>

				<div>
					<label class="text-xs text-text-sub" for="endpoint">Endpoint URL</label>
					<input
						id="endpoint"
						type="text"
						bind:value={formData.endpointUrl}
						class="bg-bg-main w-full rounded-lg border border-border-base p-2 text-text-main"
						placeholder="https://s3.amazonaws.com"
						required
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label class="text-xs text-text-sub" for="input-bucket">Bucket Input</label>
						<input
							id="input-bucket"
							type="text"
							bind:value={formData.bucketInput}
							class="bg-bg-main w-full rounded-lg border border-border-base p-2 text-text-main"
							required
						/>
					</div>
					<div>
						<label class="text-xs text-text-sub" for="output-bucket">Bucket Output</label>
						<input
							id="output-bucket"
							type="text"
							bind:value={formData.bucketOutput}
							class="bg-bg-main w-full rounded-lg border border-border-base p-2 text-text-main"
							required
						/>
					</div>
				</div>

				<div>
					<label class="text-xs text-text-sub" for="access-key">Access Key</label>
					<input
						id="access-key"
						type="text"
						bind:value={formData.accessKey}
						class="bg-bg-main w-full rounded-lg border border-border-base p-2 text-text-main"
						required
					/>
				</div>

				<div>
					<label class="text-xs text-text-sub" for="secret-key">
						Secret Key {modalMode === 'edit' ? '(Kosongkan jika tidak ingin diubah)' : ''}
					</label>
					<input
						id="secret-key"
						type="password"
						bind:value={formData.secretKey}
						class="bg-bg-main w-full rounded-lg border border-border-base p-2 text-text-main"
						required={modalMode === 'create'}
					/>
				</div>

				<div class="flex items-center gap-2 pt-2">
					<input
						id="active"
						type="checkbox"
						bind:checked={formData.isActive}
						class="rounded border-border-base"
					/>
					<label for="active" class="text-sm text-text-main">Aktifkan Konfigurasi</label>
				</div>
			</form>

			<!-- Menggunakan Snippet Footer bawaan komponen Modal -->
			{#snippet footer()}
				<div class="flex justify-end gap-3">
					<Button onclick={() => (isModalOpen = false)} variant="secondary">Batal</Button>
					<!-- Gunakan form attribute agar tombol submit di luar tag <form> tetap berfungsi -->
					<Button type="submit" form="storage-form" variant="primary">Simpan</Button>
				</div>
			{/snippet}
		</Modal>
	{/if}
</div>
