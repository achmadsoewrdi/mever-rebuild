import apiClient from './client';

// Interface untuk parameter pencarian dan pagination (Opsional tapi bagus untuk TS)
interface GetVideosParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
}

interface UpdateVideoData {
	title?: string;
	description?: string;
	status?: string;
}

/**
 * Mengambil semua data video untuk admin dengan filter dan pagination
 */
export async function getVideos(params?: GetVideosParams) {
	return apiClient.get('/admin/videos', { params });
}

/**
 * Mengambil detail satu video berdasarkan ID
 */
export async function getVideo(id: string) {
	return apiClient.get(`/admin/videos/${id}`);
}

/**
 * Memperbarui data video (misal: judul, deskripsi, atau status block/approve)
 */
export async function updateVideo(id: string, data: UpdateVideoData) {
	return apiClient.put(`/admin/videos/${id}`, data);
}

/**
 * Menghapus video (Soft Delete atau Hard Delete)
 */
export async function deleteVideo(id: string, hard: boolean = false) {
	return apiClient.delete(`/admin/videos/${id}`, { params: { hard } });
}
