import { FastifyInstance } from "fastify";
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleMfaEnable,
  handleMfaLoginVerify,
  handleMfaSetup,
} from "./auth.controller";
import { authenticate } from "../../middlewares/authenticate";

// ============================================
//  ROUTES: Auth
// ============================================
export const registerAuthRoutes = async (
  app: FastifyInstance,
): Promise<void> => {
  // POST /auth/register
  app.post("/auth/register", handleRegister);

  // POST /auth/login
  app.post("/auth/login", handleLogin);

  // POST /auth/logout — butuh token
  app.post("/auth/logout", { preHandler: authenticate }, handleLogout);

  app.post("/auth/mfa/setup", { preHandler: authenticate }, handleMfaSetup);
  // 2. POST /auth/mfa/enable (Aktivasi MFA pertama kali - Butuh Login)
  app.post("/auth/mfa/enable", { preHandler: authenticate }, handleMfaEnable);
  // 3. POST /auth/login/mfa (Verifikasi OTP saat Login - Tanpa Auth)
  app.post("/auth/login/mfa", handleMfaLoginVerify);
};
