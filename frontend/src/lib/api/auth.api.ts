import apiClient, { type ApiResponse } from './client';
import type { LoginInput } from '$lib/utils/validator';

export interface LoginResponse {
	token: string;
}

/**
 * @params payload
 * @return
 */

export const loginApi = async (payload: LoginInput): Promise<ApiResponse<LoginResponse>> => {
	return await apiClient.post('/auth/login', payload);
};
