<script lang="ts">
  import type { JobItem } from '$lib/api/jobs.api';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Pagination from '$lib/components/ui/Pagination.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { RefreshCw, LoaderCircle, Film } from 'lucide-svelte';

  interface Props {
    jobs: JobItem[];
    loading: boolean;
    total: number;
    page: number;
    limit: number;
    onRetry: (jobId: string) => void;
    onPageChange: (page: number) => void;
  }

  let { jobs, loading, total, page, limit, onRetry, onPageChange }: Props = $props();

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'green';
      case 'processing':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'default';
    }
  }
</script>

<div class="rounded-xl border border-border-base bg-white shadow-sm dark:bg-bg-secondary">
  <div class="border-b border-border-base px-6 py-4">
    <h2 class="text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-text-muted">
      TRANSCODE JOBS ({total} items)
    </h2>
  </div>

  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm text-text-main">
      <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-bg-surface dark:text-text-muted">
        <tr>
          <th class="px-6 py-4">Name</th>
          <th class="px-6 py-4">Format</th>
          <th class="px-6 py-4">Progress</th>
          <th class="px-6 py-4">Status</th>
          <th class="px-6 py-4 text-right">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border-base">
        {#if loading && jobs.length === 0}
          <tr>
            <td colspan="5" class="py-12 text-center text-text-sub">
              <div class="flex items-center justify-center space-x-2">
                <LoaderCircle class="animate-spin text-primary" />
                <span>Memuat antrian...</span>
              </div>
            </td>
          </tr>
        {:else if jobs.length === 0}
          <tr>
            <td colspan="5" class="py-12 text-center text-text-sub">
              Tidak ada job dalam antrian
            </td>
          </tr>
        {:else}
          {#each jobs as job (job.id)}
            <tr class="transition-colors hover:bg-slate-50 dark:hover:bg-bg-surface">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  {#if job.video?.thumbnailUrl}
                    <img src={job.video.thumbnailUrl} alt={job.video.title} class="h-10 w-16 rounded object-cover" />
                  {:else}
                    <div class="flex h-10 w-16 items-center justify-center rounded bg-slate-200 text-slate-400 dark:bg-slate-800">
                      <Film size={16} />
                    </div>
                  {/if}
                  <div>
                    <p class="font-medium">{job.video?.title || 'Unknown Video'}</p>
                    <p class="text-xs text-text-muted">{job.preset?.name || 'Default'}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <Badge label={job.preset?.format || 'mp4'} color="default" />
              </td>
              <td class="px-6 py-4">
                <div class="flex w-full max-w-[150px] items-center gap-3">
                  <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                    <div class="h-full bg-primary transition-all duration-500" style="width: {job.progressPct}%"></div>
                  </div>
                  <span class="text-xs text-text-muted">{job.progressPct}%</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <Badge label={job.status} color={getStatusColor(job.status)} />
              </td>
              <td class="px-6 py-4 text-right">
                {#if job.status === 'failed'}
                  <Button variant="secondary" size="sm" onclick={() => onRetry(job.id)}>
                    <RefreshCw size={14} class="mr-1" />
                    Retry
                  </Button>
                {:else}
                  <span class="text-xs text-text-muted">-</span>
                {/if}
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>
</div>

{#if total > limit}
  <div class="mt-4">
    <Pagination
      currentPage={page}
      totalPages={Math.ceil(total / limit)}
      itemsPerPage={limit}
      onPageChange={onPageChange}
    />
  </div>
{/if}
