<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { removeToast, type Toast } from '$lib/stores/toast.store';
	import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-svelte';

	interface Props {
		toast: Toast;
	}

	let { toast }: Props = $props();

	// Konfigurasi per tipe toast
	const config = {
		success: {
			icon: CheckCircle,
			class: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400',
			iconClass: 'text-emerald-500 dark:text-emerald-400'
		},
		error: {
			icon: XCircle,
			class: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400',
			iconClass: 'text-rose-500 dark:text-rose-400'
		},
		warning: {
			icon: AlertTriangle,
			class: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400',
			iconClass: 'text-amber-500 dark:text-amber-400'
		},
		info: {
			icon: Info,
			class: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400',
			iconClass: 'text-blue-500 dark:text-blue-400'
		}
	};

	let current = $derived(config[toast.type]);
</script>

<div
	class={cn(
		'flex items-start gap-3 rounded-md border px-4 py-3 shadow-lg',
		'w-full max-w-sm pointer-events-auto',
		'animate-in slide-in-from-right-4 fade-in duration-300',
		current.class
	)}
	role="alert"
>
	<!-- Icon -->
	<span class={cn('mt-0.5 shrink-0', current.iconClass)}>
		<current.icon size={18} strokeWidth={2.5} />
	</span>

	<!-- Message -->
	<p class="flex-1 text-sm font-medium leading-snug">{toast.message}</p>

	<!-- Close Button -->
	<button
		type="button"
		onclick={() => removeToast(toast.id)}
		aria-label="Dismiss notification"
		class="shrink-0 rounded-md p-0.5 opacity-70 transition-all hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
	>
		<X size={16} />
	</button>
</div>
