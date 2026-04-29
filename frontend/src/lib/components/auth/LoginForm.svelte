<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import { Mail, Lock } from 'lucide-svelte';
	import { loginSchema, type LoginInput } from '$lib/utils/validator';

	// Svelte 5 callback props
	interface Props {
		/** Function callback yang akan dipanggil ketika form valid dan disubmit */
		onSubmit?: (data: LoginInput, rememberMe: boolean) => Promise<void>;
		/** State loading eksternal jika dikontrol dari halaman page */
		isLoading?: boolean;
	}

	let { onSubmit, isLoading = false }: Props = $props();

	// Local State
	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let errors = $state<{ email?: string; password?: string; global?: string }>({});
	let isSubmitting = $state(false);

	// Derived loading state (gabungan dari prop dan local)
	let loading = $derived(isLoading || isSubmitting);

	async function handleSubmit(event: Event) {
		event.preventDefault();
		errors = {}; // Reset error
		const result = loginSchema.safeParse({ email, password });
		// 2. Cek apakah validasi GAGAL
		if (!result.success) {
			const fieldErrors: typeof errors = {};

			// result.error otomatis dikenali oleh TypeScript sebagai ZodError
			result.error.issues.forEach((e) => {
				if (e.path[0]) {
					fieldErrors[e.path[0] as keyof typeof errors] = e.message;
				}
			});

			errors = fieldErrors;
			return; // Berhenti di sini jika ada error
		}
		// 3. Jika validasi BERHASIL (result.success adalah true)
		if (onSubmit) {
			isSubmitting = true;
			await onSubmit(result.data, rememberMe);
			isSubmitting = false; // Pastikan ini dijalankan setelah onSubmit selesai
		} else {
			console.log('Form Valid:', result.data);
		}
	}
</script>

<!-- Icon Snippets -->
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

	<!-- Global Error Alert -->
	{#if errors.global}
		<div class="border-danger/20 bg-danger/10 text-danger rounded-md border p-3 text-sm">
			{errors.global}
		</div>
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
			helperText={errors.email}
			class={errors.email ? 'border-danger focus:border-danger focus:ring-danger/10' : ''}
		/>

		<Input
			id="password"
			type="password"
			label="Password"
			placeholder="••••••••"
			leadingIcon={lockIcon}
			bind:value={password}
			disabled={loading}
			helperText={errors.password}
			class={errors.password ? 'border-danger focus:border-danger focus:ring-danger/10' : ''}
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
			type="button"
			disabled={loading}
		>
			Request a new account
		</Button>
	</div>
</form>
