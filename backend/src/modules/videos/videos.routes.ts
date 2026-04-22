import { FastifyInstance } from "fastify";
import { videosController } from "./videos.controller";
import { authenticate } from "../../middlewares/authenticate";

class VideoRoutes {
  async register(app: FastifyInstance): Promise<void> {
    // get /videos menampilkan list
    app.get(
      "/videos",
      { preHandler: authenticate },
      videosController.list.bind(videosController),
    );

    // get /videos/:id menampilkan detail video
    app.get(
      "/videos/:id",
      { preHandler: authenticate },
      videosController.getById.bind(videosController),
    );

    // post /videos/request-upload
    app.post(
      "/videos/request-upload",
      { preHandler: authenticate },
      videosController.requestUpload.bind(videosController),
    );

    // post /videos/:id/confirm
    app.post(
      "/videos/:id/confirm",
      { preHandler: authenticate },
      videosController.confirmUpload.bind(videosController),
    );
  }
}

export const videosRoutes = new VideoRoutes();
