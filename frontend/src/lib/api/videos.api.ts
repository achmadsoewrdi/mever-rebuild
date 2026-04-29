import apiClient from './client';
import type {
	Video,
	VideoFilters,
	VideoAsset,
	RequestUploadDto,
	UploadResponse
} from '$lib/types/video.types';
import type { ApiResponse, PaginatedResponse } from '$lib/types/api.types';

/**
 * Video API Service
 * Menangani semua komunikasi data terkait video dengan Backend.
 */
export const videoApi = {
	/**
	 * Mengambil daftar video dengan dukungan filter, pencarian, dan pagination.
	 * @param filters Objek berisi status, search query, page, dan limit.
	 * @returns Promise dengan data video yang sudah terpaginasi.
	 */
	getVideos: async (filters: VideoFilters): Promise<PaginatedResponse<Video>> => {
		// Menggunakan axios instance (apiClient) yang sudah otomatis menangani Auth Token
		return apiClient.get('/videos', {
			params: filters // Axios otomatis mengubah objek ini menjadi query string (?search=...&page=...)
		});
	},

	/**
	 * Mengambil informasi detail untuk satu video tertentu.
	 * @param id ID unik video.
	 */
	getVideoById: async (id: string): Promise<ApiResponse<Video>> => {
		return apiClient.get(`/videos/${id}`);
	},

	/**
	 * Mengambil daftar aset teknis video (resolusi, codec, format).
	 * Digunakan untuk player atau informasi teknis di dashboard.
	 * @param videoId ID video terkait.
	 */
	getVideoAssets: async (videoId: string): Promise<ApiResponse<VideoAsset[]>> => {
		return apiClient.get(`/videos/${videoId}/assets`);
	},

	/**
	 * Meminta Presigned URL dari backend untuk melakukan upload file langsung ke MinIO.
	 * @param data Informasi dasar video yang akan diupload.
	 */
	requestUpload: async (data: RequestUploadDto): Promise<ApiResponse<UploadResponse>> => {
		return apiClient.post('/videos/request-upload', data);
	},

	/**
	 * Mengonfirmasi ke backend bahwa proses upload ke storage telah selesai,
	 * sehingga backend dapat memulai proses transcoding.
	 * @param id ID video yang baru saja diupload.
	 */
	confirmUpload: async (id: string): Promise<ApiResponse<Video>> => {
		return apiClient.post(`/videos/${id}/confirm`);
	}
};
