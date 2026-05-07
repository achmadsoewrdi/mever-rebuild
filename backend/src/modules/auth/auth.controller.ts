import { FastifyRequest, FastifyReply } from "fastify";
import {
  register,
  login,
  logout,
  setupMFA,
  verifyMFALogin,
  verifyAndEnableMFA,
} from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { SuccessResponse, errorResponse } from "../../utils/response";

// ============================================
//  HANDLER: POST /auth/register
// ============================================
export const handleRegister = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .code(400)
      .send(errorResponse("Input tidak valid", parsed.error.issues));
  }
  try {
    const user = await register(parsed.data);
    reply.status(201).send(SuccessResponse(user, "Registrasi berhasil"));
  } catch (err: any) {
    if (err.message === "EMAIL_TAKEN") {
      return reply.status(409).send(errorResponse("Email sudah terdaftar"));
    }
    console.error("❌ Register error:", err);
    reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

// ============================================
//  HANDLER: POST /auth/login
// ============================================
export const handleLogin = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send(errorResponse("Input tidak valid", parsed.error.issues));
  }
  try {
    const result = await login(parsed.data);
    if (result.mfaRequired) {
      return reply
        .status(200)
        .send(
          SuccessResponse(
            { mfaRequired: true, userId: result.userId },
            "Verifikasi MFA diperlukan",
          ),
        );
    }
    const token = await reply.jwtSign(result.payload);
    reply.status(200).send(SuccessResponse({ token }, "Login berhasil"));
  } catch (err: any) {
    if (err.message === "INVALID_CREDENTIALS") {
      return reply.status(401).send(errorResponse("Email atau password salah"));
    }
    reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

// ============================================
//  HANDLER: POST /auth/logout
// ============================================
export const handleLogout = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const { jti } = request.user;
    await logout(jti);
    reply.status(200).send(SuccessResponse(null, "Logout berhasil"));
  } catch (err) {
    reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

// ============================================
//  HANDLER: POST /auth/mfa/setup
// ============================================
export const handleMfaSetup = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = (request.user as any).sub; // Ambil ID admin dari token JWT
  try {
    const result = await setupMFA(userId);
    reply.send(SuccessResponse(result, "MFA setup berhasil dibuat"));
  } catch (err: any) {
    reply.status(400).send(errorResponse(err.message));
  }
};

// ============================================
//  HANDLER: POST /auth/mfa/enable
// ============================================
export const handleMfaEnable = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = (request.user as any).sub;
  const { token } = request.body as { token: string }; // Ambil token 6 digit dari body

  try {
    await verifyAndEnableMFA(userId, token);
    reply.send(SuccessResponse(null, "MFA berhasil diaktifkan"));
  } catch (err: any) {
    reply
      .status(400)
      .send(
        errorResponse(
          err.message === "INVALID_MFA_TOKEN"
            ? "Kode OTP tidak valid"
            : err.message,
        ),
      );
  }
};

/**
 * HANDLER: POST /auth/login/mfa
 * Digunakan saat proses login kedua (setelah password benar tapi butuh OTP)
 */

// ============================================
//  HANDLER: POST /auth/login/mfa
// ============================================
export const handleMfaLoginVerify = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { userId, token } = request.body as { userId: string; token: string };

  try {
    const payload = await verifyMFALogin(userId, token);
    const fullToken = await reply.jwtSign(payload); // Berikan Full JWT Token karena OTP sukses

    reply.send(SuccessResponse({ token: fullToken }, "Login MFA berhasil"));
  } catch (err: any) {
    reply.status(401).send(errorResponse("Kode OTP salah atau kedaluwarsa"));
  }
};
