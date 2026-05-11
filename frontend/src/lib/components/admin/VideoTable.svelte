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

<div class="overflow-x-auto rounded-lg border border-border-base shadow-sm">
	<table class="w-full text-left text-sm text-text-main">
		<thead class="border-b border-border-base bg-bg-secondary text-xs text-text-sub uppercase">
			<tr>
				<th scope="col" class="px-6 py-4">Video</th>
				<th scope="col" class="px-6 py-4">Status</th>
				<th scope="col" class="px-6 py-4">Created At</th>
				<th scope="col" class="px-6 py-4 text-right">Action</th>
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
						class="border-b border-border-base bg-white transition-colors hover:bg-slate-50 dark:bg-bg-secondary dark:hover:bg-bg-surface"
					>
						<td class="flex items-center gap-3 px-6 py-4 font-medium">
							{#if video.thumbnailUrl}
								<img
									src={video.thumbnailUrl}
									alt={video.title}
									class="h-9 w-16 rounded border border-border-base object-cover"
								/>
							{:else}
								<div
									class="flex h-9 w-16 items-center justify-center rounded border border-border-base bg-slate-100 text-xs text-text-sub dark:bg-slate-800"
								>
									No Thumb
								</div>
							{/if}
							<div>
								<div class="font-bold text-text-main">{video.title}</div>
								<div class="max-w-xs truncate text-xs text-text-sub">{video.slug}</div>
							</div>
						</td>
						<td class="px-6 py-4">
							<Badge color={getStatusColor(video.status)} label={video.status} />
						</td>
						<td class="px-6 py-4 text-text-sub">
							{new Date(video.createdAt).toLocaleDateString('id-ID', {
								day: '2-digit',
								month: 'short',
								year: 'numeric'
							})}
						</td>
						<td class="px-6 py-4 text-right">
							<div class="flex justify-end gap-2">
								<button
									onclick={() => dispatch('view', video)}
									class="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-bg-surface"
									title="View Detail"
								>
									<Eye size={18} class="text-text-sub" />
								</button>
								<button
									onclick={() => dispatch('edit', video)}
									class="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-bg-surface"
									title="Edit"
								>
									<Edit size={18} class="text-text-sub" />
								</button>
								<button
									onclick={() => dispatch('delete', video)}
									class="rounded-full p-2 text-red-500 transition-colors hover:bg-slate-100 dark:hover:bg-bg-surface"
									title="Delete"
								>
									<Trash2 size={18} />
								</button>
							</div>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
