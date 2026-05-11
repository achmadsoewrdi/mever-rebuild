import apiClient from './client';

// ============================================
// INTERFACES (Untuk Type Safety di Frontend)
// ============================================

export interface QualityPresetData {
	name: string;
	codec?: string;
	format?: string;
	resolution?: string;
	bitrateKbps?: number;
	isActive?: boolean;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Mengambil semua preset kualitas
 * Rute: GET /quality-presets
 */
export async function getPresets() {
	return apiClient.get('/quality-presets');
}

/**
 * Mengambil detail satu preset berdasarkan ID
 * Rute: GET /quality-presets/:id
 */
export async function getPreset(id: string) {
	return apiClient.get(`/quality-presets/${id}`);
}

/**
 * Membuat preset kualitas baru (Khusus Admin)
 * Rute: POST /admin/quality-presets
 */
export async function createPreset(data: QualityPresetData) {
	return apiClient.post('/admin/quality-presets', data);
}

/**
 * Memperbarui data preset kualitas (Khusus Admin)
 * Rute: PUT /admin/quality-presets/:id
 */
export async function updatePreset(id: string, data: Partial<QualityPresetData>) {
	return apiClient.put(`/admin/quality-presets/${id}`, data);
}

/**
 * Menghapus preset kualitas (Khusus Admin)
 * Rute: DELETE /admin/quality-presets/:id
 */
export async function deletePreset(id: string) {
	return apiClient.delete(`/admin/quality-presets/${id}`);
}
