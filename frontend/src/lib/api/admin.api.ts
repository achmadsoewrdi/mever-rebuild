import apiClient from './client';

// mengambik semua user
export async function getAllUser() {
	return apiClient.get('/admin/users');
}

// menghapus user
export async function deleteUser(id: string) {
	return apiClient.delete(`/admin/users/${id}`);
}

// menambah user baru
export async function createUser(data: Record<string, string>) {
	return apiClient.post('/admin/users', data);
}
