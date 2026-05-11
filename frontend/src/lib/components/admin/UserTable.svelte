<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { MoreVertical, Pencil, Trash2 } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	const dispatch = createEventDispatcher();

	interface Props {
		users: Array<{
			id: string;
			name: string;
			email: string;
			role: string;
			createdAt: string;
		}>;
	}

	let { users = [] }: Props = $props();

	let openDropdownId = $state<string | null>(null);

	function toggleDropdown(userId: string) {
		if (openDropdownId === userId) {
			openDropdownId = null;
		} else {
			openDropdownId = userId;
		}
	}

	function handleEdit(userId: string) {
		openDropdownId = null;
		dispatch('edit', { id: userId });
	}

	function handleDeleteAction(userId: string) {
		openDropdownId = null;
		triggerDelete(userId);
	}

	function triggerDelete(userId: string) {
		dispatch('delete', { id: userId });
	}

	function formatDate(dateString: string) {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('id-ID', {
				day: '2-digit',
				month: 'short',
				year: 'numeric'
			});
		} catch {
			return dateString;
		}
	}

	function getRoleColor(role: string): 'red' | 'green' | 'default' {
		if (role.toLowerCase() === 'admin') return 'red';
		if (role.toLowerCase() === 'user') return 'green';
		return 'default';
	}
</script>

<div
	class="overflow-hidden rounded-lg border border-border-base bg-white shadow-sm transition-all duration-300 dark:bg-bg-secondary"
>
	<!-- Header Section -->
	<div class="flex items-center justify-between border-b border-border-base p-6">
		<div class="flex items-center gap-2">
			<h2 class="text-base font-bold tracking-wider text-text-main uppercase">User List</h2>
			<span class="text-sm text-text-muted">({users.length} items)</span>
		</div>

		<Button variant="primary" size="default" onclick={() => goto('/admin/users/add')}>Add User</Button>
	</div>

	<!-- Table Section -->
	<div class="overflow-x-auto">
		<table class="w-full border-collapse text-left">
			<thead>
				<tr
					class="border-l-4 border-[#FFF0F2] bg-[#FFF0F2] text-xs font-bold tracking-wider text-text-sub uppercase dark:border-zinc-800 dark:bg-zinc-800 dark:text-slate-200"
				>
					<th class="px-6 py-5">Name</th>
					<th class="px-6 py-5">Email</th>
					<th class="px-6 py-5">Role</th>
					<th class="px-6 py-5">Created At</th>
					<th class="px-6 py-5 text-right">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-border-base">
				{#each users as user, i (user.id)}
					<tr
						class="border-l-4 border-transparent transition-colors duration-150 hover:border-l-primary hover:bg-slate-50 dark:hover:bg-bg-surface"
					>
						<!-- Menggunakan py-4 bawaan Tailwind -->
						<td class="px-6 py-4 text-sm font-medium text-text-main">{user.name}</td>
						<td class="px-6 py-4 font-mono text-sm text-text-sub">{user.email}</td>
						<td class="px-6 py-4 text-sm">
							<Badge label={user.role} color={getRoleColor(user.role)} />
						</td>
						<td class="px-6 py-4 text-sm font-bold text-text-main">{formatDate(user.createdAt)}</td>
						<td class="relative px-6 py-4 text-right">
							<!-- Tombol Pemicu Dropdown -->
							<Button
								variant="ghost"
								size="icon"
								onclick={() => toggleDropdown(user.id)}
								title="Menu Aksi"
							>
								<MoreVertical size={20} />
							</Button>

							<!-- Dropdown Menu -->
							{#if openDropdownId === user.id}
								<div
									class="absolute right-6 z-10 {i === users.length - 1 ? 'bottom-full mb-1' : 'mt-1'} w-40 rounded-md border border-border-base bg-white py-1 shadow-lg dark:bg-bg-elevated"
								>
									<!-- Tombol Edit -->
									<button
										onclick={() => handleEdit(user.id)}
										class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-text-main transition-colors hover:bg-slate-50 dark:hover:bg-bg-surface"
									>
										<Pencil size={14} class="text-text-sub" />
										Edit User
									</button>

									<!-- Tombol Delete -->
									<button
										onclick={() => handleDeleteAction(user.id)}
										class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-rose-50 dark:text-red-500 dark:hover:bg-bg-surface"
									>
										<Trash2 size={14} />
										Delete User
									</button>
								</div>
							{/if}
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="5" class="px-6 py-10 text-center text-text-muted text-sm">
							Tidak ada data user.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
