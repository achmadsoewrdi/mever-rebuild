import { FastifyInstance } from "fastify";
import {
  handleGetAllUsers,
  handleUpdateRole,
  handleUpdateStatus,
} from "./admin.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

// ============================================
//  ROUTES: Admin
// ============================================

export const adminRoutes = async (app: FastifyInstance) => {
  const adminProtection = {
    preHandler: [authenticate, authorize(["admin"])],
  };

  app.get("/admin/users", adminProtection, handleGetAllUsers);
  app.put("/admin/users/:id/role", adminProtection, handleUpdateRole);
  app.put("/admin/users/:id/status", adminProtection, handleUpdateStatus);
};
