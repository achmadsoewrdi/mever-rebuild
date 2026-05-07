<script lang="ts">
	import { Sun, Moon, ChevronDown, User, LogOut } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import meverLogo from '$lib/assets/image.png';

	// Import UI Component
	import Button from '$lib/components/ui/Button.svelte';

	interface Props {
		userName?: string;
	}

	let { userName = 'ISR Guest' }: Props = $props();

	let userInitials = $derived(
		userName
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.substring(0, 2)
	);

	let isDropdownOpen = $state(false);
	let isDarkMode = $state(false);

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		if (isDarkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	function handleLogout() {
		document.cookie = 'auth_token=; path=/; max-age=0;';
		window.location.href = '/auth/login';
	}
</script>

<svelte:window onclick={() => (isDropdownOpen = false)} />

<nav
	class="flex h-16 w-full items-center justify-between border-b-2 border-slate-200 bg-white px-6 dark:border-border-base/50 dark:bg-bg-secondary"
>
	<div class="flex items-center">
		<img src={meverLogo} alt="MEVER Logo" class="h-10 w-auto" />
	</div>

	<!-- Kanan: Aksi (Profile & Theme) -->
	<div class="flex items-center gap-3">
		<!-- 1. Dropdown Profil User -->
		<div class="relative">
			<!-- Tombol Trigger Profil (Bentuk Pil) -->
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					isDropdownOpen = !isDropdownOpen;
				}}
				class="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white pr-3 pl-1 transition-colors hover:bg-slate-50 dark:border-bg-surface dark:bg-bg-secondary dark:hover:bg-bg-surface"
			>
				<!-- Avatar Inisial -->
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full border border-primary bg-primary/15 text-[11px] font-bold text-primary"
				>
					{userInitials}
				</div>
				<span class="ml-1 text-sm font-medium text-slate-700 dark:text-slate-200">{userName}</span>
				<ChevronDown
					size={14}
					class="text-slate-400 transition-transform {isDropdownOpen ? 'rotate-180' : ''}"
				/>
			</button>

			<!-- Isi Dropdown -->
			{#if isDropdownOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					transition:slide={{ duration: 200 }}
					onclick={(e) => e.stopPropagation()}
					class="absolute top-12 right-0 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-border-base dark:bg-bg-elevated"
				>
					<div class="flex flex-col gap-1">
						<Button
							variant="ghost"
							href="/dashboard/settings"
							onclick={() => (isDropdownOpen = false)}
							class="w-full justify-start gap-3 px-3"
						>
							<User size={16} />
							Edit Profile
						</Button>

						<div class="mx-2 border-t border-slate-100 dark:border-slate-700/50"></div>
						<Button
							variant="ghost"
							onclick={handleLogout}
							class="hover:text-danger dark:hover:bg-danger/20 w-full justify-start gap-3 px-3 text-red-500 hover:bg-red-500 hover:text-white"
						>
							<LogOut size={16} />
							Logout
						</Button>
					</div>
				</div>
			{/if}
		</div>

		<!-- 2. Tombol Toggle Tema -->
		<button
			type="button"
			onclick={toggleTheme}
			class="flex h-10 w-[72px] items-center justify-between rounded-full border border-slate-200 bg-white p-1 transition-colors dark:border-bg-elevated dark:bg-bg-secondary"
		>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 {isDarkMode
					? 'text-slate-400'
					: 'bg-primary text-white'}"
			>
				<Sun size={15} strokeWidth={isDarkMode ? 2 : 2.5} />
			</div>
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 {isDarkMode
					? 'bg-slate-700 text-white'
					: 'text-slate-400'}"
			>
				<Moon size={15} strokeWidth={isDarkMode ? 2.5 : 2} />
			</div>
		</button>
	</div>
</nav>
