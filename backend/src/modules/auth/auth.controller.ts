import { FastifyRequest, FastifyReply } from "fastify";
import { register, login, logout } from "./auth.service";
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
