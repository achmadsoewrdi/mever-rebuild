<script lang="ts">
    import { Check, X} from 'lucide-svelte';

    import Badge from '$lib/components/ui/Badge.svelte';
    import Button from '$lib/components/ui/Button.svelte';
    import Modal from '$lib/components/ui/Modal.svelte';
    import Pagination from '$lib/components/ui/Pagination.svelte';
    import { toast } from '$lib/stores/toast.store';
    import {getAccountRequests, approveAccountRequest, rejectAccountRequest} from '$lib/api/admin.api';
    import {onMount} from 'svelte';
    import type {AccountRequestParams, AccountRequest} from '$lib/types/api.types';

    // state untuk menyimpan data dari api
    let requests = $state<AccountRequest[]>([])
    let isLoading = $state(true);

    // State untuk pagination
    let currentPage = $state(1);
    let totalPages = $state(1);
    let itemsPerPage = $state(10);

    let activeTab = $state('All Request');
    const tabs = ['All Request', 'Pending Approval', 'Approved', 'Rejected'];


    async function fetchRequest(){
        isLoading = true;
        try{
            let statusFilter: AccountRequestParams['status'];
            if(activeTab === 'Pending Approval') statusFilter = 'pending';
            else if(activeTab === 'Approved') statusFilter = 'approved';
            else if(activeTab === 'Rejected') statusFilter = 'rejected';

            const params: AccountRequestParams = {
                page: currentPage,
                limit: itemsPerPage
            };
            if(statusFilter) params.status = statusFilter;

            const response = await getAccountRequests(params);
            
            // Ekstrak data dan metadata pagination
            requests = (response.data?.data || response.data || []) as AccountRequest[];
            const meta = response.data?.meta;
            if (meta) {
                currentPage = meta.page;
                totalPages = meta.totalPages;
                itemsPerPage = meta.limit;
            }
        }catch(error){
            console.error('gagal mengambil data account Request:', error);
        }finally{
            isLoading = false;
        }
    }

    onMount(() => {
        fetchRequest();
    });

    function handleTabChange(tab:string){
        activeTab = tab;
        currentPage = 1; // Reset halaman saat pindah tab
        fetchRequest();
    }

    function handlePageChange(newPage: number) {
        currentPage = newPage;
        fetchRequest();
    }

    let confirmModalOpen = $state(false);
    let confirmModalType = $state<'approve' | 'reject' | null>(null);
    let targetRequestId = $state<string | null>(null);

    function confirmApprove(id: string) {
        targetRequestId = id;
        confirmModalType = 'approve';
        confirmModalOpen = true;
    }

    function confirmReject(id: string) {
        targetRequestId = id;
        confirmModalType = 'reject';
        confirmModalOpen = true;
    }

    async function executeConfirm() {
        if (!targetRequestId || !confirmModalType) return;
        
        const id = targetRequestId;
        const type = confirmModalType;
        confirmModalOpen = false;

        try {
            if (type === 'approve') {
                await approveAccountRequest(id);
                toast.success('Berhasil menyetujui akun ini');
            } else {
                await rejectAccountRequest(id);
                toast.success('Berhasil menolak akun ini');
            }
            fetchRequest();
        } catch (error) {
            console.error(`Gagal melakukan ${type}:`, error);
            toast.error(`Gagal ${type === 'approve' ? 'menyetujui' : 'menolak'} akun ini`);
        }
    }
</script>

<div class="flex flex-col gap-6 p-2">
	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-text-main">Account Requests</h1>
	</div>

	<!-- Tabs -->
	<div class="flex items-center gap-6 border-b border-border-base">
		{#each tabs as tab (tab)}
			<button
				type="button"
				onclick={() => handleTabChange(tab)}
				class="relative pb-3 text-sm font-medium transition-colors {activeTab === tab
					? 'text-primary'
					: 'text-text-muted hover:text-text-main'}"
			>
				{tab}
				{#if activeTab === tab}
					<div class="absolute bottom-0 left-0 h-0.5 w-full bg-primary"></div>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Table -->
	<div
		class="overflow-x-auto rounded-xl border border-border-base bg-bg-secondary shadow-sm"
	>
		<table class="w-full text-left text-sm text-text-sub">
			<thead
				class="bg-bg-surface text-xs font-semibold uppercase text-text-muted border-b border-border-base"
			>
				<tr>
					<th class="px-6 py-4">Name</th>
					<th class="px-6 py-4">Email</th>
					<th class="px-6 py-4">Department</th>
					<th class="px-6 py-4">Request Status</th>
					<th class="px-6 py-4">Request Date</th>
					<th class="px-6 py-4 text-right">Action</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-border-base">
				{#if isLoading}
					<tr>
						<td colspan="6" class="px-6 py-8 text-center text-text-muted">
							Loading data...
						</td>
					</tr>
				{:else if requests.length === 0}
					<tr>
						<td colspan="6" class="px-6 py-8 text-center text-text-muted">
							Tidak ada data account requests.
						</td>
					</tr>
				{:else}
					{#each requests as request (request.id)}
						<tr class="transition-colors hover:bg-bg-surface">
							<td class="px-6 py-4 font-medium text-text-main">{request.name}</td>
							<td class="px-6 py-4">{request.email}</td>
							<td class="px-6 py-4">{request.department}</td>
							<td class="px-6 py-4">
								{#if request.status === 'pending'}
									<Badge
										color="default"
										label="Pending Approval"
										class="border-border-base bg-bg-surface text-text-sub"
									/>
								{:else if request.status === 'approved'}
									<Badge
										color="green"
										label="Approved"
										class="border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
									/>
								{:else if request.status === 'rejected'}
									<Badge
										color="red"
										label="Rejected"
										class="border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
									/>
								{/if}
							</td>
							<td class="px-6 py-4">
								{request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
							</td>
							
							<td class="px-6 py-4 text-right">
								{#if request.status === 'pending'}
									<div class="flex items-center justify-end gap-2 font-medium">
										<Button
											variant="ghost"
											size="sm"
											class="gap-1.5 border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 focus:ring-green-500/50 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
											onclick={() => confirmApprove(request.id)}
										>
											<Check size={14} strokeWidth={2.5} />
											Approve
										</Button>
										<Button
											variant="ghost"
											size="sm"
											class="gap-1.5 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500/50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
											onclick={() => confirmReject(request.id)}
										>
											<X size={14} strokeWidth={2.5} />
											Reject
										</Button>
									</div>
								{:else}
									<span class="text-text-muted">-</span>
								{/if}
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	<div class="mt-4">
		<Pagination
			currentPage={currentPage}
			totalPages={totalPages}
			itemsPerPage={itemsPerPage}
			onPageChange={handlePageChange}
		/>
	</div>
</div>

<Modal
	bind:open={confirmModalOpen}
	title={confirmModalType === 'approve' ? 'Konfirmasi Approve' : 'Konfirmasi Reject'}
	size="sm"
>
	<p>
		Apakah Anda yakin ingin {confirmModalType === 'approve' ? 'menyetujui' : 'menolak'} permintaan pembuatan akun ini?
	</p>

	{#snippet footer()}
		<div class="flex justify-end gap-3">
			<Button variant="ghost" onclick={() => (confirmModalOpen = false)}>
				Batal
			</Button>
			<Button
				variant={confirmModalType === 'approve' ? 'primary' : 'destructive'}
				onclick={executeConfirm}
			>
				Ya, {confirmModalType === 'approve' ? 'Setujui' : 'Tolak'}
			</Button>
		</div>
	{/snippet}
</Modal>
