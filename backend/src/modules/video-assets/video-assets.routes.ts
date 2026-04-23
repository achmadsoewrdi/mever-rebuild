import { FastifyInstance } from "fastify";
import { videoAssetsController } from "./video-assets.controller";
import { authenticate } from "../../middlewares/authenticate";

class VideoAssetsRoutes {
  async register(app: FastifyInstance): Promise<void> {
    
    // GET /videos/:id/assets
    // Endpoint ini akan mengembalikan daftar asset/resolusi dari suatu video
    app.get(
      "/videos/:id/assets",
      { preHandler: authenticate }, // Proteksi endpoint (harus login)
      videoAssetsController.getAssets.bind(videoAssetsController)
    );
    
  }
}

export const videoAssetsRoutes = new VideoAssetsRoutes();
