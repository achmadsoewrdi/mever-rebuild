// ========================
// TYPES
// ========================
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}
interface ErrorResponse {
  success: false;
  message: string;
  errors?: unknown;
}

// ========================
// FUNCTIONS
// ========================
/**
 * Format response sukses
 * Contoh: { success: true, data: {...}, message: "Login berhasil" }
 */

export const SuccessResponse = <T>(
  data: T,
  message?: string,
): SuccessResponse<T> => {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
};

/**
 * Format response error
 * Contoh: { success: false, message: "Email sudah terdaftar" }
 */
export const errorResponse = (
  message: string,
  errors?: unknown,
): ErrorResponse => {
  return {
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
  };
};
