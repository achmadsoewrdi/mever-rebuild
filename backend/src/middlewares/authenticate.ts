import { FastifyRequest, FastifyReply } from "fastify";
import "@fastify/jwt";
import { redisCache } from "../loaders";
import { success } from "zod";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      sub: string;
      email: string;
      role: string;
      jti: string;
    };
  }
}

// ============================================
//  MIDDLEWARE AUTHENTICATE
// ============================================

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    await request.jwtVerify();
    const { jti } = request.user;
    if (jti) {
      const isBlacklist = await redisCache.get(`session:blacklist:${jti}`);
      if (isBlacklist) {
        return reply
          .status(401)
          .send({
            success: false,
            message: "Token tidak valid,silahkan login ulang",
          });
      }
    }
  } catch (err) {
    reply
      .status(401)
      .send({
        success: false,
        message: "Unauthorized: token tidak valid atau expired",
      });
  }
};
