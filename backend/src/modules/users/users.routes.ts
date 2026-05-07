import { FastifyInstance } from "fastify";
import { authenticate } from "../../middlewares/authenticate";
import {
  handleGetMe,
  handleUpdateMe,
  handleChangePassword,
} from "./users.controller";

export const registerUserRoutes = async (app: FastifyInstance) => {
  // wajib auth
  app.addHook("preHandler", authenticate);

  // users/me
  app.get("/me", handleGetMe);
  app.put("/me", handleUpdateMe);

  // Route: /users/me/password
  app.put("/me/password", handleChangePassword);
};
