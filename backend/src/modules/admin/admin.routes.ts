import { FastifyInstance } from "fastify";
import {
  handleGetAllUsers,
  handleRemoveUser,
  handleUpdateRole,
  handleUpdateStatus,
  handleCreateUser,
  handleGetAllVideos,
  handleGetVideoDetail,
  handleUpdateVideo,
  handleDeleteVideo,
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
  app.delete("/admin/users/:id", adminProtection, handleRemoveUser);
  app.post("/admin/users", adminProtection, handleCreateUser);

  // Video Management Routes
  app.get("/admin/videos", adminProtection, handleGetAllVideos);
  app.get("/admin/videos/:id", adminProtection, handleGetVideoDetail);
  app.put("/admin/videos/:id", adminProtection, handleUpdateVideo);
  app.delete("/admin/videos/:id", adminProtection, handleDeleteVideo);
};
