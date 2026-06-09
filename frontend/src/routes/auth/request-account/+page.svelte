<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { User, Mail, Building2, Send, ArrowLeft } from 'lucide-svelte';
	import { requestAccountApi } from '$lib/api/auth.api';

	let formState = $state({
		name: '',
		email: '',
		department: ''
	});

	let isLoading = $state(false);
	let errorMessage = $state('');
	let showSuccessModal = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;
		errorMessage = '';

		try {
			await requestAccountApi(formState);
			showSuccessModal = true;
			formState = { name: '', email: '', department: '' };
		} catch (error) {
			if (error instanceof Error) {
				errorMessage = error.message;
			} else {
				errorMessage = String(error);
			}
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Request Account | MEVER</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-bg-primary p-4 sm:p-8">
	<!-- wrapper container -->
	<div
		class="w-full max-w-xl rounded-2xl border border-border-base bg-bg-elevated p-6 shadow-sm transition-colors duration-200 sm:p-10"
	>
		<!-- Header Section -->
		<div class="mb-8">
			<a
				href="/auth/login"
				class="mb-6 inline-flex items-center text-sm font-medium text-text-muted transition-colors hover:text-primary"
				><ArrowLeft size={16} class="mr-2" />Kembali ke halaman Login
			</a>
			<h1 class="mb-2 text-3xl font-bold text-text-main">Request Account</h1>
			<p class="text-sm text-text-sub">
				Silakan isi formulir di bawah ini untuk mengajukan akses akun ke sistem MEVER.
			</p>
		</div>

		<!-- feedback Message -->
		{#if errorMessage}
			<div class="mb-6 rounded-md border border-red-500/20 bg-red-500/10 p-4">
				<p class="text-sm font-medium text-red-500">
					{errorMessage}
				</p>
			</div>
		{/if}

		<!-- Form Section -->
		<form onsubmit={handleSubmit} class="space-y-5">
			<Input
				id="name"
				label="Nama Lengkap"
				placeholder="Masukan Nama Lengkap Anda"
				bind:value={formState.name}
				required
			>
				{#snippet leadingIcon()}
					<User size={18} />
				{/snippet}
			</Input>

			<Input
				id="email"
				type="email"
				label="Alamat Email Pribadi/Kantor"
				placeholder="contoh@domain.com"
				bind:value={formState.email}
				required
			>
				{#snippet leadingIcon()}
					<Mail size={18} />
				{/snippet}
			</Input>

			<Input
				id="department"
				label="Departmen / Instansi"
				placeholder="Departemen atau unit kerja anda"
				bind:value={formState.department}
				required
			>
				{#snippet leadingIcon()}
					<Building2 size={18} />
				{/snippet}
			</Input>

			<!-- divider -->
			<div class="my-6 h-px w-full bg-border-base"></div>

			<!-- Button -->

			<div class="flex items-center justify-end gap-3 pt-2">
				<Button variant="ghost" type="button" href="/auth/login">Batal</Button>

				<Button variant="primary" type="submit" disabled={isLoading} class="min-w-[140px]">
					{#if isLoading}
						Memproses...
					{:else}
						<Send size={18} class="mr-2" />
						Kirim Request
					{/if}
				</Button>
			</div>
		</form>
	</div>
</div>

<Modal bind:open={showSuccessModal} title="Request Terkirim" size="sm">
	<p class="text-center py-2">
		Request Akun Anda berhasil dikirim! Silakan tunggu konfirmasi lebih lanjut dari admin yang akan dikirimkan melalui email Anda.
	</p>
	{#snippet footer()}
		<div class="flex justify-end">
			<Button variant="primary" href="/auth/login" class="w-full">
				Kembali ke Login
			</Button>
		</div>
	{/snippet}
</Modal>
