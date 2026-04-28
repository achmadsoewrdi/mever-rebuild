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
