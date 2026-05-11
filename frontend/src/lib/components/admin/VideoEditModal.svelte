<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { updateVideo } from '$lib/api/admin-videos.api';
	import { toast } from 'svelte-sonner';
	import { Save } from 'lucide-svelte';

	interface Video {
		id: string;
		title: string;
		description?: string;
		status?: string;
		slug?: string;
		thumbnailUrl?: string;
		createdAt?: string;
	}

	interface Props {
		open: boolean;
		video: Video;
		onsave: () => void;
	}

	let { open = $bindable(false), video, onsave }: Props = $props();

	let title = $state('');
	let description = $state('');
	let loading = $state(false);

	// Update local state saat prop video berubah
	$effect(() => {
		if (video) {
			title = video.title || '';
			description = video.description || '';
		}
	});

	async function handleSave() {
		if (!title.trim()) {
			toast.error('Judul video tidak boleh kosong');
			return;
		}

		loading = true;
		try {
			await updateVideo(video.id, { title, description });
			toast.success('Video berhasil diperbarui');
			open = false; // Tutup modal
			onsave(); // Trigger reload di parent
		} catch (err: unknown) {
			console.error('❌ Update video error:', err);
			toast.error('Gagal memperbarui video');
		} finally {
			loading = false;
		}
	}
</script>

<Modal bind:open title="Edit Detail Video" size="lg">
	<div class="space-y-4 py-2">
		<!-- Title -->
		<div class="space-y-2">
			<label for="video-title" class="text-sm font-medium text-text-sub">Judul Video</label>
			<Input id="video-title" bind:value={title} placeholder="Masukkan judul video" required />
		</div>

		<!-- Description -->
		<div class="space-y-2">
			<label for="video-desc" class="text-sm font-medium text-text-sub">Deskripsi</label>
			<textarea
				id="video-desc"
				bind:value={description}
				placeholder="Masukkan deskripsi video (opsional)"
				class="h-32 w-full rounded-md border border-border-base bg-white px-4 py-2 text-sm text-text-main transition-all placeholder:text-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none dark:bg-bg-secondary"
			></textarea>
		</div>
	</div>

	{#snippet footer()}
		<div class="flex justify-end gap-3">
			<Button variant="secondary" onclick={() => (open = false)}>Batal</Button>
			<Button variant="primary" onclick={handleSave} disabled={loading}>
				{#if loading}
					<span class="mr-2 animate-spin">⏳</span>
				{/if}
				<Save size={16} class="mr-2" />
				Simpan Perubahan
			</Button>
		</div>
	{/snippet}
</Modal>
