import { FastifyRequest, FastifyReply } from "fastify";
import { videoService } from "./videos.service";
import { videoFilterSchema } from "./videos.schema";
import { SuccessResponse, errorResponse } from "../../utils/response";

class VideoController {
  // menangangi request GET /videos
  async list(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const parsed = videoFilterSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply
        .status(400)
        .send(
          errorResponse("Query parameter tidak valid", parsed.error.issues),
        );
    }
    try {
      const videos = await videoService.listVideos(parsed.data);
      reply
        .status(200)
        .send(SuccessResponse(videos, "Berhasil mengambil daftar video"));
    } catch (err: any) {
      console.error("LIST Videos Error:", err);
      reply.status(500).send(errorResponse("Terjadi Kesalahan Server"));
    }
  }

  // menangani request Get/videos/:id
  async getById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = request.params as { id: string };

    try {
      const video = await videoService.getVideoById(id);
      reply
        .status(200)
        .send(SuccessResponse(video, "Berhasil mengambil detail video"));
    } catch (err: any) {
      if (err.message === "VIDEO_NOT_FOUND") {
        return reply.status(404).send(errorResponse("Video tidak ditemukan"));
      }
      console.log("Get By Id Error:", err);
      reply.status(500).send(errorResponse("Terjadi Kesalahan Server"));
    }
  }
}

export const videosController = new VideoController();
