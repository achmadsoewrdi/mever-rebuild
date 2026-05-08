<script lang="ts">
	import { onMount } from 'svelte';
	import { Input, Button } from '$lib/components/ui';
	import meverLogo from '$lib/assets/image.png'; // Logo yang kamu tentukan

	// Props
	let { otpauthUrl = '', onVerify } = $props<{
		otpauthUrl: string;
		onVerify: (token: string) => Promise<void>;
	}>();

	let otpToken = $state('');
	let isVerifying = $state(false);
	let qrContainer = $state<HTMLDivElement | null>(null);

	onMount(async () => {
		// Import dinamis karena library ini butuh objek window
		const QRCodeStyling = (await import('qr-code-styling')).default;

		if (qrContainer) {
			const qrCode = new QRCodeStyling({
				width: 200,
				height: 200,
				type: 'svg',
				data: otpauthUrl,
				image: meverLogo,
				dotsOptions: {
					color: '#1e293b', // Slate 800
					type: 'dots' // <--- BENTUK DOT
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
					color: '#FF1744' // Warna Primary Mever
				},
				cornersDotOptions: {
					type: 'dot',
					color: '#FF1744'
				}
			});

			qrCode.append(qrContainer);
		}
	});

	async function handleSubmit() {
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

	<div class="space-y-4">
		<p class="text-center text-xs text-slate-500">
			Masukkan 6 digit kode dari aplikasi setelah scan untuk mengonfirmasi.
		</p>
		<Input
			type="text"
			bind:value={otpToken}
			placeholder="000000"
			maxlength={6}
			class="text-center text-lg font-bold tracking-[0.25em]"
		/>

		<Button
			variant="primary"
			class="h-11 w-full"
			onclick={handleSubmit}
			disabled={isVerifying || otpToken.length < 6}
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
