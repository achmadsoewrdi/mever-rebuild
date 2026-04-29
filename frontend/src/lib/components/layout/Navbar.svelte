<script lang="ts">
	import { currentUser, clearUser } from '$lib/stores/auth.store';
	import { clickOutside } from '$lib/utils/clickOutside';
	import { cn } from '$lib/utils/cn';
	import { Menu, User, LogOut, Settings, ChevronDown, X } from 'lucide-svelte';

	// 1. Svelte 5 Runes untuk manajemen State lokal
	let isDropdownOpen = $state(false);
	let isMobileMenuOpen = $state(false);

	// 2. Mengambil data dari store (Derived Rune agar reaktif)
	const user = $derived($currentUser);

	// Karena tipe AuthResponse saat ini hanya memiliki email & role, kita ekstrak nama dari email
	const userName = $derived(user ? user.email.split('@')[0] : 'Guest');

	// 3. Handler functions
	function handleLogout() {
		clearUser();
		isDropdownOpen = false;
	}

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}
</script>

<nav
	class={cn(
		'sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors',
		'border-slate-200 bg-white/80',
		'dark:border-slate-800 dark:bg-slate-900/80'
	)}
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- ========================================== -->
			<!-- LEFT SECTION: LOGO & APP NAME              -->
			<!-- ========================================== -->
			<a href="/" class="group flex items-center gap-2.5 outline-none">
				<div
					class={cn(
						'flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white',
						'shadow-lg shadow-primary/20 transition-transform group-hover:scale-105'
					)}
				>
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						class="h-5 w-5"
					>
						<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
					</svg>
				</div>
				<span class="text-xl font-black tracking-tight text-slate-900 dark:text-white">
					MEVER<span class="text-primary">.</span>
				</span>
			</a>

			<!-- ========================================== -->
			<!-- RIGHT SECTION: USER DROPDOWN / GUEST ACTIONS-->
			<!-- ========================================== -->
			<div class="flex items-center gap-3">
				{#if user}
					<!-- USER PROFILE DROPDOWN -->
					<div class="relative" use:clickOutside={() => (isDropdownOpen = false)}>
						<!-- Trigger Button -->
						<button
							onclick={() => (isDropdownOpen = !isDropdownOpen)}
							class={cn(
								'flex items-center gap-2.5 rounded-full border border-slate-200 p-1 pl-3 transition-all outline-none',
								'hover:border-primary/50 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary',
								'dark:border-slate-800 dark:hover:bg-slate-800/50'
							)}
						>
							<div class="hidden text-right sm:block">
								<p class="text-[13px] leading-none font-bold text-slate-900 dark:text-white">
									{userName}
								</p>
								<p class="text-[10px] font-medium tracking-tighter text-slate-500 uppercase">
									{user.role}
								</p>
							</div>
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
							>
								<User size={18} />
							</div>
							<ChevronDown
								size={14}
								class={cn(
									'mr-1 text-slate-400 transition-transform',
									isDropdownOpen && 'rotate-180'
								)}
							/>
						</button>

						<!-- Dropdown Panel -->
						{#if isDropdownOpen}
							<div
								class={cn(
									'absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border bg-white p-2 shadow-xl ring-1 ring-black/5 transition-all',
									'border-slate-200 dark:border-slate-800 dark:bg-slate-900'
								)}
							>
								<!-- Header Info -->
								<div class="px-3 py-2 pb-3">
									<p class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
										Signed in as
									</p>
									<p class="truncate text-sm font-semibold text-slate-900 dark:text-white">
										{user.email}
									</p>
								</div>

								<div class="my-1 h-px bg-slate-100 dark:bg-slate-800"></div>

								<!-- Action Links -->
								<a
									href="/profile"
									class={cn(
										'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors outline-none',
										'hover:bg-slate-50 hover:text-primary focus-visible:bg-slate-50',
										'dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white'
									)}
								>
									<Settings size={16} /> Account Settings
								</a>

								<button
									onclick={handleLogout}
									class={cn(
										'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-600 transition-colors outline-none',
										'hover:bg-rose-50 focus-visible:bg-rose-50',
										'dark:text-rose-400 dark:hover:bg-rose-500/10'
									)}
								>
									<LogOut size={16} /> Sign Out
								</button>
							</div>
						{/if}
					</div>
				{/if}

				<!-- ========================================== -->
				<!-- HAMBURGER MENU (MOBILE ONLY)               -->
				<!-- ========================================== -->
				<button
					onclick={toggleMobileMenu}
					class={cn(
						'flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors outline-none lg:hidden',
						'hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary',
						'dark:text-slate-400 dark:hover:bg-slate-800'
					)}
				>
					{#if isMobileMenuOpen}
						<X size={22} />
					{:else}
						<Menu size={22} />
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- ========================================== -->
	<!-- MOBILE MENU PANEL                          -->
	<!-- ========================================== -->
	{#if isMobileMenuOpen}
		<div
			class={cn(
				'border-t border-slate-200 bg-white p-4 shadow-inner lg:hidden',
				'dark:border-slate-800 dark:bg-slate-900'
			)}
		>
			<div class="space-y-1">
				<a
					href="/dashboard"
					class="block rounded-lg px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
				>
					Dashboard
				</a>
				<a
					href="/videos"
					class="block rounded-lg px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
				>
					My Videos
				</a>
			</div>
		</div>
	{/if}
</nav>
