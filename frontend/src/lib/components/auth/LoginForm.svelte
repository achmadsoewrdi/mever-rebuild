<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import { Mail, Lock } from 'lucide-svelte';
	import { loginSchema, type LoginInput } from '$lib/utils/validator';

	import ErrorPopup from '$lib/components/ui/ErrorPopup.svelte';

	// Svelte 5 callback props
	interface Props {
		onSubmit?: (data: LoginInput, rememberMe: boolean) => Promise<void>;
		isLoading?: boolean;
		errorMessage?: string | null;
		onErrorDismiss?: () => void;
	}

	let { onSubmit, isLoading = false, errorMessage = null, onErrorDismiss }: Props = $props();

	// Local State
	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let localError = $state<string | null>(null);
	let isSubmitting = $state(false);

	// Derived states
	let loading = $derived(isLoading || isSubmitting);
	let displayError = $derived(errorMessage || localError);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		localError = null;
		if (onErrorDismiss) onErrorDismiss();

		const result = loginSchema.safeParse({ email, password });
		if (!result.success) {
			localError = "Email atau password yang Anda masukkan tidak valid.";
			return;
		}
		if (onSubmit) {
			isSubmitting = true;
			await onSubmit(result.data, rememberMe);
			isSubmitting = false;
		} else {
			console.log('Form Valid:', result.data);
		}
	}
</script>

{#snippet mailIcon()}
	<Mail size={18} />
{/snippet}

{#snippet lockIcon()}
	<Lock size={18} />
{/snippet}

<!-- Form Container -->
<form onsubmit={handleSubmit} class="flex w-full flex-col gap-5">
	<!-- Header -->
	<div class="mb-2">
		<h2 class="text-2xl font-bold text-text-main">Welcome Back</h2>
		<p class="mt-1 text-sm text-text-sub">Please sign in to access your dashboard.</p>
	</div>

	<!-- Error Pop up / Banner -->
	{#if displayError}
		<ErrorPopup 
			message={displayError} 
			onClose={() => {
				localError = null;
				if (onErrorDismiss) onErrorDismiss();
			}} 
		/>
	{/if}

	<!-- Input Fields -->
	<div class="flex flex-col gap-4">
		<Input
			id="email"
			type="email"
			label="Email"
			placeholder="nama@email.com"
			leadingIcon={mailIcon}
			bind:value={email}
			disabled={loading}
		/>

		<Input
			id="password"
			type="password"
			label="Password"
			placeholder="••••••••"
			leadingIcon={lockIcon}
			bind:value={password}
			disabled={loading}
		/>

		<!-- Remember Me & Forgot Password -->
		<div class="mt-1 flex items-center justify-between">
			<Checkbox id="remember" label="Remember me" bind:checked={rememberMe} disabled={loading} />
			<a href="/auth/forgot-password" class="text-sm font-semibold text-primary hover:underline">
				Forgot password?
			</a>
		</div>
	</div>

	<!-- Action Buttons -->
	<div class="mt-2 flex flex-col gap-4">
		<Button type="submit" variant="primary" class="w-full" disabled={loading}>
			{#if loading}
				Signing in...
			{:else}
				Sign in
			{/if}
		</Button>

		<div class="relative flex items-center py-2">
			<div class="grow border-t border-slate-200 dark:border-slate-700"></div>
			<span class="mx-4 text-xs text-text-muted">OR</span>
			<div class="grow border-t border-slate-200 dark:border-slate-700"></div>
		</div>

		<Button
			variant="outline"
			class="w-full text-text-sub hover:text-text-main"
			href="/auth/request-account"
		>
			Request a new account
		</Button>
	</div>
</form>
