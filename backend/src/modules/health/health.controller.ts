import { FastifyRequest, FastifyReply } from "fastify";
import { SuccessResponse } from "../../utils/response";

class HealtController {
  /**
   * GET /health
   * Cek apakah server berjalan normal
   */

  async check(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.status(200).send(
      SuccessResponse({
        status: "ok",
        uptime: process.uptime(),
        timeStamp: new Date().toString(),
      }),
    );
  }
}

export const healtController = new HealtController();
