import { FastifyInstance } from "fastify";
import { handleGetAssets } from "./video-assets.controller";
import { authenticate } from "../../middlewares/authenticate";

// ============================================
//  ROUTES: Video Assets
// ============================================
export const registerVideoAssetsRoutes = async (app: FastifyInstance): Promise<void> => {
  // GET /videos/:id/assets — daftar resolusi/aset suatu video (butuh login)
  app.get("/videos/:id/assets", { preHandler: authenticate }, handleGetAssets);
};
