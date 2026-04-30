import { videoApi } from '$lib/api/videos.api';
import type { Video, VideoAsset } from '$lib/types/video.types';
import { SvelteSet } from 'svelte/reactivity';

type TagVariant = 'dash' | 'mp4' | 'h264' | 'hevc' | 'default';

export class VideoAssetManager {
	getVideo: () => Video;
	fetchedAssets = $state<VideoAsset[]>([]);

	constructor(getVideo: () => Video) {
		this.getVideo = getVideo;

		$effect(() => {
			const currentVideo = this.video;
			if (currentVideo && (!currentVideo.assets || currentVideo.assets.length === 0)) {
				videoApi
					.getVideoAssets(currentVideo.id)
					.then((res) => {
						if (res.data) {
							this.fetchedAssets = res.data;
						}
					})
					.catch((err) => console.error('Gagal memuat assets:', err));
			}
		});
	}

	get video() {
		return this.getVideo();
	}

	get assets() {
		return this.video?.assets?.length ? this.video.assets : this.fetchedAssets;
	}

	get uniqueCodecs() {
		return [...new SvelteSet(this.assets.map((a) => a.codec))];
	}

	get uniqueFormats() {
		return [...new SvelteSet(this.assets.map((a) => a.format))];
	}

	get highestResolution() {
		if (this.assets.length === 0) return null;
		const resList = this.assets.map((a) => a.resolution);
		if (resList.includes('2160p') || resList.includes('4K')) return '4K';
		if (resList.includes('1440p')) return '1440p';
		if (resList.includes('1080p')) return '1080p';
		if (resList.includes('720p')) return '720p';
		if (resList.includes('480p')) return '480p';
		return resList[0] || null;
	}

	// Helper terpusat agar tidak mengulang logika di setiap komponen
	static getTagVariant(label: string): TagVariant {
		const valid: TagVariant[] = ['dash', 'mp4', 'h264', 'hevc'];
		return valid.includes(label as TagVariant) ? (label as TagVariant) : 'default';
	}
}
