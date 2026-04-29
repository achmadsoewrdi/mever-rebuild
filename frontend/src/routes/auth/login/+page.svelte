<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import { loginApi } from '$lib/api/auth.api';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { LoginInput } from '$lib/utils/validator';
	import meverLogo from '$lib/assets/image.png';

	async function handleLoginSubmit(data: LoginInput, rememberMe: boolean) {
		try {
			const res = await loginApi(data);
			const token = res.data?.token;

			if (token) {
				const maxAge = rememberMe ? 2592000 : 86400;
				document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}`;
				toast.success('Login Berhasil');
				goto('/dashboard');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Gagal Login';
			toast.error(errorMessage);
		}
	}
</script>

<!-- panggil komponen login -->
<div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-bg-primary">
	<!-- Logo MEVER di luar kotak form -->
	<div class="mb-8 flex flex-col items-center">
		<img src={meverLogo} alt="MEVER Logo" class="h-16 w-auto" />
		<p class="mt-4 text-xl font-medium tracking-[4px] uppercase text-slate-800 dark:text-slate-200">Video Platform Testing</p>
	</div>

	<div
		class="w-full max-w-md rounded-2xl border border-slate-200 p-8 shadow-xl dark:border-bg-surface dark:bg-bg-secondary"
	>
		<LoginForm onSubmit={handleLoginSubmit} />
	</div>
</div>
