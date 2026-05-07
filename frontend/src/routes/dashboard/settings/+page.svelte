<script lang="ts">
	import { onMount } from 'svelte';
	import { getMe, type UserProfile } from '$lib/api/users.api';
	import EditProfileForm from '$lib/components/user/EditProfileForm.svelte';
	import { Skeleton } from '$lib/components/ui';

	let user = $state<UserProfile | null>(null);
	let isLoading = $state(true);

	onMount(async () => {
		try {
			const res = await getMe();
			user = res.data ?? null;
		} catch (error) {
			console.error('Gagal memuat profil:', error);
		} finally {
			isLoading = false;
		}
	});
</script>

<svelte:head>
	<title>Account Settings | MEVER</title>
</svelte:head>

<div class="min-h-screen bg-bg-primary py-4">
	{#if isLoading}
		<!-- Loading State -->
		<div class="mx-auto max-w-4xl space-y-6 p-8">
			<Skeleton class="h-10 w-64" />
			<Skeleton class="h-[500px] w-full rounded-2xl" />
		</div>
	{:else if user}
		<EditProfileForm {user} />
	{:else}
		<div class="py-20 text-center">
			<p class="text-lg font-medium text-text-sub">
				Gagal memuat data profil. Silakan refresh halaman.
			</p>
		</div>
	{/if}
</div>
