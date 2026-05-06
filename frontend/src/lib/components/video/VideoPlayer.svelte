<script lang="ts">
	import { untrack } from 'svelte';
	import videojs from 'video.js';
	import 'video.js/dist/video-js.css';
	import type { DebugStats } from './VideoDebugPanel.svelte';
	import { cn } from '$lib/utils/cn';

	type VideoJsPlayer = ReturnType<typeof videojs>;

	interface Props {
		src: string;
		poster?: string | null;
		videoType?: string;
		autoplay?: boolean;
		showDebug?: boolean;
		debugStats?: DebugStats;
	}

	let {
		src,
		poster,
		videoType = 'video/mp4',
		autoplay = false,
		showDebug = $bindable(false),
		debugStats = $bindable({
			bandwidth: 0,
			decodedFrames: 0,
			droppedFrames: 0,
			corruptedFrames: 0,
			loadTime: 0,
			width: 0,
			height: 0
		})
	}: Props = $props();

	// ── Debug Stats ──
	let loadStartTime = 0;
	let debugInterval: ReturnType<typeof setInterval> | null = null;

	let videoElement: HTMLVideoElement | undefined = $state();
	let playerWrapper: HTMLDivElement | undefined = $state(); // wrapper utama untuk native fullscreen
	let player: VideoJsPlayer | undefined = $state();
	let errorMessage = $state<string | null>(null);
	let isPortrait = $state(false);

	// ── Custom Control State ──
	let isPlaying = $state(false);
	let isMuted = $state(false);
	let volume = $state(1); // 0–1
	let currentTime = $state(0);
	let duration = $state(0);
	let buffered = $state(0);
	let playbackRate = $state(1);
	let showRateMenu = $state(false);
	let isFullscreen = $state(false);
	let showControls = $state(true);
	let hideTimer: ReturnType<typeof setTimeout>;

	const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];

	function formatTime(s: number) {
		if (!s || isNaN(s)) return '0:00';
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	function resetHideTimer() {
		showControls = true;
		clearTimeout(hideTimer);
		hideTimer = setTimeout(() => {
			if (isPlaying) showControls = false;
		}, 3000);
	}

	function togglePlay() {
		if (!player) return;
		if (isPlaying) {
			player.pause();
		} else {
			player.play();
		}
	}

	function toggleMute() {
		if (!player) return;
		isMuted = !isMuted;
		player.muted(isMuted);
	}

	function setVolume(v: number) {
		if (!player) return;
		volume = v;
		player.volume(v);
		if (v === 0) {
			isMuted = true;
			player.muted(true);
		} else {
			isMuted = false;
			player.muted(false);
		}
	}

	function seek(e: MouseEvent) {
		if (!player || !duration) return;
		const bar = e.currentTarget as HTMLElement;
		const rect = bar.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		player.currentTime(ratio * duration);
	}

	function setRate(r: number) {
		if (!player) return;
		playbackRate = r;
		player.playbackRate(r);
		showRateMenu = false;
	}

	// FIX: Pakai native Browser Fullscreen API pada wrapper div kita,
	// bukan player.requestFullscreen() yang hanya memfullscreen elemen internal Video.js.
	// Ini memastikan custom control bar ikut masuk ke fullscreen context.
	function toggleFullscreen() {
		if (!playerWrapper) return;
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			playerWrapper.requestFullscreen();
		}
	}

	// Sync state isFullscreen dari native fullscreenchange event
	function handleFullscreenChange() {
		isFullscreen = !!document.fullscreenElement;
	}

	// Keyboard shortcut: F = fullscreen, Space = play/pause
	function handleKeydown(e: KeyboardEvent) {
		const tag = (e.target as HTMLElement).tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA') return;
		if (e.key === 'f' || e.key === 'F') {
			e.preventDefault();
			toggleFullscreen();
		}
		if (e.key === ' ') {
			e.preventDefault();
			togglePlay();
		}
	}

	$effect(() => {
		if (!videoElement) return;
		const el = videoElement;
		const currentSrc = src;
		const currentType = videoType;

		untrack(() => {
			errorMessage = null;

			if (!player) {
				player = videojs(el, {
					autoplay,
					controls: false,
					poster: poster || undefined,
					fill: true,
					html5: {
						vhs: { overrideNative: true, enableLowInitialPlaylist: true },
						nativeAudioTracks: false,
						nativeVideoTracks: false
					}
				});

				player.on('play', () => (isPlaying = true));
				player.on('pause', () => (isPlaying = false));
				player.on('ended', () => (isPlaying = false));
				player.on('timeupdate', () => {
					currentTime = player?.currentTime() ?? 0;
					const buf = player?.buffered();
					if (buf && buf.length > 0) buffered = buf.end(buf.length - 1);
				});
				player.on('durationchange', () => {
					duration = player?.duration() ?? 0;
				});
				player.on('volumechange', () => {
					volume = player?.volume() ?? 1;
					isMuted = player?.muted() ?? false;
				});
				player.on('error', () => {
					const err = player?.error();
					if (err) errorMessage = `Gagal memutar video (CODE:${err.code}): ${err.message}`;
				});
				// Catat waktu mulai load untuk kalkulasi Load Time
				player.on('loadstart', () => {
					loadStartTime = performance.now();
				});
				player.on('loadeddata', () => {
					debugStats.loadTime = Math.round(performance.now() - loadStartTime);
					const w = videoElement?.videoWidth ?? 0;
					const h = videoElement?.videoHeight ?? 0;
					debugStats.width = w;
					debugStats.height = h;
					// Deteksi orientasi video (TikTok/Reels style jika tinggi > lebar)
					isPortrait = h > w;
				});
			}

			if (currentSrc && player) {
				player.src({ src: currentSrc, type: currentType });
				player.load();
			}
		});

		return () => {
			if (player) {
				player.dispose();
				player = undefined;
			}
		};
	});

	// Daftarkan native fullscreenchange listener di level document
	$effect(() => {
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	// Poll debug stats setiap 1 detik saat panel terbuka
	$effect(() => {
		if (!showDebug) {
			if (debugInterval) {
				clearInterval(debugInterval);
				debugInterval = null;
			}
			return;
		}
		// Jalankan sekali langsung, lalu interval
		function collectStats() {
			if (!player || !videoElement) return;
			// Bandwidth dari VHS (Video.js HLS/DASH engine)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const tech = (player as any).tech(true);
			const bw = tech?.vhs?.bandwidth ?? tech?.hls?.bandwidth ?? 0;
			debugStats.bandwidth = bw;
			// Frame quality dari native HTML5 API
			const quality = videoElement.getVideoPlaybackQuality?.();
			if (quality) {
				debugStats.decodedFrames = quality.totalVideoFrames;
				debugStats.droppedFrames = quality.droppedVideoFrames;
				debugStats.corruptedFrames = quality.corruptedVideoFrames;
			}
			// Dimensi video aktual
			debugStats.width = videoElement.videoWidth;
			debugStats.height = videoElement.videoHeight;
		}
		collectStats();
		debugInterval = setInterval(collectStats, 1000);
		return () => {
			if (debugInterval) {
				clearInterval(debugInterval);
				debugInterval = null;
			}
		};
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={playerWrapper}
	class={cn(
		'vjs-custom-skin group relative mx-auto overflow-hidden bg-black transition-all duration-700 ease-out',
		isPortrait
			? 'aspect-9/16 max-h-[75vh] w-full max-w-sm rounded-2xl shadow-2xl ring-1 ring-white/10 md:my-6'
			: 'aspect-video w-full'
	)}
	onmousemove={resetHideTimer}
	onmouseleave={() => {
		if (isPlaying) showControls = false;
	}}
>
	{#if errorMessage}
		<div class="flex aspect-video w-full items-center justify-center bg-slate-950 p-6">
			<div class="flex flex-col items-center gap-3 text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-12 w-12 text-rose-500"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
				<p class="text-sm font-medium text-slate-400">{errorMessage}</p>
				<button
					class="mt-1 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
					onclick={() => {
						errorMessage = null;
						if (player && src) {
							player.src({ src, type: videoType });
							player.load();
						}
					}}
				>
					Coba Lagi
				</button>
			</div>
		</div>
	{/if}

	<!-- Video Element -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div data-vjs-player class="w-full cursor-pointer" onclick={togglePlay}>
		<video
			bind:this={videoElement}
			class="video-js vjs-big-play-centered"
			poster={poster || undefined}
		></video>
	</div>

	<!-- Big Play Button (center) -->
	{#if !isPlaying}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="pointer-events-none absolute inset-0 flex items-center justify-center"
			onclick={togglePlay}
		>
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-black/45 backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:border-white/70 hover:bg-black/65"
			>
				<svg class="ml-1 h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z" />
				</svg>
			</div>
		</div>
	{/if}

	<!-- ── CUSTOM CONTROL BAR ── -->
	<div
		class="absolute right-0 bottom-0 left-0 flex flex-col gap-0 transition-all duration-300 {showControls ||
		!isPlaying
			? 'translate-y-0 opacity-100'
			: 'translate-y-2 opacity-0'}"
	>
		<!-- Progress Bar -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="group/bar relative mx-3 mb-1 h-1 cursor-pointer rounded-full bg-white/20 transition-all duration-150 hover:h-[5px]"
			onclick={seek}
		>
			<!-- Buffered -->
			<div
				class="absolute inset-y-0 left-0 rounded-full bg-white/20"
				style="width: {duration ? (buffered / duration) * 100 : 0}%"
			></div>
			<!-- Played -->
			<div
				class="absolute inset-y-0 left-0 rounded-full bg-rose-500"
				style="width: {duration ? (currentTime / duration) * 100 : 0}%"
			>
				<!-- Scrubber dot -->
				<div
					class="absolute top-1/2 right-0 h-3 w-3 translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500 opacity-0 shadow transition-opacity group-hover/bar:opacity-100"
				></div>
			</div>
		</div>

		<!-- Controls Row -->
		<div
			class="flex items-center gap-1 bg-linear-to-t from-black/80 via-black/50 to-transparent px-3 pt-1 pb-2"
		>
			<!-- Play/Pause -->
			<button
				onclick={togglePlay}
				class="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
			>
				{#if isPlaying}
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
					</svg>
				{:else}
					<svg class="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M8 5v14l11-7z" />
					</svg>
				{/if}
			</button>

			<!-- Volume -->
			<div class="group/vol flex items-center gap-1">
				<button
					onclick={toggleMute}
					class="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
				>
					{#if isMuted || volume === 0}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18l1.98 2L21 18.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"
							/>
						</svg>
					{:else if volume < 0.5}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
							/>
						</svg>
					{:else}
						<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
							<path
								d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
							/>
						</svg>
					{/if}
				</button>
				<!-- Volume Slider — expand on hover -->
				<div
					class="flex w-0 items-center overflow-hidden transition-all duration-200 group-hover/vol:w-20"
				>
					<input
						type="range"
						min="0"
						max="1"
						step="0.05"
						value={isMuted ? 0 : volume}
						oninput={(e) => setVolume(parseFloat((e.target as HTMLInputElement).value))}
						class="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-rose-500"
					/>
				</div>
			</div>

			<!-- Time -->
			<span class="ml-1 text-xs text-white/70 tabular-nums">
				{formatTime(currentTime)} / {formatTime(duration)}
			</span>

			<!-- Spacer -->
			<div class="flex-1"></div>

			<!-- Playback Rate -->
			<div class="relative">
				<button
					onclick={() => {
						showRateMenu = !showRateMenu;
					}}
					class="flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 text-xs font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
				>
					{playbackRate}x
				</button>
				{#if showRateMenu}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div
						class="absolute right-0 bottom-full mb-2 overflow-hidden rounded-xl border border-white/10 bg-black/90 py-1 shadow-xl backdrop-blur-md"
						onclick={(e) => e.stopPropagation()}
					>
						{#each rates as r (r)}
							<button
								onclick={() => setRate(r)}
								class="flex w-full items-center justify-between gap-4 px-4 py-1.5 text-xs font-medium transition hover:bg-white/10 {playbackRate ===
								r
									? 'text-rose-400'
									: 'text-white/80'}"
							>
								{r}x
								{#if playbackRate === r}
									<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24"
										><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg
									>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Fullscreen -->
			<button
				onclick={toggleFullscreen}
				class="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
			>
				{#if isFullscreen}
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
						/>
					</svg>
				{:else}
					<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- Click outside rate menu to close -->
	{#if showRateMenu}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="fixed inset-0 z-10" onclick={() => (showRateMenu = false)}></div>
	{/if}
</div>

<style>
	:global(.vjs-custom-skin .video-js) {
		background-color: #000 !important;
	}
	:global(.vjs-custom-skin .vjs-tech) {
		object-fit: contain !important;
	}
	:global(.vjs-custom-skin .vjs-control-bar) {
		display: none !important;
	}
	:global(.vjs-custom-skin .vjs-big-play-button) {
		display: none !important;
	}

	/* FIX FULLSCREEN: Pastikan wrapper mengisi seluruh layar saat fullscreen,
	   sehingga custom control bar tetap terlihat di atas video */
	.vjs-custom-skin:fullscreen {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
	/* Prefixed untuk Safari */
	.vjs-custom-skin:-webkit-full-screen {
		width: 100vw;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
	:global(.vjs-custom-skin:fullscreen .video-js),
	:global(.vjs-custom-skin:-webkit-full-screen .video-js) {
		width: 100% !important;
		height: 100% !important;
		flex: 1;
	}

	/* Custom range input styling */
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #f43f5e;
		cursor: pointer;
	}
	input[type='range']::-moz-range-thumb {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #f43f5e;
		border: none;
		cursor: pointer;
	}
</style>
