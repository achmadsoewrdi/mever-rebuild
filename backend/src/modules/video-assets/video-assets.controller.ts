import { FastifyRequest, FastifyReply } from "fastify";
import { getAssets } from "./video-assets.service";
import { SuccessResponse, errorResponse } from "../../utils/response";

// ============================================
//  HANDLER: GET /videos/:id/assets
// ============================================
export const handleGetAssets = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { id } = request.params as { id: string };
  try {
    const assets = await getAssets(id);
    reply.status(200).send(SuccessResponse(assets, "Berhasil mengambil aset video"));
  } catch (err: any) {
    console.error("[VIDEO ASSETS ERROR]", err);
    reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};
