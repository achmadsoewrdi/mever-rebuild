import { FastifyInstance } from "fastify";
import { healtController } from "./health.controller";

class HealthRoutes {
  async register(app: FastifyInstance): Promise<void> {
    app.get("/health", healtController.check.bind(healtController));
  }
}

export const healthRoutes = new HealthRoutes();
