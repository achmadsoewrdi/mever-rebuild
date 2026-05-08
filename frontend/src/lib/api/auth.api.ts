import apiClient, { type ApiResponse } from './client';
import type { LoginInput } from '$lib/utils/validator';

export interface LoginResponse {
	token?: string;
	mfaRequired?: boolean;
	mfaSetupRequired?: boolean;
	userId?: string;
	otpauthUrl?: string;
}

/**
 * @params payload
 * @return
 */

export const loginApi = async (payload: LoginInput): Promise<ApiResponse<LoginResponse>> => {
	return await apiClient.post('/auth/login', payload);
};

export const verifyMfaLoginApi = async (payload: { userId: string; token: string }): Promise<ApiResponse<LoginResponse>> => {
	return await apiClient.post('/auth/login/mfa', payload);
};

export const enableMfaApi = async (payload: { userId: string; token: string }): Promise<ApiResponse<LoginResponse>> => {
	return await apiClient.post('/auth/mfa/enable', payload);
};

export const setupMfaApi = async (): Promise<ApiResponse<{ secret: string; otpauthUrl: string }>> => {
	return await apiClient.post('/auth/mfa/setup');
};
