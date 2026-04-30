import { videoApi } from '$lib/api/videos.api';
import type { RequestUploadDto, Video } from '$lib/types/video.types';
import { isAxiosError } from 'axios';

/**
 * Manager untuk menangani siklus hidup upload video.
 * Menggunakan Svelte 5 Runes untuk reaktivitas yang efisien.
 */
export class VideoUploader {
	// Status reaktif
	status = $state<'idle' | 'requesting' | 'uploading' | 'confirming' | 'success' | 'error'>('idle');
	progress = $state(0);
	errorMessage = $state<string | null>(null);
	result = $state<Video | null>(null);

	/**
	 * Fungsi utama untuk menjalankan alur upload 3-tahap.
	 */
	async upload(file: File, metadata: Omit<RequestUploadDto, 'originalName' | 'fileSizeBytes'>) {
		this.reset();
		this.status = 'requesting';

		try {
			// 1. Request Presigned URL dari Backend
			const { data: uploadInfo } = await videoApi.requestUpload({
				...metadata,
				originalName: file.name,
				fileSizeBytes: file.size
			});

			const { uploadUrl, video } = uploadInfo;
			this.result = video;

			// 2. Upload langsung ke MinIO (Direct Upload)
			this.status = 'uploading';
			await videoApi.uploadFileToStorage(uploadUrl, file, (percent) => {
				this.progress = percent;
			});

			// 3. Konfirmasi ke Backend
			this.status = 'confirming';
			const { data: finalVideo } = await videoApi.confirmUpload(video.id);

			this.result = finalVideo;
			this.status = 'success';
		} catch (err: unknown) {
			this.status = 'error';
			if (isAxiosError(err)) {
				this.errorMessage = err.response?.data?.message || err.message;
			}
		}
	}

	reset() {
		this.status = 'idle';
		this.progress = 0;
		this.errorMessage = null;
		this.result = null;
	}
}
