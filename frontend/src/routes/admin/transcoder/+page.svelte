<script lang="ts">
  import { jobsApi, type JobItem, type JobStats } from '$lib/api/jobs.api';
  import StatCard from '$lib/components/ui/StatCard.svelte';
  import JobsTable from '$lib/components/admin/JobsTable.svelte';
  import { Layers, Activity, CircleCheck, CircleAlert } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  let jobs = $state<JobItem[]>([]);
  let stats = $state<JobStats>({ total: 0, queued: 0, processing: 0, completed: 0, failed: 0 });
  let total = $state(0);
  let loading = $state(true);
  
  let page = $state(1);
  let limit = 5;

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

</script>

<div class="space-y-6 px-6 py-4">
  <!-- Header / Banner -->
  <div class="rounded-xl border border-border-base bg-white p-6 shadow-sm dark:bg-bg-secondary">
    <h1 class="text-2xl font-bold text-primary">Transcode Jobs</h1>
    <p class="mt-2 text-sm text-text-sub">
      Pantau dan kelola antrian pemrosesan video yang dikerjakan oleh Transcoder Worker.
    </p>
  </div>

  <!-- Statistics Cards -->
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard title="Total Jobs" value={stats.total} icon={Layers} description="Semua job" />
    <StatCard title="Processing" value={stats.processing} icon={Activity} description="Sedang berjalan" />
    <StatCard title="Completed" value={stats.completed} icon={CircleCheck} description="Berhasil" />
    <StatCard title="Failed Jobs" value={stats.failed} icon={CircleAlert} description="Butuh aksi" />
  </div>

  <JobsTable
    {jobs}
    {loading}
    {total}
    {page}
    {limit}
    onRetry={handleRetry}
    onPageChange={(p) => page = p}
  />
</div>
