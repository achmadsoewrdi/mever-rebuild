import { FastifyInstance } from "fastify";
import { buildFastify, loadFastifyPlugins } from "./loaders";
import { healthRoutes } from "./modules/health/health.routes";
import { authRoutes } from "./modules/auth/auth.routes";

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = buildFastify();

  await loadFastifyPlugins(app);

  // Daftarkan semua routes di sini
  await healthRoutes.register(app);
  await authRoutes.register(app);

  return app;
};
