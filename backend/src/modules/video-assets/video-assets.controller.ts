// src/modules/video-assets/video-assets.controller.ts

import { FastifyRequest, FastifyReply } from "fastify";
import { videoAssetsService } from "./video-assets.service";

class VideoAssetsController {
  async getAssets(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string }; // Ambil ID video dari URL

      // Panggil service
      const assets = await videoAssetsService.getAssets(id);

      // Kembalikan response JSON yang standar
      return reply.code(200).send({
        status: "success",
        data: assets,
      });
    } catch (error: any) {
      console.error("[VIDEO ASSETS ERROR]", error);
      return reply.code(500).send({
        status: "error",
        message: "Internal Server Error",
      });
    }
  }
}

export const videoAssetsController = new VideoAssetsController();
