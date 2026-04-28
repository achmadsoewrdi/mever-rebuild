<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Tag from '$lib/components/ui/Tag.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { toast } from '$lib/stores/toast.store';
	import { Mail, Lock, Search, Layers, Bell, Sliders } from 'lucide-svelte';

	let username = $state('');
	let password = $state('');
	let isModalOpen = $state(false);
	let isChecked = $state(false);
</script>

<!-- Icon Snippets -->
{#snippet MailIcon()}
	<Mail size={18} />
{/snippet}
{#snippet LockIcon()}
	<Lock size={18} />
{/snippet}
{#snippet SearchIcon()}
	<Search size={18} />
{/snippet}

<!-- Modal Footer Snippet -->
{#snippet modalFooter()}
	<div class="flex justify-end gap-2">
		<Button variant="secondary" onclick={() => (isModalOpen = false)}>Batal</Button>
		<Button
			onclick={() => {
				toast.success('Perubahan disimpan!');
				isModalOpen = false;
			}}
		>
			Simpan Perubahan
		</Button>
	</div>
{/snippet}

<div class="mx-auto max-w-4xl space-y-10 p-8 pb-24">
	<!-- Header -->
	<header class="space-y-1.5 border-b border-border-base pb-8">
		<h1 class="text-4xl font-black tracking-tight text-text-main">Design System Showcase</h1>
		<p class="text-base text-text-sub">
			Demonstrasi seluruh komponen UI yang telah dibangun untuk Mever Rebuild.
		</p>
	</header>

	<!-- Section: Status & Labels -->
	<section class="space-y-4">
		<h2 class="flex items-center gap-2 text-lg font-bold text-text-main">
			<Bell size={18} class="text-primary" />
			Status & Labels
		</h2>
		<div
			class="flex flex-wrap items-center gap-6 rounded-lg border border-border-base bg-bg-secondary p-6"
		>
			<div class="space-y-2">
				<p class="text-[10px] font-bold tracking-widest text-text-muted uppercase">Badges</p>
				<div class="flex flex-wrap gap-2">
					<Badge label="Ready" color="green" />
					<Badge label="Pending" color="yellow" />
					<Badge label="Error" color="red" />
					<Badge label="Default" />
				</div>
			</div>
			<div class="hidden h-10 w-px bg-border-base sm:block"></div>
			<div class="space-y-2">
				<p class="text-[10px] font-bold tracking-widest text-text-muted uppercase">Format Tags</p>
				<div class="flex flex-wrap gap-2">
					<Tag label="DASH" variant="dash" />
					<Tag label="MP4" variant="mp4" />
					<Tag label="H.264" variant="h264" />
					<Tag label="HEVC" variant="hevc" />
					<Tag label="Default" />
				</div>
			</div>
		</div>
	</section>

	<!-- Section: Inputs & Controls -->
	<section class="space-y-4">
		<h2 class="flex items-center gap-2 text-lg font-bold text-text-main">
			<Sliders size={18} class="text-primary" />
			Input & Controls
		</h2>
		<div
			class="grid grid-cols-1 gap-6 rounded-lg border border-border-base bg-bg-secondary p-6 md:grid-cols-2"
		>
			<!-- Kolom Kiri -->
			<div class="space-y-4">
				<Input
					label="Email"
					placeholder="nama@example.com"
					bind:value={username}
					leadingIcon={MailIcon}
					helperText="Gunakan email yang aktif."
				/>
				<Input
					label="Password"
					type="password"
					placeholder="••••••••"
					leadingIcon={LockIcon}
					bind:value={password}
				/>
				<Checkbox label="Ingat saya di perangkat ini" bind:checked={isChecked} />
			</div>
			<!-- Kolom Kanan -->
			<div class="space-y-4">
				<Input
					variant="filled"
					label="Cari Video"
					placeholder="Ketik judul atau ID video..."
					trailingIcon={SearchIcon}
				/>
				<div class="space-y-1 rounded-md border border-border-base bg-bg-surface p-4">
					<p class="text-xs text-text-muted">Live Preview Input:</p>
					<p class="text-sm text-text-main">
						Email: <span class="font-semibold text-primary">{username || '—'}</span>
					</p>
					<p class="text-sm text-text-main">
						Checkbox: <span class="font-semibold text-primary"
							>{isChecked ? 'Aktif ✓' : 'Nonaktif'}</span
						>
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Section: Buttons -->
	<section class="space-y-4">
		<h2 class="flex items-center gap-2 text-lg font-bold text-text-main">
			<Layers size={18} class="text-primary" />
			Buttons & Actions
		</h2>
		<div class="space-y-4 rounded-lg border border-border-base bg-bg-secondary p-6">
			<!-- Variant Row -->
			<div>
				<p class="mb-3 text-[10px] font-bold tracking-widest text-text-muted uppercase">Variants</p>
				<div class="flex flex-wrap gap-3">
					<Button>Primary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="destructive">Destructive</Button>
					<Button variant="link">Link</Button>
				</div>
			</div>
			<!-- Size Row -->
			<div>
				<p class="mb-3 text-[10px] font-bold tracking-widest text-text-muted uppercase">Sizes</p>
				<div class="flex flex-wrap items-center gap-3">
					<Button size="sm">Small</Button>
					<Button size="default">Default</Button>
					<Button size="lg">Large</Button>
				</div>
			</div>
			<!-- Loading & Disabled -->
			<div>
				<p class="mb-3 text-[10px] font-bold tracking-widest text-text-muted uppercase">States</p>
				<div class="flex flex-wrap items-center gap-3">
					<Button variant="secondary" class="gap-2">
						<Spinner size="sm" /> Loading...
					</Button>
					<Button disabled>Disabled</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Section: Feedback (Toast & Modal) -->
	<section class="space-y-4">
		<h2 class="flex items-center gap-2 text-lg font-bold text-text-main">
			<Bell size={18} class="text-primary" />
			Feedback — Toast & Modal
		</h2>
		<div class="flex flex-wrap gap-3 rounded-lg border border-border-base bg-bg-secondary p-6">
			<Button onclick={() => toast.success('Video berhasil di-upload!')}>Toast Success</Button>
			<Button variant="destructive" onclick={() => toast.error('Gagal memproses video.')}>
				Toast Error
			</Button>
			<Button variant="outline" onclick={() => toast.info('Transcode sedang berjalan...')}>
				Toast Info
			</Button>
			<Button variant="ghost" onclick={() => toast.warning('Storage hampir penuh!')}>
				Toast Warning
			</Button>
			<Button variant="secondary" onclick={() => (isModalOpen = true)}>Buka Modal</Button>
		</div>
	</section>
</div>

<!-- Modal -->
<Modal bind:open={isModalOpen} title="Konfirmasi Pengaturan" footer={modalFooter}>
	<div class="space-y-4">
		<p class="text-text-sub">
			Apakah kamu yakin ingin menyimpan perubahan ini? Tindakan ini akan memperbarui profil kamu.
		</p>
		<div class="space-y-1 rounded-md border border-border-base bg-bg-surface p-4">
			<p class="text-xs text-text-muted">Email yang akan disimpan:</p>
			<p class="font-mono font-bold text-primary">{username || 'Belum diisi'}</p>
		</div>
	</div>
</Modal>
