<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { tick } from 'svelte';

	// Props
	let { onVerify, onBack } = $props<{
		onVerify: (token: string) => Promise<void>;
		onBack: () => void;
	}>();

	// 6 digit boxes
	let digits = $state<string[]>(['', '', '', '', '', '']);
	let inputRefs = $state<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);
	let isVerifying = $state(false);
	let errorMessage = $state('');

	// Gabungkan semua digit jadi 1 string OTP
	let otpToken = $derived(digits.join(''));
	let isComplete = $derived(otpToken.length === 6 && digits.every((d) => d !== ''));
	let isLocked = $derived(errorMessage.includes('Locked'));

	async function handleSubmit() {
		if (!isComplete || isLocked) return;
		isVerifying = true;
		errorMessage = '';

		try {
			await onVerify(otpToken);
		} catch (error: unknown) {
			errorMessage = error instanceof Error ? error.message : 'Kode MFA salah atau kedaluwarsa';
			// Reset semua box jika error, dan fokus ke box pertama
			digits = ['', '', '', '', '', ''];
			await tick();
			inputRefs[0]?.focus();
		} finally {
			isVerifying = false;
		}
	}

	function handleInput(index: number, event: Event) {
		const target = event.target as HTMLInputElement;
		const raw = target.value.replace(/\D/g, ''); // hanya angka

		if (!raw) {
			digits[index] = '';
			return;
		}

		// Ambil hanya 1 karakter pertama
		digits[index] = raw[0];

		// Pindah ke box berikutnya
		if (index < 5) {
			inputRefs[index + 1]?.focus();
		}
	}

	function handleKeydown(index: number, event: KeyboardEvent) {
		if (event.key === 'Backspace') {
			if (digits[index] !== '') {
				// Hapus isi box ini
				digits[index] = '';
			} else if (index > 0) {
				// Mundur ke box sebelumnya
				digits[index - 1] = '';
				inputRefs[index - 1]?.focus();
			}
			event.preventDefault();
		} else if (event.key === 'ArrowLeft' && index > 0) {
			inputRefs[index - 1]?.focus();
		} else if (event.key === 'ArrowRight' && index < 5) {
			inputRefs[index + 1]?.focus();
		} else if (event.key === 'Enter' && isComplete) {
			handleSubmit();
		}
	}

	async function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const paste = event.clipboardData?.getData('text').replace(/\D/g, '').substring(0, 6) ?? '';
		if (!paste) return;

		for (let i = 0; i < 6; i++) {
			digits[i] = paste[i] ?? '';
		}

		// Fokus ke box terakhir yang terisi (atau box ke-6)
		await tick();
		const focusIdx = Math.min(paste.length - 1, 5);
		inputRefs[focusIdx]?.focus();
	}
</script>

<div class="space-y-6">
	<div class="space-y-2 text-center">
		<h2 class="text-xl font-bold text-slate-900 dark:text-white">Verifikasi 2 Langkah</h2>
		<p class="text-sm text-slate-500 dark:text-text-sub">
			Masukkan 6 digit kode dari aplikasi authenticator Anda untuk melanjutkan.
		</p>
	</div>

	<div class="space-y-5">
		<!-- 6 OTP Input Boxes -->
		<div class="flex items-center justify-center gap-3" onpaste={handlePaste}>
			{#each digits as digit, i (i)}
				<input
					bind:this={inputRefs[i]}
					type="text"
					inputmode="numeric"
					pattern="[0-9]"
					maxlength={1}
					value={digit}
					disabled={isVerifying || isLocked}
					oninput={(e) => handleInput(i, e)}
					onkeydown={(e) => handleKeydown(i, e)}
					class="h-14 w-12 rounded-xl border-2 text-center text-xl font-bold tracking-tight transition-all duration-200 outline-none
						bg-white dark:bg-bg-elevated
						{digit !== ''
							? 'border-primary text-primary shadow-sm shadow-primary/20'
							: 'border-border-base text-text-main'}
						{isLocked
							? 'opacity-50 cursor-not-allowed'
							: 'focus:border-primary focus:shadow-md focus:shadow-primary/20 hover:border-border-strong'}
						disabled:cursor-not-allowed disabled:opacity-50"
				/>
			{/each}
		</div>

		<!-- Separator hint -->
		{#if !errorMessage}
			<p class="text-center text-xs text-text-muted">
				Tip: Anda bisa paste kode OTP langsung ke kolom di atas
			</p>
		{/if}

		<!-- Error Message -->
		{#if errorMessage}
			<div
				class="rounded-lg p-3 text-center text-xs font-medium {isLocked
					? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
					: 'bg-primary-muted text-primary'}"
			>
				{errorMessage}
			</div>
		{/if}

		<!-- Submit Button -->
		<Button
			variant="primary"
			class="h-11 w-full"
			onclick={handleSubmit}
			disabled={isVerifying || !isComplete || isLocked}
		>
			{#if isVerifying}
				<span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
				></span>
				Memverifikasi...
			{:else if isLocked}
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
