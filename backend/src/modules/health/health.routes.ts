import { FastifyInstance } from "fastify";
import { healthCheck } from "./health.controller";

// ============================================
//  ROUTES: Health
// ============================================
export const registerHealthRoutes = async (app: FastifyInstance): Promise<void> => {
  // GET /health — tanpa autentikasi
  app.get("/health", healthCheck);
};
