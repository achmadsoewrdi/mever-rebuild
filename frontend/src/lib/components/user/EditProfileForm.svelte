<script lang="ts">
	import { Input, Button } from '$lib/components/ui';
	import { updateProfile, changePassword, type UserProfile } from '$lib/api/users.api';
	import { toast } from '$lib/stores/toast.store';
	import { Check, X } from 'lucide-svelte';
	import { untrack } from 'svelte';
	import { profileState } from '$lib/stores/profile.svelte';
	import { goto } from '$app/navigation';

	// Props: menerima data user dari halaman induk
	let { user }: { user: UserProfile } = $props();

	// State untuk Form Identitas
	// Gunakan $state.snapshot() untuk mengambil nilai awal tanpa memicu warning
	let name = $state(untrack(() => user.name));
	let email = $state(untrack(() => user.email));

	// State untuk tampilan Card Header (agar tidak memutasi prop user langsung)
	let displayName = $state(untrack(() => user.name));
	let displayEmail = $state(untrack(() => user.email));

	// State untuk Password
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	let isLoading = $state(false);

	// Derived state untuk menghitung inisial (misal: ISR Guest -> IG)
	let initials = $derived(
		displayName
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.substring(0, 2)
	);

	/**
	 * Logika Simpan Perubahan
	 */
	async function handleSave() {
		isLoading = true;
		try {
			// 1. Update Profil (hanya dikirim jika ada perubahan nama/email)
			if (name !== user.name || email !== user.email) {
				await updateProfile({ name, email });

				// Update state global agar Navbar langsung berubah tanpa refresh
				profileState.name = name;

				// Update state tampilan lokal
				displayName = name;
				displayEmail = email;

				toast.success('Identity info updated successfully');
			}

			// 2. Update Password (hanya jika field password baru diisi)
			if (newPassword || confirmPassword) {
				if (!currentPassword) throw new Error('Please enter your current password to make changes');
				if (newPassword !== confirmPassword) throw new Error('New passwords do not match');
				if (newPassword.length < 8) throw new Error('New password must be at least 8 characters');

				await changePassword({ oldPassword: currentPassword, newPassword });
				toast.success('Password updated successfully');

				// Reset field password setelah berhasil
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
			}
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Something went wrong';
			toast.error(message);
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Logika Reset (Discard)
	 */
	function handleDiscard() {
		toast.info('Changes discarded');
		goto('/dashboard');
	}
</script>

<div class="mx-auto max-w-4xl space-y-8 px-4 py-10">
	<!-- Header Dashboard -->
	<div class="space-y-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-bold tracking-tight text-text-main">Account Settings</h1>
			<p class="font-medium text-text-sub">Manage your personal info and credentials.</p>
		</div>
	</div>

	<!-- Container Card Utama -->
	<div
		class="overflow-hidden rounded-2xl border border-border-base bg-bg-elevated shadow-sm transition-all duration-300"
	>
		<!-- Profile Info Header (Avatar & Nama) -->
		<div class="flex items-center gap-5 p-8">
			<!-- Bulatan Inisial (Mirip desain gambar) -->
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full bg-[#4a0404] text-xl font-bold text-white shadow-inner"
			>
				{initials}
			</div>
			<div>
				<h2 class="text-xl font-bold text-text-main">{displayName}</h2>
				<p
					class="text-sm font-medium text-primary underline decoration-primary/30 underline-offset-4"
				>
					{displayEmail}
				</p>
			</div>
		</div>

		<hr class="border-border-base opacity-50" />

		<!-- Konten Form -->
		<div class="space-y-12 p-8">
			<!-- Bagian: IDENTITY -->
			<section class="space-y-6">
				<div class="flex items-center gap-3">
					<span class="text-[10px] font-black tracking-[0.25em] text-text-muted uppercase"
						>Identity</span
					>
					<div class="h-px flex-1 bg-border-base opacity-20"></div>
				</div>

				<div class="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
					<Input
						label="Full Name"
						bind:value={name}
						placeholder="Enter your name"
						helperText="This is your display name across MEVER."
						variant="filled"
					/>
					<Input
						label="Email Address"
						type="email"
						bind:value={email}
						placeholder="your@email.com"
						helperText="Used for login and notifications."
						variant="filled"
					/>
				</div>
			</section>

			<!-- Bagian: CHANGE PASSWORD -->
			<section class="space-y-6">
				<div class="flex items-center gap-3">
					<span class="text-[10px] font-black tracking-[0.25em] text-text-muted uppercase"
						>Change Password</span
					>
					<div class="h-px flex-1 bg-border-base opacity-20"></div>
				</div>

				<!-- Field Password Saat Ini (Ditambahkan untuk keamanan & API Backend) -->
				<div class="max-w-md pb-2">
					<Input
						label="Current Password"
						type="password"
						bind:value={currentPassword}
						placeholder="••••••••"
						helperText="Verification required to set a new password."
						variant="filled"
					/>
				</div>

				<div class="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
					<Input
						label="New Password"
						type="password"
						bind:value={newPassword}
						placeholder="Enter new password"
						helperText="Minimum 8 characters."
						variant="filled"
					/>
					<Input
						label="Confirm New Password"
						type="password"
						bind:value={confirmPassword}
						placeholder="Re-enter new password"
						helperText="Must match the new password above."
						variant="filled"
					/>
				</div>
			</section>

			<!-- Footer Tombol Aksi -->
			<div class="flex items-center justify-end gap-3 border-t border-border-base/50 pt-8">
				<Button
					variant="ghost"
					onclick={handleDiscard}
					disabled={isLoading}
					class="h-12 px-8 text-text-sub hover:text-text-main"
				>
					<X size={16} class="mr-2" />
					Discard
				</Button>

				<Button
					variant="primary"
					onclick={handleSave}
					disabled={isLoading}
					class="h-12 rounded-lg bg-primary px-10 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover"
				>
					{#if isLoading}
						<span
							class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
						></span>
						Updating...
					{:else}
						<Check size={18} class="mr-2" strokeWidth={3} />
						Save Changes
					{/if}
				</Button>
			</div>
		</div>
	</div>
</div>
