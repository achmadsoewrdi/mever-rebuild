// ================================
// DTO — Data Transfer Object
// Shape data yang dikirim user via HTTP request
// ================================

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ================================
// JWT Payload
// Isi data yang dikodekan di dalam token JWT
// ================================

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
}

export type LoginResult =
  | { mfaRequired: true; userId: string }
  | { mfaRequired: false; payload: JwtPayload };
