/**
 * struktur standa untuk semua response dari api
 *
 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data: T;
}

// metadata untuk pagination
export interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// extend ApiResponse namu dengan tambahan field meta
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
	meta: PaginationMeta;
}

// struktur error message handling
export interface ApiError {
	message: string;
	details: Record<string, unknown> | string[];
}

// Interface untuk parameter getAccountRequests
export interface AccountRequestParams {
	status?: 'pending' | 'approved' | 'rejected' | string;
	search?: string;
	page?: number;
	limit?: number;
}

export interface AccountRequest {
	id: string;
	name: string;
	email: string;
	department: string;
	status: 'pending' | 'approved' | 'rejected' | string;
	createdAt: string | Date; // atau sesuaikan kalau dari backend namanya 'requestDate'
}