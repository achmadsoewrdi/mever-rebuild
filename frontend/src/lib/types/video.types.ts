/**
 * Status siklus hidup video
 */
export type VideoStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/**
 * interface utama video
 */

export interface Video {
	id: string;
	title: string;
	description: string;
	thumbnailUrl: string;
	duration?: number;
	views: number;
	fileSizeBytes?: number;
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
}

/**
 * informasi teknis file video (asset)
 */
export interface VideoAsset {
	id: string;
	videoId: string;
	codec: string;
	format: string;
	resolution: string;
	sizeBytes: number;
	downloadUrl?: string;
}

/**
 * Data Transfer object untuk inisiasi upload
 */

export interface RequestUploadDto {
	title: string;
	description: string;
	originalName: string;
	fileSizeBytes: number;
}

/**
 * Response setelah meminta upload URL
 */

export interface UploadResponse {
	video: Video;
	uploadUrl: string;
}
