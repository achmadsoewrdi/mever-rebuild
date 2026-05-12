import apiClient from './client';

// ============================================
// INTERFACES
// ============================================
export interface StorageConfigData {
	name: string;
	endpointUrl: string;
	bucketInput: string;
	bucketOutput: string;
	accessKey: string;
	secretKey: string;
	isActive?: boolean;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Mengambil semua konfigurasi penyimpanan (Khusus Admin)
 * Rute: GET /admin/storage-configs
 */
export async function getStorageConfigs() {
	return apiClient.get('/admin/storage-configs');
}

/**
 * Mengambil detail satu konfigurasi berdasarkan ID (Khusus Admin)
 * Rute: GET /admin/storage-configs/:id
 */
export async function getStorageConfig(id: string) {
	return apiClient.get(`/admin/storage-configs/${id}`);
}

/**
 * Membuat konfigurasi penyimpanan baru (Khusus Admin)
 * Rute: POST /admin/storage-configs
 */
export async function createStorageConfig(data: StorageConfigData) {
	return apiClient.post('/admin/storage-configs', data);
}

/**
 * Memperbarui data konfigurasi (Khusus Admin)
 * Rute: PUT /admin/storage-configs/:id
 */
export async function updateStorageConfig(id: string, data: Partial<StorageConfigData>) {
	return apiClient.put(`/admin/storage-configs/${id}`, data);
}

/**
 * Menghapus konfigurasi penyimpanan (Khusus Admin)
 * Rute: DELETE /admin/storage-configs/:id
 */
export async function deleteStorageConfig(id: string) {
	return apiClient.delete(`/admin/storage-configs/${id}`);
}
