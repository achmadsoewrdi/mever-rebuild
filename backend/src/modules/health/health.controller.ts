import { FastifyRequest, FastifyReply } from "fastify";
import { SuccessResponse } from "../../utils/response";

// ============================================
//  HANDLER: GET /health
// ============================================
export const healthCheck = async (
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  reply.status(200).send(
    SuccessResponse({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );
};
