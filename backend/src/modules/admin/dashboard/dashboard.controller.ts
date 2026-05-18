import { FastifyRequest, FastifyReply } from "fastify";
import { getDashboardData } from "./dashboard.service";
import { SuccessResponse, errorResponse } from "../../../utils/response";

export const handleGetDashboard = async (
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const data = await getDashboardData();
    return reply.status(200).send(SuccessResponse(data, "Berhasil mengambil data dashboard"));
  } catch (err: unknown) {
    const e = err as Error;
    return reply.status(500).send(errorResponse(e.message));
  }
};
