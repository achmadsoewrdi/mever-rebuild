<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getAllUser, updateUserRole, updateUserProfile } from '$lib/api/admin.api';
	import { toast } from '$lib/stores/toast.store';
	import { Input, Button } from '$lib/components/ui';
	import { Check, X } from 'lucide-svelte';

	let userId = $page.params.id;

	let name = $state('');
	let email = $state('');
	let role = $state<'user' | 'admin' | string>('user');
	let loading = $state(true);
	let saving = $state(false);

	// Derived: Initials dari nama untuk avatar
	let initials = $derived(
		name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.substring(0, 2) || '?'
	);

	interface User {
		id: string;
		name: string;
		email: string;
		role: string;
	}

	async function loadUser() {
		loading = true;
		try {
			const response = await getAllUser();
			const users = (response.data || []) as User[];
			const user = users.find((u) => u.id === userId);

			if (user) {
				name = user.name;
				email = user.email;
				role = user.role.toLowerCase();
			} else {
				toast.error('User tidak ditemukan');
				goto('/admin/users');
			}
		} catch (error) {
			console.error('Failed to load user:', error);
			toast.error('Gagal memuat data user');
			goto('/admin/users');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadUser();
	});

	async function handleSave() {
		if (!userId) return;
		saving = true;
		try {
			await Promise.all([updateUserProfile(userId, name, email), updateUserRole(userId, role)]);

			toast.success('Berhasil menyimpan perubahan user');
			goto('/admin/users');
		} catch (error) {
			console.error('Failed to update user:', error);
			toast.error('Gagal menyimpan perubahan user');
		} finally {
			saving = false;
		}
	}

	function handleDiscard() {
		goto('/admin/users');
	}
</script>

<svelte:head>
	<title>Edit User | MEVER Admin</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-8 px-4 py-6">
	<!-- Page Header -->
	<div class="space-y-1">
		<h1 class="text-3xl font-bold tracking-tight text-text-main">Edit User</h1>
		<p class="font-medium text-text-sub">Manage user profile information and access role.</p>
	</div>

	{#if loading}
		<!-- Loading State -->
		<div class="overflow-hidden rounded-2xl border border-border-base bg-white shadow-sm dark:bg-bg-secondary">
			<div class="flex h-64 items-center justify-center">
				<div class="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
			</div>
		</div>
	{:else}
		<!-- Main Card -->
		<div class="overflow-hidden rounded-2xl border border-border-base bg-white shadow-sm transition-all duration-300 dark:bg-bg-secondary">

			<!-- Profile Header: Avatar + Name -->
			<div class="flex items-center gap-5 p-8">
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#4a0404] text-xl font-bold text-white shadow-inner">
					{initials}
				</div>
				<div>
					<h2 class="text-xl font-bold text-text-main">{name || 'Nama Pengguna'}</h2>
					<p class="text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4">
						{email || 'email@example.com'}
					</p>
				</div>
			</div>

			<hr class="border-border-base opacity-50" />

			<!-- Form Content -->
			<div class="space-y-12 p-8">

				<!-- Section: IDENTITY -->
				<section class="space-y-6">
					<div class="flex items-center gap-3">
						<span class="text-[10px] font-black tracking-[0.25em] text-text-muted uppercase">Identity</span>
						<div class="h-px flex-1 bg-border-base opacity-20"></div>
					</div>

					<div class="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
						<Input
							label="Full Name"
							bind:value={name}
							placeholder="Enter user name"
							helperText="The user's display name across MEVER."
							variant="filled"
						/>
						<Input
							label="Email Address"
							type="email"
							bind:value={email}
							placeholder="user@email.com"
							helperText="Used for login and notifications."
							variant="filled"
						/>
					</div>
				</section>

				<!-- Section: ROLE ASSIGNMENT -->
				<section class="space-y-6">
					<div class="flex items-center gap-3">
						<span class="text-[10px] font-black tracking-[0.25em] text-text-muted uppercase">Role Assignment</span>
						<div class="h-px flex-1 bg-border-base opacity-20"></div>
					</div>

					<div>
						<p class="mb-4 text-sm text-text-sub">
							Select the access level for this user. Admins have full access to the dashboard.
						</p>
						<div class="flex gap-4">
							<button
								type="button"
								onclick={() => (role = 'user')}
								class="flex-1 rounded-xl border py-4 px-6 text-sm font-semibold transition-all duration-200
									{role === 'user'
										? 'border-primary bg-primary/10 text-primary shadow-sm'
										: 'border-border-base bg-bg-surface text-text-sub hover:bg-bg-elevated hover:border-border-strong'}"
							>
								 User
								<p class="mt-1 text-xs font-normal opacity-70">Standard access, can upload & watch videos</p>
							</button>
							<button
								type="button"
								onclick={() => (role = 'admin')}
								class="flex-1 rounded-xl border py-4 px-6 text-sm font-semibold transition-all duration-200
									{role === 'admin'
										? 'border-primary bg-primary/10 text-primary shadow-sm'
										: 'border-border-base bg-bg-surface text-text-sub hover:bg-bg-elevated hover:border-border-strong'}"
							>
								Admin
								<p class="mt-1 text-xs font-normal opacity-70">Full dashboard access & user management</p>
							</button>
						</div>
					</div>
				</section>

				<!-- Footer Actions -->
				<div class="flex items-center justify-end gap-3 border-t border-border-base/50 pt-8">
					<Button
						variant="ghost"
						onclick={handleDiscard}
						disabled={saving}
						class="h-12 px-8 text-text-sub hover:text-text-main"
					>
						<X size={16} class="mr-2" />
						Discard
					</Button>

					<Button
						variant="primary"
						onclick={handleSave}
						disabled={saving}
						class="h-12 rounded-lg bg-primary px-10 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover"
					>
						{#if saving}
							<span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
							Saving...
						{:else}
							<Check size={18} class="mr-2" strokeWidth={3} />
							Save Changes
						{/if}
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>
