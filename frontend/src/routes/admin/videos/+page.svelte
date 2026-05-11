<script lang="ts">
	import { getVideos, deleteVideo } from '$lib/api/admin-videos.api';
	import VideoTable from '$lib/components/admin/VideoTable.svelte';
	import VideoEditModal from '$lib/components/admin/VideoEditModal.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import { Search, Plus, ChevronDown } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';

	interface Video {
		id: string;
		title: string;
		description?: string;
		status: string;
		slug: string;
		thumbnailUrl?: string;
		createdAt: string;
	}

	let videos = $state<Video[]>([]);
	let loading = $state(true);
	let search = $state('');
	let status = $state('');
	let page = $state(1);
	let total = $state(0);
	let limit = 5;

	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let deleteType = $state<'soft' | 'hard'>('soft');
	let selectedVideo = $state<Video | null>(null);
	let videoToDelete = $state<Video | null>(null);

	let isStatusDropdownOpen = $state(false);
	const statusOptions = [
		{ value: '', label: 'Semua Status' },
		{ value: 'ready', label: 'Ready' },
		{ value: 'processing', label: 'Processing' },
		{ value: 'queued', label: 'Queued' },
		{ value: 'failed', label: 'Failed' },
		{ value: 'deleted', label: 'Deleted' }
	];
	const selectedStatusLabel = $derived(
		statusOptions.find((o) => o.value === status)?.label || 'Semua Status'
	);

	async function loadVideos() {
		loading = true;
		try {
			const res = await getVideos({ page, limit, search, status });
			if (res && res.data) {
				videos = res.data.data || [];
				total = res.data.total || 0;
			}
		} catch (err: unknown) {
			console.error(err);
			toast.error('Gagal mengambil data video');
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void search;
		void status;
		void page;

		const timer = setTimeout(() => {
			loadVideos();
		}, 300);

		return () => clearTimeout(timer);
	});

	function handlePageChange(newPage: number) {
		page = newPage;
	}

	function handleSearch(e: Event) {
		search = (e.target as HTMLInputElement).value;
		page = 1;
	}



	function handleEdit(video: Video) {
		selectedVideo = video;
		isEditModalOpen = true;
	}

	function openDeleteModal(video: Video) {
		videoToDelete = video;
		isDeleteModalOpen = true;
	}

	async function handleConfirmDelete() {
		if (!videoToDelete) return;
		try {
			const isHard = deleteType === 'hard';
			await deleteVideo(videoToDelete.id, isHard);
			toast.success(
				isHard ? 'Video berhasil dihapus permanen' : 'Video berhasil dihapus (Soft Delete)'
			);
			isDeleteModalOpen = false;
			loadVideos();
		} catch (err: unknown) {
			console.error(err);
			toast.error('Gagal menghapus video');
		}
	}
</script>

