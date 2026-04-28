import axios from 'axios';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { resolve } from '$app/paths';

// Import tipe ApiResponse Anda
export interface ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
	errors?: Record<string, string[]>;
}

// 1. Buat instance axios
const apiClient = axios.create({
	baseURL: PUBLIC_API_BASE_URL,
	headers: {
		'Content-Type': 'application/json'
	}
});

// 2. Request Interceptor: Otomatis pasang token
apiClient.interceptors.request.use((config) => {
	if (browser) {
		const token = document.cookie
			.split('; ')
			.find((row) => row.startsWith('auth_token='))
			?.split('=')[1];

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

// 3. Response Interceptor: Handle 401 & Unify Response
apiClient.interceptors.response.use(
	(response) => {
		// Axios membungkus data di property 'data'
		return response.data;
	},
	(error) => {
		if (error.response?.status === 401 && browser) {
			goto(resolve('/auth/login'));
		}

		// Ambil pesan error dari backend jika ada
		const message = error.response?.data?.message || 'Something went wrong';
		return Promise.reject(new Error(message));
	}
);

export default apiClient;
