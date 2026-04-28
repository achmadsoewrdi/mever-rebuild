import { FastifyInstance } from "fastify";
import { buildFastify, loadFastifyPlugins } from "./loaders";
import { registerHealthRoutes } from "./modules/health/health.routes";
import { registerAuthRoutes } from "./modules/auth/auth.routes";
import { registerVideosRoutes } from "./modules/videos/videos.routes";
import { registerVideoAssetsRoutes } from "./modules/video-assets/video-assets.routes";

// ============================================
//  BUILD APP
// ============================================
export const buildApp = async (): Promise<FastifyInstance> => {
  const app = buildFastify();

  await loadFastifyPlugins(app);

  // Daftarkan semua routes
  await registerHealthRoutes(app);
  await registerAuthRoutes(app);
  await registerVideosRoutes(app);
  await registerVideoAssetsRoutes(app);

  return app;
};
