<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	type BaseProps = {
		variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		children: Snippet;
		class?: string;
	};

	// Menggabungkan props untuk button dan anchor
	type Props = BaseProps &
		(
			| (HTMLButtonAttributes & { href?: never })
			| (HTMLAnchorAttributes & { href: string })
		);

	let {
		variant = 'primary',
		size = 'default',
		class: className,
		href,
		children,
		...rest
	}: Props = $props();

	const variants = {
		primary: 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20',
		secondary: 'bg-bg-surface text-text-main hover:bg-bg-elevated',
		outline: 'border border-border-base bg-transparent hover:bg-bg-surface text-text-main',
		ghost: 'hover:bg-bg-surface text-text-sub hover:text-text-main',
		destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20',
		link: 'text-primary underline-offset-4 hover:underline'
	};

	const sizes = {
		default: 'h-10 px-5 py-2',
		sm: 'h-8 px-3 text-xs',
		lg: 'h-12 px-8 text-base',
		icon: 'h-10 w-10'
	};
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	{href}
	class={cn(
		'inline-flex items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-50',
		variants[variant],
		sizes[size],
		className
	)}
	{...rest as any}
>
	{@render children()}
</svelte:element>
