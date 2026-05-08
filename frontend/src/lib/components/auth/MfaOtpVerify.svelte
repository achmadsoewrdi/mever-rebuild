<script lang="ts">
	import { Input, Button } from '$lib/components/ui';

	// Props
	let { onVerify, onBack } = $props<{
		onVerify: (token: string) => Promise<void>;
		onBack: () => void;
	}>();

	let otpToken = $state('');
	let isVerifying = $state(false);

	// State Tambahan untuk Error Prevention
	let errorMessage = $state('');

	async function handleSubmit() {
		isVerifying = true;
		errorMessage = ''; // Reset error setiap kali mencoba

		try {
			await onVerify(otpToken);
		} catch (error: unknown) {
			// Tangkap pesan error dari backend
			errorMessage = error instanceof Error ? error.message : 'Kode MFA salah atau kedaluwarsa';
		} finally {
			isVerifying = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="space-y-2 text-center">
		<h2 class="text-xl font-bold text-slate-900 dark:text-white">Verifikasi 2 Langkah</h2>
		<p class="text-sm text-slate-500 dark:text-text-sub">
			Masukkan 6 digit kode dari aplikasi authenticator Anda untuk melanjutkan.
		</p>
	</div>

	<div class="space-y-4">
		<!-- Input akan di-disable jika terdeteksi akun terkunci -->
		<Input
			type="text"
			bind:value={otpToken}
			placeholder="000000"
			maxlength={6}
			disabled={isVerifying || errorMessage.includes('Locked')}
			class="text-center text-lg font-bold tracking-[0.25em]"
		/>

		<!-- TAMPILAN ERROR PREVENTION -->
		{#if errorMessage}
			<div
				class="rounded-lg p-3 text-center text-xs font-medium {errorMessage.includes('Locked')
					? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
					: 'bg-primary-muted text-primary'}"
			>
				{errorMessage}
			</div>
		{/if}

		<Button
			variant="primary"
			class="h-11 w-full"
			onclick={handleSubmit}
			disabled={isVerifying || otpToken.length < 6 || errorMessage.includes('Locked')}
		>
			{#if isVerifying}
				<span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
				></span>
				Memverifikasi...
			{:else if errorMessage.includes('Locked')}
				Akun Terkunci
			{:else}
				Verifikasi
			{/if}
		</Button>

		<button
			class="w-full text-center text-sm text-slate-500 transition-colors hover:text-primary"
			onclick={onBack}
		>
			Kembali ke Login
		</button>
	</div>
</div>
