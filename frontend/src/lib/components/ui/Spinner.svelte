<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { size = 'md', class: className }: Props = $props();

	const sizes = {
		sm: 'h-4 w-4 border-2',
		md: 'h-6 w-6 border-2',
		lg: 'h-10 w-10 border-[3px]'
	};
</script>

<span
	role="status"
	aria-label="Loading..."
	class={cn(
		'inline-block animate-spin rounded-full border-current border-r-transparent',
		sizes[size],
		className
	)}
></span>
