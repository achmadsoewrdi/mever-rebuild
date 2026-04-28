import { FastifyInstance } from "fastify";
import {
  handleListVideos,
  handleGetVideoById,
  handleRequestUpload,
  handleConfirmUpload,
} from "./videos.controller";
import { authenticate } from "../../middlewares/authenticate";

// ============================================
//  ROUTES: Videos
// ============================================
export const registerVideosRoutes = async (app: FastifyInstance): Promise<void> => {
  // GET /videos — daftar video (butuh login)
  app.get("/videos", { preHandler: authenticate }, handleListVideos);

  // GET /videos/:id — detail video (butuh login)
  app.get("/videos/:id", { preHandler: authenticate }, handleGetVideoById);

  // POST /videos/request-upload — minta presigned URL (butuh login)
  app.post("/videos/request-upload", { preHandler: authenticate }, handleRequestUpload);

  // POST /videos/:id/confirm — konfirmasi upload selesai (butuh login)
  app.post("/videos/:id/confirm", { preHandler: authenticate }, handleConfirmUpload);
};
