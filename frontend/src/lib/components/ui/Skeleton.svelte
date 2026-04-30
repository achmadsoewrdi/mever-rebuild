<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
	}

	let { class: className }: Props = $props();
</script>

<div class={cn('animate-pulse rounded-md bg-slate-200 dark:bg-border-base/50', className)}></div>
