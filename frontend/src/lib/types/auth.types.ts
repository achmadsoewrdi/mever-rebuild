/**
 * Data Transfe Object untuk Registrasi
 */

export interface RegisterDto {
	name: string;
	email: string;
	password: string;
}

/**
 * Data Transfer object untuk login
 */

export interface LoginDto {
	email: string;
	password: string;
}

/**
 * representasi user yang terautentikasi
 */

export interface AuthResponse {
	sub: string;
	email: string;
	role: 'ADMIN' | 'USER' | string;
}

/**
 * Response dari login berupa token atau instruksi untuk melakukan MFA
 */

export type LoginResponse =
	| {
			token: string;
			mfaRequired: false;
	  }
	| {
			mfaRequired: true;
			userId: string;
	  };
