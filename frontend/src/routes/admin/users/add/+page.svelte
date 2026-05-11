<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { ArrowLeft, UserPlus } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { createUser } from '$lib/api/admin.api';

	let name = $state('');
	let email = $state('');
	let role = $state<'admin' | 'user'>('user');
	let password = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		try {
			await createUser({ name, email, role, password });
			toast.success('User berhasil ditambahkan');
			goto('/admin/users');
		} catch (error) {
			const err = error as Error;
			toast.error(err.message || 'Gagal menambahkan user');
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 py-8">
	<!-- Kolom Kiri: Header & Informasi -->
	<div class="lg:col-span-1 space-y-4">
		<div class="flex items-center gap-3">
			<button
				onclick={() => goto('/admin/users')}
				class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-bg-secondary transition-colors"
				title="Kembali"
			>
				<ArrowLeft size={20} />
			</button>
			<h1 class="text-2xl font-bold text-text-main">Add New User</h1>
		</div>
		<p class="text-sm text-text-sub ml-11">
			Buat akun pengguna baru untuk sistem. Semua kolom wajib diisi.
		</p>
	</div>

	<!-- Kolom Kanan: Form Card -->
	<div class="lg:col-span-2 bg-white dark:bg-bg-secondary rounded-xl border border-border-base shadow-sm p-8">
		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Name -->
			<div class="space-y-2">
				<label for="name" class="text-sm font-medium text-text-sub">Full Name</label>
				<Input id="name" placeholder="John Doe" bind:value={name} required />
			</div>

			<!-- Email -->
			<div class="space-y-2">
				<label for="email" class="text-sm font-medium text-text-sub">Email Address</label>
				<Input id="email" type="email" placeholder="john@example.com" bind:value={email} required autocomplete="off" />
			</div>

			<!-- Password -->
			<div class="space-y-2">
				<label for="password" class="text-sm font-medium text-text-sub">Password</label>
				<Input id="password" type="password" placeholder="••••••••" bind:value={password} required autocomplete="new-password" />
			</div>

			<!-- Role Selection -->
			<div class="space-y-2">
				<span class="text-sm font-medium text-text-sub block">Role</span>
				<div class="flex gap-4">
					<button
						type="button"
						onclick={() => (role = 'user')}
						class="flex-1 py-3 px-4 rounded-lg border transition-all {role === 'user' ? 'border-primary bg-rose-50 dark:bg-rose-950/20 text-primary font-bold' : 'border-border-base bg-white dark:bg-bg-secondary text-text-sub'}"
					>
						User
					</button>
					<button
						type="button"
						onclick={() => (role = 'admin')}
						class="flex-1 py-3 px-4 rounded-lg border transition-all {role === 'admin' ? 'border-primary bg-rose-50 dark:bg-rose-950/20 text-primary font-bold' : 'border-border-base bg-white dark:bg-bg-secondary text-text-sub'}"
					>
						Admin
					</button>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="flex justify-end gap-3 pt-4">
				<Button variant="secondary" onclick={() => goto('/admin/users')}>Cancel</Button>
				<Button variant="primary" type="submit" disabled={loading}>
					{#if loading}
						<span class="animate-spin mr-2">⏳</span>
					{/if}
					<UserPlus size={16} class="mr-2" />
					Add User
				</Button>
			</div>
		</form>
	</div>
</div>
