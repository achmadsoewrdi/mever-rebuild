import { FastifyInstance } from "fastify";
import { handleRegister, handleLogin, handleLogout } from "./auth.controller";
import { authenticate } from "../../middlewares/authenticate";

// ============================================
//  ROUTES: Auth
// ============================================
export const registerAuthRoutes = async (app: FastifyInstance): Promise<void> => {
  // POST /auth/register
  app.post("/auth/register", handleRegister);

  // POST /auth/login
  app.post("/auth/login", handleLogin);

  // POST /auth/logout — butuh token
  app.post("/auth/logout", { preHandler: authenticate }, handleLogout);
};
