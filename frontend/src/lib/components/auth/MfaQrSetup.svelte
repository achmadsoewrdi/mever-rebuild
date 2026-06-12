<script lang="ts">
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	import { Button } from '$lib/components/ui';
	import meverLogo from '$lib/assets/image.png';

	// Props
	let { otpauthUrl = '', onVerify } = $props<{
		otpauthUrl: string;
		onVerify: (token: string) => Promise<void>;
	}>();

	let isVerifying = $state(false);
	let qrContainer = $state<HTMLDivElement | null>(null);

	// 6 digit OTP boxes
	let digits = $state<string[]>(['', '', '', '', '', '']);
	let inputRefs = $state<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);

	let otpToken = $derived(digits.join(''));
	let isComplete = $derived(otpToken.length === 6 && digits.every((d) => d !== ''));

	onMount(async () => {
		const QRCodeStyling = (await import('qr-code-styling')).default;

		if (qrContainer) {
			const qrCode = new QRCodeStyling({
				width: 200,
				height: 200,
				type: 'svg',
				data: otpauthUrl,
				image: meverLogo,
				dotsOptions: {
					color: '#1e293b',
					type: 'dots'
				},
				backgroundOptions: {
					color: '#ffffff'
				},
				imageOptions: {
					crossOrigin: 'anonymous',
					margin: 6,
					imageSize: 0.35
				},
				cornersSquareOptions: {
					type: 'extra-rounded',
					color: '#FF1744'
				},
				cornersDotOptions: {
					type: 'dot',
					color: '#FF1744'
				}
			});

			qrCode.append(qrContainer);
		}
	});

	function handleInput(index: number, event: Event) {
		const target = event.target as HTMLInputElement;
		const raw = target.value.replace(/\D/g, '');

		if (!raw) {
			digits[index] = '';
			return;
		}

		digits[index] = raw[0];

		if (index < 5) {
			inputRefs[index + 1]?.focus();
		}
	}

	function handleKeydown(index: number, event: KeyboardEvent) {
		if (event.key === 'Backspace') {
			if (digits[index] !== '') {
				digits[index] = '';
			} else if (index > 0) {
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

		await tick();
		const focusIdx = Math.min(paste.length - 1, 5);
		inputRefs[focusIdx]?.focus();
	}

	async function handleSubmit() {
		if (!isComplete) return;
		isVerifying = true;
		try {
			await onVerify(otpToken);
		} finally {
			isVerifying = false;
		}
	}
</script>

<div class="space-y-6">
	<div class="space-y-2 text-center">
		<h2 class="text-xl font-bold text-slate-900 dark:text-white">Setup Keamanan Admin</h2>
		<p class="text-sm text-slate-500 dark:text-text-sub">
			Sebagai Admin, Anda wajib mengaktifkan Autentikasi 2 Langkah. Scan QR Code di bawah ini.
		</p>
	</div>

	<!-- Container QR Code -->
	<div class="flex justify-center">
		<div
			bind:this={qrContainer}
			class="overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
		></div>
	</div>

	<div class="space-y-5">
		<p class="text-center text-xs text-slate-500">
			Masukkan 6 digit kode dari aplikasi setelah scan untuk mengonfirmasi.
		</p>

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
					disabled={isVerifying}
					oninput={(e) => handleInput(i, e)}
					onkeydown={(e) => handleKeydown(i, e)}
					class="h-14 w-12 rounded-xl border-2 text-center text-xl font-bold tracking-tight transition-all duration-200 outline-none
						bg-white dark:bg-bg-elevated
						{digit !== ''
							? 'border-primary text-primary shadow-sm shadow-primary/20'
							: 'border-border-base text-text-main'}
						focus:border-primary focus:shadow-md focus:shadow-primary/20 hover:border-border-strong
						disabled:cursor-not-allowed disabled:opacity-50"
				/>
			{/each}
		</div>

		<p class="text-center text-xs text-text-muted">
			Tip: Anda bisa paste kode OTP langsung ke kolom di atas
		</p>

		<Button
			variant="primary"
			class="h-11 w-full"
			onclick={handleSubmit}
			disabled={isVerifying || !isComplete}
		>
			{#if isVerifying}
				<span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
				></span>
				Memverifikasi...
			{:else}
				Aktifkan & Lanjut ke Dashboard
			{/if}
		</Button>
	</div>
</div>