<div class="space-y-4 px-6 py-2">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-text-main">Video Management</h1>
			<p class="text-sm text-text-sub">
				Kelola semua video, pantau status transcode, dan moderasi konten.
			</p>
		</div>
		<Button variant="primary" href="/admin/videos/upload">
			<Plus size={16} class="mr-2" />
			Add Video
		</Button>
	</div>

	<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
		<div class="relative w-full md:max-w-md">
			<div class="absolute top-1/2 left-3.5 -translate-y-1/2 text-text-sub">
				<Search size={18} />
			</div>
			<input
				type="text"
				placeholder="Cari judul video..."
				value={search}
				oninput={handleSearch}
				class="h-11 w-full rounded-md border border-border-base bg-white pr-4 pl-11 text-sm text-text-main transition-all placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none dark:bg-bg-secondary"
			/>
		</div>

		<div class="flex w-full gap-3 md:w-auto">
			<div class="relative min-w-[150px]">
				<!-- Trigger -->
				<button
					onclick={() => (isStatusDropdownOpen = !isStatusDropdownOpen)}
					class="flex h-11 w-full items-center justify-between rounded-md border border-border-base bg-white px-4 text-sm text-text-main transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none dark:bg-bg-secondary"
				>
					<span>{selectedStatusLabel}</span>
					<ChevronDown
						size={16}
						class="text-text-sub transition-transform {isStatusDropdownOpen ? 'rotate-180' : ''}"
					/>
				</button>

				<!-- Dropdown Menu -->
				{#if isStatusDropdownOpen}
					<div
						class="absolute z-10 mt-2 w-full overflow-hidden rounded-md border border-border-base bg-white shadow-lg dark:bg-bg-secondary"
						in:fade={{ duration: 100 }}
					>
						{#each statusOptions as option (option.value)}
							<button
								onclick={() => {
									status = option.value;
									isStatusDropdownOpen = false;
									page = 1; // Reset to page 1 on filter change
									loadVideos();
								}}
								class="w-full px-4 py-2.5 text-left text-sm text-text-main transition-colors hover:bg-bg-surface dark:hover:bg-bg-elevated {status ===
								option.value
									? 'bg-primary/5 font-medium text-primary'
									: ''}"
							>
								{option.label}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	{#if loading && videos.length === 0}
		<div class="flex flex-col items-center justify-center space-y-4 py-12">
			<div class="animate-spin text-primary">⏳</div>
			<span class="text-sm text-text-sub">Sedang memuat data video...</span>
		</div>
	{:else}
		<VideoTable
			{videos}
			on:view={(e) => goto(`/admin/videos/${e.detail.id}`)}
			on:edit={(e) => handleEdit(e.detail)}
			on:delete={(e) => openDeleteModal(e.detail)}
		/>

		{#if total > 0}
			<div class="mt-4">
				<Pagination
					currentPage={page}
					totalPages={Math.ceil(total / limit)}
					itemsPerPage={limit}
					onPageChange={handlePageChange}
				/>
			</div>
		{/if}
	{/if}

	{#if isEditModalOpen && selectedVideo}
		<VideoEditModal bind:open={isEditModalOpen} video={selectedVideo} onsave={loadVideos} />
	{/if}

	{#if isDeleteModalOpen}
		<Modal bind:open={isDeleteModalOpen} title="Konfirmasi Hapus" size="md">
			<div class="py-2">
				<p class="text-text-main">
					Apakah Anda yakin ingin menghapus video <span class="font-bold text-red-500"
						>{videoToDelete?.title}</span
					>?
				</p>

				<div class="mt-4 space-y-3 rounded-md border border-border-base bg-bg-secondary p-4">
					<label class="flex cursor-pointer items-center gap-3">
						<input
							type="radio"
							name="deleteType"
							value="soft"
							bind:group={deleteType}
							class="h-4 w-4 text-primary focus:ring-primary"
						/>
						<div>
							<p class="text-sm font-medium text-text-main">Soft Delete</p>
							<p class="text-xs text-text-sub">
								Hanya menyembunyikan video dari user (status 'deleted').
							</p>
						</div>
					</label>

					<label class="flex cursor-pointer items-center gap-3">
						<input
							type="radio"
							name="deleteType"
							value="hard"
							bind:group={deleteType}
							class="h-4 w-4 text-primary focus:ring-primary"
						/>
						<div>
							<p class="text-sm font-medium text-red-500">Hard Delete</p>
							<p class="text-xs text-text-sub">
								Menghapus data permanen dari database (tidak bisa dikembalikan).
							</p>
						</div>
					</label>
				</div>
			</div>

			{#snippet footer()}
				<div class="flex justify-end gap-3">
					<Button variant="secondary" onclick={() => (isDeleteModalOpen = false)}>Batal</Button>
					<Button variant="destructive" onclick={handleConfirmDelete}>Hapus Video</Button>
				</div>
			{/snippet}
		</Modal>
	{/if}
</div>
