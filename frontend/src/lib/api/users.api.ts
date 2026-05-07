import apiClient, { type ApiResponse } from './client';
/**
 * Api :users
 */

export interface UserProfile {
	id: string;
	email: string;
	name: string;
	role: string;
	isActive: boolean;
	mfaEnabled: boolean;
	createdAt: string;
	updatedAt: string;
}

export const getMe = async (): Promise<ApiResponse<UserProfile>> => {
	return await apiClient.get('users/me');
};

export const updateProfile = async (data: {
	name?: string;
	email?: string;
}): Promise<ApiResponse<UserProfile>> => {
	return await apiClient.put('users/me', data);
};

export const changePassword = async (data: {
	oldPassword: string;
	newPassword: string;
}): Promise<ApiResponse<null>> => {
	return await apiClient.put('users/me/password', data);
};
