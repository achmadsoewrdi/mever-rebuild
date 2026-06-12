import apiClient from './client';
import { type AccountRequestParams } from '$lib/types/api.types';

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

// mengambil data account request
export async function getAccountRequests(params?: AccountRequestParams){
	return apiClient.get('/admin/account-requests',{params});
}

// menyetujui request
export async function approveAccountRequest(id:string){
	return apiClient.post(`/admin/account-requests/${id}/approve`);
}

// menolak request
export async function rejectAccountRequest(id:string){
	return apiClient.post(`/admin/account-requests/${id}/reject`);
}