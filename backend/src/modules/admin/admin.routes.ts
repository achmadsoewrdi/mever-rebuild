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
  handleGetAccountRequests,
  handleApproveAccountRequest,
  handleRejectAccountRequest,
  handleUpdateUserProfile
} from "./admin.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { adminJobsRoutes } from "./jobs/jobs.routes";
import { handleGetDashboard } from "./dashboard/dashboard.controller";

// ============================================
//  ROUTES: Admin
// ============================================

export const adminRoutes = async (app: FastifyInstance) => {
  const adminProtection = {
    preHandler: [authenticate, authorize(["admin"])],
  };

  app.get("/admin/users", adminProtection, handleGetAllUsers);

  // Dashboard
  app.get("/admin/dashboard", adminProtection, handleGetDashboard);
  app.put("/admin/users/:id/role", adminProtection, handleUpdateRole);
  app.put("/admin/users/:id/profile", adminProtection, handleUpdateUserProfile);
  app.put("/admin/users/:id/status", adminProtection, handleUpdateStatus);
  app.delete("/admin/users/:id", adminProtection, handleRemoveUser);
  app.post("/admin/users", adminProtection, handleCreateUser);

  // Video Management Routes
  app.get("/admin/videos", adminProtection, handleGetAllVideos);
  app.get("/admin/videos/:id", adminProtection, handleGetVideoDetail);
  app.put("/admin/videos/:id", adminProtection, handleUpdateVideo);
  app.delete("/admin/videos/:id", adminProtection, handleDeleteVideo);

  // Account Requests Routes
  app.get("/admin/account-requests", adminProtection, handleGetAccountRequests);
  app.post("/admin/account-requests/:id/approve", adminProtection, handleApproveAccountRequest);
  app.post("/admin/account-requests/:id/reject", adminProtection, handleRejectAccountRequest);

  // Daftarkan route untuk /admin/jobs
  app.register(adminJobsRoutes, { prefix: "/admin" });
};
