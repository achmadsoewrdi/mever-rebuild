import { FastifyRequest, FastifyReply } from "fastify";
import * as service from "./jobs.service";
import { SuccessResponse, errorResponse } from "../../../utils/response";

export const getJobs = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const query = request.query as { limit?: string; page?: string };
    const limit = parseInt(query.limit || "10", 10);
    const page = parseInt(query.page || "1", 10);
    const offset = (page - 1) * limit;

    const data = await service.getQueueStatus(limit, offset);
    return reply.status(200).send(SuccessResponse(data, "Berhasil mengambil antrian jobs"));
  } catch (err: any) {
    return reply.status(500).send(errorResponse(err.message));
  }
};

export const retryJob = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as { id: string };
    const result = await service.retryJob(id);
    return reply.status(200).send(SuccessResponse(result, "Berhasil mengulang job"));
  } catch (err: any) {
    return reply.status(400).send(errorResponse(err.message));
  }
};
