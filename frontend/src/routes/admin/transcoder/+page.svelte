<script lang="ts">
  import { jobsApi, type JobItem, type JobStats } from '$lib/api/jobs.api';
  import StatCard from '$lib/components/ui/StatCard.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Pagination from '$lib/components/ui/Pagination.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { SquarePlay, LoaderCircle, CircleCheckBig, TriangleAlert, RotateCcw } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let jobs = $state<JobItem[]>([]);
  let stats = $state<JobStats>({ total: 0, queued: 0, processing: 0, completed: 0, failed: 0 });
  let total = $state(0);
  let loading = $state(true);
  
  let page = $state(1);
  let limit = 10;

  async function loadJobs() {
    loading = true;
    try {
      const res = await jobsApi.getJobs({ page, limit });
      jobs = res.jobs || [];
      stats = res.stats;
      total = res.total;
    } catch (err: unknown) {
      console.error(err);
      toast.error('Gagal mengambil data antrian');
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    void page;
    loadJobs();
    
    // Auto refresh setiap 5 detik agar progress bar berjalan
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  });

  async function handleRetry(jobId: string) {
    try {
      await jobsApi.retryJob(jobId);
      toast.success('Job berhasil diulang');
      loadJobs();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message || 'Gagal mengulang job');
    }
  }

  function getStatusColor(status: string) {
    switch(status) {
      case 'completed': return 'green';
      case 'processing': return 'yellow';
      case 'failed': return 'red';
      default: return 'default';
    }
  }
</script>

<div class="space-y-6 px-6 py-4">
  <!-- Header / Banner -->
  <div class="rounded-xl border border-border-base bg-bg-secondary p-6 shadow-sm">
    <h1 class="text-2xl font-bold text-primary">Transcode Jobs</h1>
    <p class="mt-2 text-sm text-text-sub">
      Pantau dan kelola antrian pemrosesan video yang dikerjakan oleh Transcoder Worker.
    </p>
  </div>

  <!-- Statistics Cards -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard title="Total Jobs" value={stats.total} icon={SquarePlay} description="Semua job" />
    <StatCard title="Processing" value={stats.processing} icon={LoaderCircle} description="Sedang berjalan" />
    <StatCard title="Completed" value={stats.completed} icon={CircleCheckBig} description="Berhasil" />
    <StatCard title="Failed Jobs" value={stats.failed} icon={TriangleAlert} description="Butuh aksi" />
  </div>

  <!-- Jobs Table -->
  <div class="rounded-xl border border-border-base bg-white shadow-sm dark:bg-bg-secondary">
    <div class="border-b border-border-base px-6 py-4">
      <h2 class="text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-text-muted">
        TRANSCODE JOBS ({total} items)
      </h2>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-text-main">
        <thead class="bg-slate-50 text-xs font-semibold text-slate-500 uppercase dark:bg-bg-surface dark:text-text-muted">
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
                      <div class="flex h-10 w-16 items-center justify-center rounded bg-slate-200 dark:bg-slate-800 text-slate-400">
                        <SquarePlay size={16} />
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
                    <Button variant="secondary" size="sm" onclick={() => handleRetry(job.id)}>
                      <RotateCcw size={14} class="mr-1" />
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

    {#if total > 0}
      <div class="border-t border-border-base p-4">
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(total / limit)}
          itemsPerPage={limit}
          onPageChange={(p) => page = p}
        />
      </div>
    {/if}
  </div>
</div>
