<script lang="ts">
	import { dashboardApi, type DashboardData } from '$lib/api/dashboard.api';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Spinner from '$lib/components/ui/Spinner.svelte';
	import {
		Users,
		Film,
		LoaderCircle,
		TriangleAlert,
		SquarePlay,
		Clock,
		HardDrive,
		Plus,
		PlaySquare,
		Settings2
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { currentUser } from '$lib/stores/auth.store';

	let data = $state<DashboardData | null>(null);
	let loading = $state(true);

	async function load() {
		loading = true;
		try {
			data = await dashboardApi.get();
		} catch (err: unknown) {
			console.error(err);
			toast.error('Gagal memuat data dashboard');
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		load();
	});

	function formatDate(iso: string) {
		return new Intl.DateTimeFormat('id-ID', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(iso));
	}

	function statusColor(status: string): 'green' | 'yellow' | 'red' | 'default' {
		if (status === 'ready') return 'green';
		if (status === 'processing' || status === 'queued') return 'yellow';
		if (status === 'failed' || status === 'deleted') return 'red';
		return 'default';
	}

	function formatBytes(bytes: number, decimals = 2) {
		if (!+bytes) return '0 Bytes';
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
	}
</script>

<svelte:head>
	<title>Overview — Admin Mever</title>
</svelte:head>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex items-end justify-between">
		<div>
			<h1 class="text-2xl font-bold text-text-main">
				Halo, {$currentUser?.email ? $currentUser.email.split('@')[0] : 'Admin'}
			</h1>
			<p class="mt-1 text-sm text-text-sub">Ini adalah ringkasan sistem Mever hari ini.</p>
		</div>

		<a
			href="/admin/videos/upload"
			class="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover sm:flex"
		>
			<Plus size={16} /> Upload Video
		</a>
	</div>

	{#if loading}
		<div class="flex min-h-[300px] items-center justify-center">
			<Spinner size="lg" class="text-primary" />
		</div>
	{:else if data}
		<!-- ─── Stat Cards ─── -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<StatCard
				title="Total Video"
				value={data.stats.totalVideos}
				icon={Film}
				description="Video siap tayang & antrian"
			/>
			<StatCard
				title="Penyimpanan (Raw)"
				value={formatBytes(data.stats.totalStorageBytes)}
				icon={HardDrive}
				description="Total ukuran file asli"
			/>
			<StatCard
				title="Jobs Berjalan"
				value={data.stats.processingJobs}
				icon={LoaderCircle}
				description="Dalam antrian transcoder"
			/>
			<StatCard
				title="Jobs Gagal"
				value={data.stats.failedJobs}
				icon={TriangleAlert}
				description="Perlu pengecekan"
			/>
		</div>

		<!-- ─── Quick Actions ─── -->
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
			<a
				href="/admin/videos"
				class="flex flex-col items-center gap-2 rounded-xl border border-border-base bg-white p-4 text-center transition-all hover:border-primary hover:bg-primary/5 hover:text-primary dark:bg-bg-secondary dark:hover:bg-primary/10"
			>
				<PlaySquare size={24} class="text-slate-400 group-hover:text-primary" />
				<span class="text-sm font-semibold">Video Library</span>
			</a>
			<a
				href="/admin/transcoder"
				class="flex flex-col items-center gap-2 rounded-xl border border-border-base bg-white p-4 text-center transition-all hover:border-amber-500 hover:bg-amber-50 hover:text-amber-600 dark:bg-bg-secondary dark:hover:bg-amber-500/10 dark:hover:text-amber-500"
			>
				<LoaderCircle size={24} class="text-slate-400" />
				<span class="text-sm font-semibold">Antrian Jobs</span>
			</a>
			<a
				href="/admin/presets"
				class="flex flex-col items-center gap-2 rounded-xl border border-border-base bg-white p-4 text-center transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-bg-secondary dark:hover:bg-emerald-500/10 dark:hover:text-emerald-500"
			>
				<Settings2 size={24} class="text-slate-400" />
				<span class="text-sm font-semibold">Kualitas Preset</span>
			</a>
			<a
				href="/admin/users"
				class="flex flex-col items-center gap-2 rounded-xl border border-border-base bg-white p-4 text-center transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:bg-bg-secondary dark:hover:bg-blue-500/10 dark:hover:text-blue-500"
			>
				<Users size={24} class="text-slate-400" />
				<span class="text-sm font-semibold">Manajemen User</span>
			</a>
		</div>

		<!-- ─── Recent Activity (2 Kolom) ─── -->
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Video Terbaru -->
			<div
				class="flex flex-col rounded-xl border border-border-base bg-white shadow-sm dark:bg-bg-secondary"
			>
				<div class="flex items-center justify-between border-b border-border-base px-5 py-4">
					<h2
						class="text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-text-muted"
					>
						Video Terbaru Diupload
					</h2>
					<a href="/admin/videos" class="text-xs font-semibold text-primary hover:underline"
						>Lihat semua →</a
					>
				</div>

				<ul class="flex-1 divide-y divide-border-base">
					{#if data.recentVideos.length === 0}
						<li class="flex items-center justify-center py-10 text-sm text-text-muted">
							Belum ada video
						</li>
					{:else}
						{#each data.recentVideos as video (video.id)}
							<li
								class="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-bg-surface"
							>
								<!-- Thumbnail -->
								{#if video.thumbnailUrl}
									<img
										src={video.thumbnailUrl}
										alt={video.title}
										class="h-11 w-18 shrink-0 rounded-md object-cover"
									/>
								{:else}
									<div
										class="flex h-11 w-18 shrink-0 items-center justify-center rounded-md bg-slate-200 text-slate-400 dark:bg-slate-800"
									>
										<SquarePlay size={18} />
									</div>
								{/if}

								<!-- Info -->
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-text-main">{video.title}</p>
									<p class="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
										<Clock size={11} />
										{formatDate(video.createdAt)}
									</p>
								</div>

								<!-- Status Badge -->
								<Badge label={video.status} color={statusColor(video.status)} />
							</li>
						{/each}
					{/if}
				</ul>
			</div>

			<!-- Job Gagal Terbaru -->
			<div
				class="flex flex-col rounded-xl border border-border-base bg-white shadow-sm dark:bg-bg-secondary"
			>
				<div class="flex items-center justify-between border-b border-border-base px-5 py-4">
					<h2
						class="text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-text-muted"
					>
						Job Gagal Terbaru
					</h2>
					<a href="/admin/transcoder" class="text-xs font-semibold text-primary hover:underline"
						>Lihat semua →</a
					>
				</div>

				<ul class="flex-1 divide-y divide-border-base">
					{#if data.recentFailedJobs.length === 0}
						<li class="flex items-center justify-center py-10 text-sm text-text-muted">
							Tidak ada job yang gagal
						</li>
					{:else}
						{#each data.recentFailedJobs as job (job.id)}
							<li
								class="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-bg-surface"
							>
								<!-- Thumbnail -->
								{#if job.videoThumbnail}
									<img
										src={job.videoThumbnail}
										alt={job.videoTitle ?? ''}
										class="h-11 w-18 shrink-0 rounded-md object-cover"
									/>
								{:else}
									<div
										class="flex h-11 w-18 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-400 dark:bg-rose-900/20"
									>
										<TriangleAlert size={18} />
									</div>
								{/if}

								<!-- Info -->
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-medium text-text-main">
										{job.videoTitle ?? 'Unknown Video'}
									</p>
									<p class="truncate text-xs text-text-muted">
										Preset: <span class="font-semibold">{job.presetName ?? '-'}</span>
										{#if job.presetResolution}
											<span class="ml-1 text-text-muted">({job.presetResolution})</span>
										{/if}
									</p>
									{#if job.errorMessage}
										<p class="mt-0.5 truncate text-xs text-rose-500 dark:text-rose-400">
											{job.errorMessage}
										</p>
									{/if}
								</div>

								<!-- Badge -->
								<Badge label="failed" color="red" />
							</li>
						{/each}
					{/if}
				</ul>
			</div>
		</div>
	{/if}
</div>
