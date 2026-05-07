<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Eye, EyeOff } from 'lucide-svelte'; // Import icon Lucide

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		id?: string;
		value?: string | number;
		label?: string;
		helperText?: string;
		variant?: 'outline' | 'filled';
		leadingIcon?: Snippet;
		trailingIcon?: Snippet;
	}

	let {
		id = `input-${Math.random().toString(36).substring(2, 9)}`,
		value = $bindable(''),
		label,
		helperText,
		variant = 'outline',
		leadingIcon,
		trailingIcon,
		type = 'text',
		class: className,
		...rest
	}: Props = $props();

	let isPasswordVisible = $state(false);

	// Derived state untuk menentukan tipe input secara dinamis
	let currentType = $derived(type === 'password' && isPasswordVisible ? 'text' : type);

	function togglePassword() {
		isPasswordVisible = !isPasswordVisible;
	}
</script>

<div class="flex w-full flex-col gap-1.5">
	{#if label}
		<label for={id} class="ml-1 text-sm font-semibold text-text-main">
			{label}
		</label>
	{/if}

	<div class="group relative flex items-center">
		{#if leadingIcon}
			<div
				class="absolute left-3.5 flex items-center justify-center text-text-muted transition-colors group-focus-within:text-primary"
			>
				{@render leadingIcon()}
			</div>
		{/if}

		<input
			{id}
			{...rest}
			type={currentType}
			bind:value
			class={cn(
				'w-full rounded-md border text-sm shadow-sm transition-all duration-200',
				'text-text-main',
				'placeholder:text-text-muted',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none',
				variant === 'outline'
					? 'border-border-base bg-transparent'
					: 'border-transparent bg-bg-surface focus:bg-bg-secondary autofill-fix',
				leadingIcon ? 'pl-11' : 'pl-4',
				trailingIcon || type === 'password' ? 'pr-11' : 'pr-4',
				'h-11 py-2',
				className
			)}
		/>

		<!-- Logic untuk Password Toggle atau Trailing Icon -->
		{#if type === 'password'}
			<button
				type="button"
				onclick={togglePassword}
				class="absolute right-3 flex items-center justify-center rounded-lg p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-main focus:outline-none"
				aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
			>
				{#if isPasswordVisible}
					<EyeOff size={18} strokeWidth={2.5} />
				{:else}
					<Eye size={18} strokeWidth={2.5} />
				{/if}
			</button>
		{:else if trailingIcon}
			<div class="absolute right-3.5 flex items-center justify-center text-text-muted">
				{@render trailingIcon()}
			</div>
		{/if}
	</div>

	{#if helperText}
		<p class="ml-1 text-xs text-text-sub">{helperText}</p>
	{/if}
</div>
