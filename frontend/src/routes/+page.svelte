<script lang="ts">
	import { onMount } from 'svelte';
	import { Upload, Play, Shield, Users, Settings, Moon, Sun, ChevronRight, Zap, ArrowRight, Film, Radio, Layers, FileVideo, Cpu, Sparkles, Server } from 'lucide-svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	// import Tag from '$lib/components/ui/Tag.svelte';
	import meverLogo from '$lib/assets/image.png';

	// --- Dark mode -------------------------------------------------------
	// Fixed to actually flip the `.dark` class on <html>, since that's what
	// your `@variant dark (&:where(.dark, .dark *))` rule reads. The old
	// context toggle likely only flipped a boolean without touching the DOM.
	// Move this same logic into your root layout/store if other pages share
	// the same broken toggle.
	let isDark = $state(false);
	let scrolled = $state(false);

	onMount(() => {
		const stored = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		isDark = stored ? stored === 'dark' : prefersDark;
		document.documentElement.classList.toggle('dark', isDark);

		const onScroll = () => (scrolled = window.scrollY > 32);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function toggleTheme() {
		isDark = !isDark;
		document.documentElement.classList.toggle('dark', isDark);
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
	}

	// --- Scroll reveal -----------------------------------------------------
	// Elements start with `opacity-0 translate-y-6` in markup; this action
	// removes those two classes once the element enters the viewport. Motion
	// itself is skipped for reduced-motion users via the `motion-reduce:`
	// utility already present in the markup, so no JS branching is needed.
function reveal(node: HTMLElement, options?: { remove?: string[] }) {
	const removeClasses = options?.remove ?? ['opacity-0', 'translate-y-6'];
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.remove(...removeClasses);
					observer.unobserve(node);
				}
			}
		},
		{ threshold: 0.15 }
	);
	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}

	const features = [
		{
			icon: Upload,
			title: 'Upload & Transcoding',
			desc: 'Unggah video dalam format apapun. FFmpeg dan BullMQ memprosesnya otomatis ke beberapa kualitas.',
			tags: ['FFmpeg', 'Antrian Otomatis']
		},
		{
			icon: Play,
			title: 'Adaptive Streaming HLS',
			desc: 'Nginx VOD Module menyesuaikan kualitas video secara real-time mengikuti kecepatan koneksi penonton.',
			tags: ['HLS', 'Bitrate Adaptif']
		},
		{
			icon: Shield,
			title: 'Keamanan MFA Wajib',
			desc: 'Login dengan JWT dan verifikasi TOTP. Trusted Device 7 hari agar tidak perlu verifikasi berulang.',
			tags: ['TOTP', 'JWT']
		},
		{
			icon: Users,
			title: 'Manajemen Pengguna',
			desc: 'Setiap akun baru melalui persetujuan Admin, lengkap dengan notifikasi email otomatis.',
			tags: ['Approval Flow', 'Email Alert']
		},
		{
			icon: Settings,
			title: 'Admin Panel Lengkap',
			desc: 'Kelola pengguna, video, preset kualitas, dan storage dari satu dashboard yang sama.',
			tags: ['Dashboard', 'Job Monitor']
		},
		{
			icon: Moon,
			title: 'Dark Mode & PWA',
			desc: 'Nyaman dipakai siang atau malam, dan bisa dipasang sebagai aplikasi di perangkat apapun.',
			tags: ['PWA', 'Offline Ready']
		}
	];

	const steps = [
		{
			num: '01',
			title: 'Request & Verifikasi Akun',
			desc: 'Isi formulir request akun. Admin meninjau dan menyetujui, lalu kamu menerima notifikasi lewat email.'
		},
		{
			num: '02',
			title: 'Login & Aktifkan MFA',
			desc: 'Masuk dengan kredensial kamu, lalu pindai kode QR di aplikasi TOTP untuk mengaktifkan verifikasi dua langkah.'
		},
		{
			num: '03',
			title: 'Upload & Langsung Streaming',
			desc: 'Unggah video sekali klik. Transcoding berjalan di background, dan video siap ditonton lewat HLS.'
		}
	];
</script>

<svelte:head>
	<title>MEVER — Platform Video Streaming Internal</title>
	<meta
		name="description"
		content="Platform video streaming internal berbasis HLS dengan autentikasi MFA, transcoding otomatis, dan manajemen pengguna terpusat."
	/>
</svelte:head>

<!-- NAVBAR -->
<header
	class="fixed inset-x-0 top-0 z-50 transition-all duration-300 {scrolled
		? 'bg-bg-primary/60 shadow-sm backdrop-blur-xl backdrop-saturate-150'
		: 'bg-transparent backdrop-blur-none'}"
