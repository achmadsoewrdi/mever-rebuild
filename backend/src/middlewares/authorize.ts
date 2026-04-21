import { FastifyRequest, FastifyReply } from "fastify";
import { errorResponse } from "../utils/response";

// ============================================
//  MIDDLEWARE AUTHORIZE
// ============================================

export const authorize = (allowedRoles: string[]) => {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> => {
    const { role } = request.user;

    if (!allowedRoles.includes(role)) {
      return reply
        .status(403)
        .send(errorResponse("Forbidden: role tidak memiliki akses"));
    }
  };
};
