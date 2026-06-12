<script lang="ts">
	import { page } from '$app/state';
	import { LayoutDashboard, Film, Users, Sliders, Settings, HardDrive, UserPlus } from 'lucide-svelte';
	import logoImage from '$lib/assets/image.png';

	function isActive(path: string) {
		return (page.url.pathname as string).startsWith(path);
	}
	function isExactActive(path: string) {
		return (page.url.pathname as string) === path;
	}
</script>

<aside class="flex h-full w-64 flex-col border-r border-slate-200 bg-white text-text-main dark:border-border-base/50 dark:bg-bg-secondary">
	<div class="flex flex-col items-center justify-center border-b border-border-base px-6 py-8">
		<img src={logoImage} alt="Mever Logo" class="h-10 w-auto object-contain" />
		<p class="mt-2 text-[10px] font-bold tracking-[3px] text-slate-400 uppercase">
			Admin Dashboard
		</p>
	</div>

	<!-- Navigation Links -->
	<div class="flex flex-1 flex-col justify-between px-4 py-6">
		<!-- Menu Utama -->
		<nav class="space-y-2">
			<!-- Dashboard -->
			<a
				href="/admin"
				class="relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
				{isExactActive('/admin')
					? 'bg-[#FF1E4D] text-white'
					: 'text-slate-600 hover:bg-slate-50 dark:text-text-muted dark:hover:bg-bg-elevated'}"
			>
				{#if isExactActive('/admin')}
					<div class="absolute top-2 bottom-2 left-2 w-1 rounded-full bg-white"></div>
				{/if}
				<LayoutDashboard size={20} />
				Dashboard
			</a>

			<!-- Video Library -->
			<a
				href="/admin/videos"
				class="relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
				{isActive('/admin/videos')
					? 'bg-[#FF1E4D] text-white'
					: 'text-slate-600 hover:bg-slate-50 dark:text-text-muted dark:hover:bg-bg-elevated'}"
			>
				{#if isActive('/admin/videos')}
					<div class="absolute top-2 bottom-2 left-2 w-1 rounded-full bg-white"></div>
				{/if}
				<Film size={20} />
				Video Library
			</a>

			<!-- User Management -->
			<a
				href="/admin/users"
				class="relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
				{isActive('/admin/users')
					? 'bg-[#FF1E4D] text-white'
					: 'text-slate-600 hover:bg-slate-50 dark:text-text-muted dark:hover:bg-bg-elevated'}"
			>
				{#if isActive('/admin/users')}
					<div class="absolute top-2 bottom-2 left-2 w-1 rounded-full bg-white"></div>
				{/if}
				<Users size={20} />
				User Management
			</a>

			<!-- Account Requests -->
			<a
				href="/admin/account-requests"
				class="relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
				{isActive('/admin/account-requests')
					? 'bg-[#FF1E4D] text-white'
					: 'text-slate-600 hover:bg-slate-50 dark:text-text-muted dark:hover:bg-bg-elevated'}"
			>
				{#if isActive('/admin/account-requests')}
					<div class="absolute top-2 bottom-2 left-2 w-1 rounded-full bg-white"></div>
				{/if}
				<UserPlus size={20} />
				Account Requests
			</a>

			<!-- Transcode Jobs -->
			<a
				href="/admin/transcoder"
				class="relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
				{isActive('/admin/transcoder')
					? 'bg-[#FF1E4D] text-white'
					: 'text-slate-600 hover:bg-slate-50 dark:text-text-muted dark:hover:bg-bg-elevated'}"
			>
				{#if isActive('/admin/transcoder')}
					<div class="absolute top-2 bottom-2 left-2 w-1 rounded-full bg-white"></div>
				{/if}
				<Sliders size={20} />
				Transcode Jobs
			</a>

			<!-- Quality Preset Management -->
			<a
				href="/admin/presets"
				class="relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
				{isActive('/admin/presets')
					? 'bg-[#FF1E4D] text-white'
					: 'text-slate-600 hover:bg-slate-50 dark:text-text-muted dark:hover:bg-bg-elevated'}"
			>
				{#if isActive('/admin/presets')}
					<div class="absolute top-2 bottom-2 left-2 w-1 rounded-full bg-white"></div>
				{/if}
				<Settings size={20} />
				Quality Presets
			</a>

			<!-- Storage Config -->
			<a
				href="/admin/storage"
				class="relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
				{isActive('/admin/storage')
					? 'bg-[#FF1E4D] text-white'
					: 'text-slate-600 hover:bg-slate-50 dark:text-text-muted dark:hover:bg-bg-elevated'}"
			>
				{#if isActive('/admin/storage')}
					<div class="absolute top-2 bottom-2 left-2 w-1 rounded-full bg-white"></div>
				{/if}
				<HardDrive size={20} />
				Storage Config
			</a>
		</nav>

		<!-- Menu Bawah -->
		
	</div>
</aside>
