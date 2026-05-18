<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import { Eye, Edit, Trash2 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	interface Video {
		id: string;
		title: string;
		description?: string;
		status: string;
		slug: string;
		thumbnailUrl?: string;
		createdAt: string;
	}

	// Svelte 5 props
	let { videos = [] } = $props<{ videos: Video[] }>();

	const dispatch = createEventDispatcher();

	function getStatusColor(status: string): 'green' | 'yellow' | 'red' | 'default' {
		switch (status) {
			case 'ready':
				return 'green';
			case 'processing':
				return 'yellow';
			case 'queued':
				return 'default';
			case 'failed':
				return 'red';
			case 'deleted':
				return 'red';
			default:
				return 'default';
		}
	}
</script>

<div class="overflow-x-auto rounded-xl border border-border-base bg-white shadow-sm dark:bg-bg-secondary">
	<table class="w-full text-left text-sm text-text-main">
		<thead class="border-b border-border-base bg-slate-50/50 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:bg-bg-elevated/50 dark:text-slate-400">
			<tr>
				<th scope="col" class="px-6 py-5">Video</th>
				<th scope="col" class="px-6 py-5">Status</th>
				<th scope="col" class="px-6 py-5">Created At</th>
				<th scope="col" class="px-6 py-5 text-right">Action</th>
			</tr>
		</thead>
		<tbody>
			{#if videos.length === 0}
				<tr class="bg-white dark:bg-bg-secondary">
					<td colspan="4" class="px-6 py-8 text-center text-text-sub">
						Tidak ada video yang ditemukan.
					</td>
				</tr>
			{:else}
				{#each videos as video (video.id)}
					<tr
						class="group border-b border-border-base bg-white transition-all duration-300 hover:bg-primary/5 dark:bg-bg-secondary dark:hover:bg-bg-surface"
					>
						<td class="flex items-center gap-4 px-6 py-4 font-medium">
							{#if video.thumbnailUrl}
								<img
									src={video.thumbnailUrl}
									alt={video.title}
									class="h-10 w-16 rounded-md object-cover shadow-sm transition-transform duration-300 group-hover:scale-105"
								/>
							{:else}
								<div
									class="flex h-10 w-16 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-400 dark:bg-slate-800"
								>
									NO THUMB
								</div>
							{/if}
							<div class="flex flex-col justify-center">
								<div class="font-bold text-slate-800 transition-colors group-hover:text-primary dark:text-slate-100">{video.title}</div>
								<div class="max-w-xs truncate text-[11px] font-medium text-slate-400">{video.slug}</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<Badge color={getStatusColor(video.status)} label={video.status} />
						</td>
						<td class="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
							{new Date(video.createdAt).toLocaleDateString('id-ID', {
								day: '2-digit',
								month: 'short',
								year: 'numeric'
							})}
						</td>
						<td class="px-6 py-4 text-right">
							<div class="flex justify-end gap-1 transition-opacity duration-300">
								<button
									onclick={() => dispatch('view', video)}
									class="rounded-lg bg-blue-500/10 p-2 text-blue-600 transition-colors hover:bg-blue-500/20 dark:text-blue-400"
									title="View Detail"
								>
									<Eye size={16} />
								</button>
								<button
									onclick={() => dispatch('edit', video)}
									class="rounded-lg bg-amber-500/10 p-2 text-amber-600 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
									title="Edit"
								>
									<Edit size={16} />
								</button>
								<button
									onclick={() => dispatch('delete', video)}
									class="rounded-lg bg-rose-500/10 p-2 text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-400"
									title="Delete"
								>
									<Trash2 size={16} />
								</button>
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
