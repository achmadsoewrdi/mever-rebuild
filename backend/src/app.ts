import { FastifyInstance } from "fastify";
import { buildFastify, loadFastifyPlugins } from "./loaders";
import { registerHealthRoutes } from "./modules/health/health.routes";
import { registerAuthRoutes } from "./modules/auth/auth.routes";
import { registerVideosRoutes } from "./modules/videos/videos.routes";
import { registerVideoAssetsRoutes } from "./modules/video-assets/video-assets.routes";
import { registerUserRoutes } from "./modules/users/users.routes";

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
  await app.register(registerUserRoutes, { prefix: "/users" });

  return app;
};
