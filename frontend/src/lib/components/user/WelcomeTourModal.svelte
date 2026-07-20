<script lang="ts">
	import { Modal, Button } from '$lib/components/ui';
	import { Info, Lock, ArrowRight} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let isOpen = $state(false);

	onMount(() => {
		// Cek apakah user sudah pernah melihat tour ini
		const hasSeenTour = localStorage.getItem('has_seen_welcome_tour');
		if (!hasSeenTour) {
			isOpen = true;
		}
	});

	function handleClose() {
		isOpen = false;
		localStorage.setItem('has_seen_welcome_tour', 'true');
	}

	function goToSettings() {
		handleClose();
		goto('/dashboard/settings');
	}
</script>

<Modal bind:open={isOpen} title="👋 Selamat Datang di MEVER!" size="md" onclose={handleClose}>
	<div class="space-y-5 py-2">
		<p class="text-sm leading-relaxed text-slate-600 dark:text-[#a0a0a0]">
			Akun Anda telah disetujui oleh Admin. Karena Anda baru saja mendapatkan akses menggunakan password default, kami sangat menyarankan Anda untuk <strong>segera mengubah password</strong> demi keamanan akun Anda.
		</p>
		
		<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
			<div class="flex items-start gap-3">
				<div class="mt-0.5 rounded-full bg-amber-100 p-1.5 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
					<Lock size={16} />
				</div>
				<div>
					<h3 class="font-medium text-amber-800 dark:text-amber-300">Cara Mengubah Password:</h3>
					<ol class="mt-2 list-decimal space-y-1 pl-4 text-xs text-amber-700 dark:text-amber-400/80">
						<li>Buka menu <strong>Settings</strong> di sidebar kiri (atau klik tombol di bawah).</li>
						<li>Gulir ke bagian <strong>Change Password</strong>.</li>
						<li>Masukkan password saat ini (default).</li>
						<li>Masukkan password baru yang lebih kuat.</li>
						<li>Klik <strong>Save Changes</strong>.</li>
					</ol>
				</div>
			</div>
		</div>

		<div class="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
			<div class="flex items-start gap-3">
				<div class="mt-0.5 rounded-full bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
					<Info size={16} />
				</div>
				<div>
					<h3 class="font-medium text-blue-800 dark:text-blue-300">Penggunaan Platform:</h3>
					<ul class="mt-2 list-disc space-y-1 pl-4 text-xs text-blue-700 dark:text-blue-400/80">
						<li>Anda dapat mengunggah video ke platform.</li>
						<li>Pantau status pemrosesan video Anda di dashboard.</li>
					</ul>
				</div>
			</div>
		</div>
	</div>

	{#snippet footer()}
		<div class="flex justify-end gap-3">
			<Button variant="ghost" onclick={handleClose}>
				Nanti Saja
			</Button>
			<Button variant="primary" onclick={goToSettings} class="flex items-center gap-2">
				Ubah Password Sekarang
				<ArrowRight size={16} />
			</Button>
		</div>
	{/snippet}
</Modal>
