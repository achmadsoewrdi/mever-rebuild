import { FastifyRequest, FastifyReply } from "fastify";
import { authService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { SuccessResponse, errorResponse } from "../../utils/response";
import { authRepository } from "./auth.repository";

class AuthController {
  // Register
  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .code(400)
        .send(errorResponse("Input tidak valid", parsed.error.issues));
    }
    try {
      const user = await authService.register(parsed.data);
      reply.status(201).send(SuccessResponse(user, "Registrasi Berhasil"));
    } catch (err: any) {
      if (err.message === "EMAIL_TAKEN") {
        return reply.status(409).send(errorResponse("Email Sudah terdaftar"));
      }
      console.error("❌ Register error:", err);
      reply.status(500).send(errorResponse("Trejadi Kesalahan server"));
    }
  }

  //   login
  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply
        .status(400)
        .send(errorResponse("Input tidak valid", parsed.error.issues));
    }
    try {
      const result = await authService.login(parsed.data);
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
      reply.status(200).send(SuccessResponse({ token }, "Login Berhasil"));
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS") {
        return reply
          .status(401)
          .send(errorResponse("Email atau Password Salah"));
      }
      reply.status(500).send(errorResponse("Terjadi Kesalahan Server"));
    }
  }

  //   logut

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { jti } = request.user;
      await authService.logout(jti);
      reply.status(200).send(SuccessResponse(null, "Logout Berhasil"));
    } catch (err) {
      reply.status(500).send(errorResponse("Terjadi Kesalahan Server"));
    }
  }
}

export const authController = new AuthController();