>
	<div class="mx-auto flex h-16 max-w-8xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<a href="/" class="flex items-center gap-2.5 select-none">
			<img src={meverLogo} alt="MEVER Logo" class="h-8 w-auto" />
		</a>
		<div class="flex items-center gap-2">
			<button
				onclick={toggleTheme}
				class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border-base bg-transparent text-text-sub transition-all duration-200 hover:bg-bg-surface hover:text-text-main active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
				aria-label="Ganti mode tampilan"
			>
				<span class="inline-flex transition-transform duration-300 {isDark ? 'rotate-180' : 'rotate-0'}">
					{#if isDark}
						<Sun size={18} />
					{:else}
						<Moon size={18} />
					{/if}
				</span>
			</button>
			<Button variant="outline" href="/auth/login">Login</Button>
			<Button variant="primary" href="/auth/request-account">Request Account</Button>
		</div>
	</div>
</header>

<!-- HERO -->
<section class="relative overflow-hidden bg-linear-to-b from-bg-secondary to-bg-primary py-24 sm:py-32">
	<div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
		<div
			class="absolute -top-40 left-1/2 h-125 w-125 -translate-x-1/2 rounded-full bg-primary-muted blur-3xl motion-safe:animate-[pulse_7s_ease-in-out_infinite]"
		></div>
		<div
			class="absolute -right-32 top-20 h-87.5 w-87.5 rounded-full bg-primary-muted blur-3xl motion-safe:animate-[pulse_9s_ease-in-out_infinite]"
		></div>
	</div>
	<div class="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
		<div class="mb-6 flex justify-center">
			<Badge label="Platform Internal · ISR" />
		</div>
		<h1 class="text-4xl font-black tracking-tight text-text-main sm:text-5xl lg:text-6xl">
			Streaming Video Internal,<br />
			<span class="text-primary">Cepat &amp; Aman</span>
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-sub">
			Platform video streaming berbasis HLS untuk kebutuhan internal perusahaan. Dengan transcoding
			otomatis, MFA wajib, dan manajemen pengguna terpusat — streaming jadi lebih mudah dan aman.
		</p>
		<div class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
			<Button variant="primary" href="/auth/login" size="lg">
				<span class="flex items-center gap-2">
					Mulai Streaming
					<ChevronRight size={18} class="transition-transform duration-200 group-hover:translate-x-1" />
				</span>
			</Button>
			<Button variant="outline" href="/auth/register" size="lg">Request Akses</Button>
		</div>
		<div class="mt-16 grid grid-cols-3 gap-6 border-t border-border-base pt-10 sm:gap-12">
			<div class="space-y-1 transition-transform duration-300 hover:-translate-y-1">
				<p class="text-3xl font-black text-primary sm:text-4xl">HLS</p>
				<p class="text-sm text-text-sub">Adaptive Streaming</p>
			</div>
			<div class="space-y-1 transition-transform duration-300 hover:-translate-y-1">
				<p class="text-3xl font-black text-primary sm:text-4xl">Auto</p>
				<p class="text-sm text-text-sub">Transcoding FFmpeg</p>
			</div>
			<div class="space-y-1 transition-transform duration-300 hover:-translate-y-1">
				<p class="text-3xl font-black text-primary sm:text-4xl">MFA</p>
				<p class="text-sm text-text-sub">TOTP Security</p>
			</div>
		</div>
	</div>
</section>

<!-- FEATURES -->
<section class="py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div
			class="mx-auto mb-14 max-w-2xl text-center opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
			use:reveal
		>
			<p class="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Fitur Utama</p>
			<h2 class="text-3xl font-black tracking-tight text-text-main sm:text-4xl">Semua yang kamu butuhkan</h2>
			<p class="mt-4 text-base text-text-sub">
				Dirancang untuk kebutuhan video internal yang membutuhkan kecepatan, keamanan, dan kemudahan pengelolaan.
			</p>
		</div>
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature, i (feature.title)}
				<div
					class="group rounded-lg border border-border-base bg-bg-elevated p-6 opacity-0 translate-y-6 transition-all duration-700 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
					style="transition-delay: {i * 60}ms"
					use:reveal
				>
					<div
						class="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary-muted text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white"
					>
						<feature.icon size={22} />
					</div>
					<h3 class="mb-2 text-base font-bold text-text-main">{feature.title}</h3>
					<p class="text-sm leading-relaxed text-text-sub">{feature.desc}</p>
					<div
						class="flex max-h-0 flex-wrap gap-1.5 overflow-hidden opacity-0 transition-all duration-300 group-hover:mt-3 group-hover:max-h-12 group-hover:opacity-100"
					>
						{#each feature.tags as tag (tag)}
							<span class="rounded-full border border-border-base bg-bg-surface px-2.5 py-0.5 text-xs text-text-sub">
								{tag}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- HOW IT WORKS -->
<section class="bg-bg-secondary py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div
			class="mx-auto mb-20 max-w-2xl text-center opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
			use:reveal
		>
			<p class="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Cara Kerja</p>
			<h2 class="text-3xl font-black tracking-tight text-text-main sm:text-4xl">Mulai dalam 3 langkah</h2>
			<p class="mt-4 text-base text-text-sub">Dari request akun hingga siap streaming hanya butuh beberapa menit.</p>
		</div>

		<div class="relative grid grid-cols-1 gap-14 lg:grid-cols-3 lg:gap-10">
			<!-- garis vertikal, tampil di mobile saja -->
			<div
				class="absolute top-14 bottom-14 left-7 w-px origin-top scale-y-0 bg-linear-to-b from-primary/40 to-transparent transition-transform duration-1000 ease-out motion-reduce:scale-y-100 lg:hidden"
				use:reveal={{ remove: ['scale-y-0'] }}
				aria-hidden="true"
			></div>
			<!-- garis horizontal, tampil di desktop, "menggambar" dari kiri ke kanan -->
			<div
				class="absolute left-0 right-0 top-7 hidden h-px origin-left scale-x-0 bg-linear-to-r from-primary/40 via-primary/20 to-transparent transition-transform duration-1000 ease-out motion-reduce:scale-x-100 lg:block"
				use:reveal={{ remove: ['scale-x-0'] }}
				aria-hidden="true"
			></div>

			{#each steps as step, i (step.num)}
				<div
					class="group relative flex flex-col items-start opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
					style="transition-delay: {i * 150}ms"
					use:reveal
				>
					<span
						class="pointer-events-none absolute -top-3 right-0 select-none text-7xl font-black text-primary/5 transition-colors duration-300 group-hover:text-primary/10 lg:-top-5 lg:text-8xl"
						aria-hidden="true"
					>
						{step.num}
					</span>
					<div
						class="relative mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-bg-primary text-lg font-black text-primary shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:border-primary"
					>
						{step.num}
					</div>
					<h3 class="mb-2 text-lg font-bold text-text-main">{step.title}</h3>
					<p class="text-sm leading-relaxed text-text-sub">{step.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>	

<!-- FORMAT SUPPORT -->
<section class="py-20 sm:py-28">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div
			class="mx-auto mb-14 max-w-2xl text-center opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
			use:reveal
		>
			<p class="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Kompatibilitas</p>
			<h2 class="text-3xl font-black tracking-tight text-text-main sm:text-4xl">Format & teknologi yang didukung</h2>
			<p class="mt-4 text-base text-text-sub">
				Dari protokol streaming sampai codec video, semuanya sudah disiapkan agar kompatibel di berbagai perangkat.
			</p>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
			<!-- HLS — kartu utama, 2x2 -->
			<div
				class="group relative overflow-hidden rounded-xl border border-border-base bg-bg-elevated p-6 opacity-0 translate-y-6 transition-all duration-700 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 sm:col-span-2 lg:col-span-2 lg:row-span-2"
				use:reveal
			>
				<div class="flex items-start justify-between">
					<div class="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary-muted text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
						<Radio size={24} />
					</div>
					<span class="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Format Utama</span>
				</div>
				<h3 class="mt-5 text-xl font-black text-text-main">HLS</h3>
				<p class="mt-2 max-w-sm text-sm leading-relaxed text-text-sub">
					HTTP Live Streaming — kualitas video menyesuaikan otomatis mengikuti kecepatan koneksi penonton, secara real-time.
				</p>
				<div class="mt-6 flex h-8 items-end gap-1.5" aria-hidden="true">
					<span class="w-2 rounded-full bg-primary/70 motion-safe:animate-pulse" style="height: 55%; animation-delay: 0ms"></span>
					<span class="w-2 rounded-full bg-primary/70 motion-safe:animate-pulse" style="height: 100%; animation-delay: 150ms"></span>
					<span class="w-2 rounded-full bg-primary/70 motion-safe:animate-pulse" style="height: 40%; animation-delay: 300ms"></span>
					<span class="w-2 rounded-full bg-primary/70 motion-safe:animate-pulse" style="height: 80%; animation-delay: 450ms"></span>
					<span class="w-2 rounded-full bg-primary/70 motion-safe:animate-pulse" style="height: 60%; animation-delay: 600ms"></span>
				</div>
			</div>

			<!-- DASH -->
			<div
				class="group rounded-xl border border-border-base bg-bg-elevated p-6 opacity-0 translate-y-6 transition-all duration-700 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
				style="transition-delay: 60ms"
				use:reveal
			>
				<div class="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-muted text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
					<Layers size={20} />
				</div>
				<h3 class="mt-4 text-base font-bold text-text-main">DASH</h3>
				<p class="mt-1.5 text-sm leading-relaxed text-text-sub">Alternatif adaptive streaming, kompatibel lintas platform.</p>
			</div>

			<!-- MP4 -->
			<div
				class="group rounded-xl border border-border-base bg-bg-elevated p-6 opacity-0 translate-y-6 transition-all duration-700 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
				style="transition-delay: 120ms"
				use:reveal
			>
				<div class="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-muted text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
					<FileVideo size={20} />
				</div>
				<h3 class="mt-4 text-base font-bold text-text-main">MP4</h3>
				<p class="mt-1.5 text-sm leading-relaxed text-text-sub">Kontainer video universal, didukung hampir semua perangkat.</p>
			</div>

			<!-- H.264 -->
			<div
				class="group rounded-xl border border-border-base bg-bg-elevated p-6 opacity-0 translate-y-6 transition-all duration-700 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
				style="transition-delay: 180ms"
				use:reveal
			>
				<div class="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-muted text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
					<Cpu size={20} />
				</div>
				<h3 class="mt-4 text-base font-bold text-text-main">H.264</h3>
				<p class="mt-1.5 text-sm leading-relaxed text-text-sub">Codec standar industri dengan kompatibilitas paling luas.</p>
			</div>

			<!-- HEVC -->
			<div
				class="group rounded-xl border border-border-base bg-bg-elevated p-6 opacity-0 translate-y-6 transition-all duration-700 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
				style="transition-delay: 240ms"
				use:reveal
			>
				<div class="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-muted text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
					<Sparkles size={20} />
				</div>
				<h3 class="mt-4 text-base font-bold text-text-main">HEVC</h3>
				<p class="mt-1.5 text-sm leading-relaxed text-text-sub">Codec H.265, ukuran file lebih kecil dengan kualitas setara.</p>
			</div>

			<!-- Powered by — bar lebar penuh -->
			<div
				class="flex flex-col items-center justify-between gap-4 rounded-xl border border-border-base bg-bg-surface p-6 opacity-0 translate-y-6 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 sm:col-span-2 sm:flex-row lg:col-span-4"
				style="transition-delay: 300ms"
				use:reveal
			>
				<div class="flex items-center gap-3">
					<div class="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Server size={18} />
					</div>
					<p class="text-sm text-text-sub">
						<span class="font-bold text-text-main">Powered by</span> FFmpeg untuk transcoding otomatis, disajikan lewat Nginx VOD Module.
					</p>
				</div>
				<div class="flex items-center gap-2 text-primary">
					<Zap size={14} />
					<span class="text-xs font-semibold uppercase tracking-widest">Full Automated Pipeline</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA BANNER -->
<section class="py-16 sm:py-20">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div
			class="relative overflow-hidden rounded-2xl bg-primary px-8 py-14 text-center opacity-0 translate-y-6 transition-all duration-700 ease-out sm:px-16 motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0"
			use:reveal
		>
			<div class="pointer-events-none absolute -top-10 -right-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" aria-hidden="true"></div>
			<div class="pointer-events-none absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" aria-hidden="true"></div>
			<div class="relative">
				<div class="mb-3 flex justify-center">
					<Film size={36} class="text-white/80" />
				</div>
				<h2 class="text-3xl font-black tracking-tight text-white sm:text-4xl">Siap bergabung?</h2>
				<p class="mx-auto mt-4 max-w-xl text-base text-white/80">
					Ajukan request akun sekarang dan nikmati pengalaman streaming video internal yang cepat, aman, dan profesional.
				</p>
				<div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
					<Button variant="outline" href="/auth/register" size="lg" class="border-white/60 bg-white/10 text-white hover:bg-white/20">
						<span class="flex items-center gap-2">Request Account <ArrowRight size={18} /></span>
					</Button>
					<Button variant="ghost" href="/auth/login" size="lg" class="text-white/80 hover:bg-white/10 hover:text-white">
						Sudah punya akun? Login
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- FOOTER -->
<footer class="border-t border-border-base bg-bg-primary py-10">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
			<div class="flex items-center gap-3">
				<img src={meverLogo} alt="MEVER" class="h-6 w-auto opacity-80" />
				<span class="text-sm text-text-muted">© 2025 MEVER · ISR Internal Platform</span>
			</div>
			<nav class="flex items-center gap-5 text-sm text-text-muted">
				<a href="/auth/login" class="relative transition-colors hover:text-text-main after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
					Login
				</a>
				<a href="/auth/register" class="relative transition-colors hover:text-text-main after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
					Request Akun
				</a>
				<span>·</span>
				<span class="text-xs">Built with SvelteKit</span>
			</nav>
		</div>
	</div>
</footer>