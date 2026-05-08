<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import MfaQrSetup from '$lib/components/auth/MfaQrSetup.svelte';
	import MfaOtpVerify from '$lib/components/auth/MfaOtpVerify.svelte';
	import { loginApi, verifyMfaLoginApi, enableMfaApi } from '$lib/api/auth.api';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { LoginInput } from '$lib/utils/validator';
	import meverLogo from '$lib/assets/image.png';

	// State untuk mengontrol flow tampilan
	let flow = $state<'login' | 'mfa_setup' | 'mfa_verify'>('login');
	let userId = $state('');
	let otpauthUrl = $state('');
	let rememberMeState = $state(false);

	async function handleLoginSubmit(data: LoginInput, rememberMe: boolean) {
		rememberMeState = rememberMe;
		try {
			const res = await loginApi(data);
			const userData = res.data;

			// 1. Jika User Biasa (Langsung dapat token, tanpa ribet MFA)
			if (userData?.token && !userData?.mfaRequired && !userData?.mfaSetupRequired) {
				completeLogin(userData.token, rememberMe);
				return;
			}

			// 2. Jika Admin & Perlu Setup MFA Pertama Kali
			if (userData?.mfaSetupRequired) {
				userId = userData.userId ?? '';
				otpauthUrl = userData.otpauthUrl ?? ''; // URL untuk QR Code
				flow = 'mfa_setup';
				toast.info('Admin wajib mengaktifkan MFA');
				return;
			}

			// 3. Jika Admin & Sudah Setup (Tinggal Verifikasi)
			if (userData?.mfaRequired) {
				userId = userData.userId ?? '';
				flow = 'mfa_verify';
				toast.info('Masukkan kode MFA Anda');
				return;
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Gagal Login';
			toast.error(errorMessage);
		}
	}

	// Handler untuk Aktivasi Pertama Kali
	async function handleMfaSetupVerify(token: string) {
		try {
			const res = await enableMfaApi({ userId, token }); // Aktifkan di backend
			const fullToken = res.data?.token;

			toast.success('MFA Berhasil diaktifkan!');

			if (fullToken) {
				completeLogin(fullToken, rememberMeState);
			} else {
				goto('/dashboard');
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Kode verifikasi salah';
			toast.error(message);
		}
	}

	// Handler untuk Verifikasi Login Rutin
	async function handleMfaLoginVerify(token: string) {
		try {
			const res = await verifyMfaLoginApi({ userId, token });
			const fullToken = res.data?.token;

			if (fullToken) {
				completeLogin(fullToken, rememberMeState);
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Kode MFA salah atau kedaluwarsa';
			toast.error(message);
			throw error; // Melemparkan error agar ditangkap komponen UI
		}
	}

	function completeLogin(token: string, rememberMe: boolean) {
		const maxAge = rememberMe ? 2592000 : 86400;
		document.cookie = `auth_token=${token}; path=/; max-age=${maxAge}`;
		toast.success('Login Berhasil');
		goto('/dashboard');
	}
</script>

<svelte:head>
	<title>Login | MEVER</title>
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-bg-primary">
	<!-- Logo MEVER -->
	<div class="mb-8 flex flex-col items-center">
		<img src={meverLogo} alt="MEVER Logo" class="h-16 w-auto" />
		<p class="mt-4 text-xl font-medium tracking-[4px] text-slate-800 uppercase dark:text-slate-200">
			Video Platform Testing
		</p>
	</div>

	<div
		class="w-full max-w-md rounded-2xl border border-slate-200 p-8 shadow-xl dark:border-bg-surface dark:bg-bg-secondary"
	>
		{#if flow === 'login'}
			<LoginForm onSubmit={handleLoginSubmit} />
		{:else if flow === 'mfa_setup'}
			<MfaQrSetup {otpauthUrl} onVerify={handleMfaSetupVerify} />
		{:else if flow === 'mfa_verify'}
			<MfaOtpVerify onVerify={handleMfaLoginVerify} onBack={() => (flow = 'login')} />
		{/if}
	</div>
</div>
