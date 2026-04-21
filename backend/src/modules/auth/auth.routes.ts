import { FastifyInstance } from "fastify";
import { authController } from "./auth.controller";
import { authenticate } from "../../middlewares/authenticate";

class AuthRoutes {
  async register(app: FastifyInstance): Promise<void> {
    app.post("/auth/register", authController.register.bind(authController));
    app.post("/auth/login", authController.login.bind(authController));
    app.post(
      "/auth/logout",
      { preHandler: authenticate },
      authController.logout.bind(authController),
    );
  }
}

export const authRoutes = new AuthRoutes();
