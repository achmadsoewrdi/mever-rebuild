<script lang="ts">
	import { onMount } from 'svelte';
	import UserTable from '$lib/components/admin/UserTable.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Pagination from '$lib/components/ui/Pagination.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { Search } from 'lucide-svelte';
	import { getAllUser, deleteUser } from '$lib/api/admin.api';
	import { toast } from 'svelte-sonner';

	interface User {
		id: string;
		name: string;
		email: string;
		role: string;
		createdAt: string;
	}

	// State menggunakan Runes Svelte 5
	let users = $state<User[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let currentPage = $state(1);
	let totalPages = $state(1);
	let itemsPerPage = 5; // Dibatasi 5 user per halaman

	// State untuk Modal Hapus
	let isDeleteModalOpen = $state(false);
	let userToDeleteId = $state<string | null>(null);

	// Derived state untuk mengambil data sesuai halaman aktif
	let displayedUsers = $derived(
		users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	// Fungsi untuk mengambil data user
	async function loadUsers() {
		loading = true;
		try {
			const response = await getAllUser();
			let data = (response.data || []) as User[];

			// Simulasi pencarian lokal jika backend belum mendukung search query
			if (searchQuery) {
				data = data.filter(
					(user: User) =>
						user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						user.email.toLowerCase().includes(searchQuery.toLowerCase())
				);
			}

			users = data;
			// Reset ke halaman 1 saat data berubah atau pencarian dilakukan
			currentPage = 1;
			// Simulasi total halaman berdasarkan data yang ada
			totalPages = Math.ceil(data.length / itemsPerPage) || 1;
		} catch (error) {
			const err = error as Error;
			toast.error(err.message || 'Gagal memuat data user');
		} finally {
			loading = false;
		}
	}

	// Fungsi untuk membuka modal konfirmasi hapus
	function handleDelete(userId: string) {
		userToDeleteId = userId;
		isDeleteModalOpen = true;
	}

	// Fungsi untuk mengeksekusi penghapusan user
	async function confirmDelete() {
		if (!userToDeleteId) return;

		try {
			await deleteUser(userToDeleteId);
			toast.success('User berhasil dihapus');
			loadUsers(); // Refresh data
		} catch (error) {
			const err = error as Error;
			toast.error(err.message || 'Gagal menghapus user');
		} finally {
			isDeleteModalOpen = false;
			userToDeleteId = null;
		}
	}

	function handlePageChange(page: number) {
		currentPage = page;
		// Di sini Anda bisa memanggil API lagi jika backend mendukung pagination
		// loadUsers();
	}

	// Efek untuk pencarian dinamis (Debounce)
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		searchQuery;
		const timeout = setTimeout(() => {
			loadUsers();
		}, 300); // Tunggu 300ms setelah user berhenti mengetik
		return () => clearTimeout(timeout);
	});

	onMount(() => {
		loadUsers();
	});
</script>

<!-- Snippet untuk icon pencarian di dalam Input -->
{#snippet searchIcon()}
	<Search size={18} class="text-text-muted" />
{/snippet}

<div class="space-y-6 px-2">
	<!-- Search Bar menggunakan Component Input Anda -->
	<div class="w-full">
		<Input
			placeholder="Search by name or email..."
			bind:value={searchQuery}
			leadingIcon={searchIcon}
			variant="filled"
		/>
	</div>

	<!-- Container Table -->
	<div
		class="overflow-hidden rounded-lg border border-border-base bg-white shadow-sm dark:bg-bg-secondary"
	>
		{#if loading}
			<div class="flex h-64 items-center justify-center">
				<div class="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
			</div>
		{:else}
			<!-- Table Component -->
			<UserTable users={displayedUsers} on:delete={(e) => handleDelete(e.detail.id)} />
		{/if}
	</div>

	<!-- Pagination Component (Terpisah) -->
	{#if !loading}
		<div class="-mt-3">
			<Pagination {currentPage} {totalPages} {itemsPerPage} onPageChange={handlePageChange} />
		</div>
	{/if}

	<!-- Modal Konfirmasi Hapus -->
	<Modal bind:open={isDeleteModalOpen} title="Konfirmasi Hapus" size="sm">
		<div class="py-4">
			<p class="text-sm text-text-sub">
				Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
			</p>
		</div>

		{#snippet footer()}
			<div class="flex justify-end gap-2">
				<Button variant="secondary" onclick={() => (isDeleteModalOpen = false)}>Batal</Button>
				<Button variant="destructive" onclick={confirmDelete}>Hapus</Button>
			</div>
		{/snippet}
	</Modal>
</div>
