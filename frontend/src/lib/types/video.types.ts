/**
 * Status siklus hidup video
 */
export type VideoStatus = 'uploading' | 'queued' | 'processing' | 'ready' | 'failed';

/**
 * Jenis Codec yang didukung oleh Transcoder.
 */
export type VideoCodec = 'h264' | 'h265' | 'hevc' | 'vp9' | 'av1' | 'vp8';

/**
 * Protokol streaming yang tersedia untuk distribusi video.
 */
export type VideoProtocol = 'hls' | 'dash' | 'plain';

/**
 * interface utama video
 */

export interface Video {
	id: string;
	uploadedBy: string | null;
	title: string;
	description: string | null;
	slug: string;
	originalName: string | null;
	sourcePath: string | null;
	status: VideoStatus;
	thumbnailUrl: string | null;
	durationSeconds: number | null;
	fileSizeBytes: number | null;
	targetCodec: VideoCodec | null;
	targetProtocol: VideoProtocol | null;
	totalJobs: number;
	doneJobs: number;
	publishedAt: string | null;
	createdAt: string;
	updatedAt: string;
	assets?: VideoAsset[];
}

/**
 * filter untuk pencarian dan list video
 */

export interface VideoFilters {
	status?: VideoStatus;
	search?: string;
	page?: number;
	limit?: number;
	protocols?: string[];
	encoders?: string[];
	resolutions?: string[];
}

/**
 * informasi teknis file video (asset)
 */
export interface VideoAsset {
	id: string;
	videoId: string;
	codec: string;
	format: string;
	protocol: VideoProtocol;
	resolution: string;
	bitrateKbps: number | null;
	manifestUrl: string | null;
	fileSizeBytes: number | null;
	createdAt: string;
}

/**
 * Data Transfer object untuk inisiasi upload
 */

export interface RequestUploadDto {
	title: string;
	description?: string;
	originalName: string;
	fileSizeBytes?: number;
	targetCodec?: VideoCodec;
	targetProtocol?: VideoProtocol;
}

/**
 * Response setelah meminta upload URL
 */

export interface UploadResponse {
	video: Video;
	uploadUrl: string;
}
