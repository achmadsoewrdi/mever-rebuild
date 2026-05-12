import { FastifyInstance } from "fastify";
import {
  handleCreateConfig,
  handleGetAllConfigs,
  handleGetConfigById,
  handleUpdateConfig,
  handleDeleteConfig,
} from "./storage-configs.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

// ============================================
// ROUTES: Storage Configs
// ============================================
export const registerStorageConfigsRoutes = async (
  app: FastifyInstance,
): Promise<void> => {
  // Semua route di bawah ini hanya bisa diakses oleh Admin yang sudah login

  // 1. GET /admin/storage-configs — Ambil semua konfigurasi
  app.get(
    "/admin/storage-configs",
    { preHandler: [authenticate, authorize(["admin"])] },
    handleGetAllConfigs,
  );

  // 2. GET /admin/storage-configs/:id — Ambil detail satu konfigurasi
  app.get(
    "/admin/storage-configs/:id",
    { preHandler: [authenticate, authorize(["admin"])] },
    handleGetConfigById,
  );

  // 3. POST /admin/storage-configs — Buat konfigurasi baru
  app.post(
    "/admin/storage-configs",
    { preHandler: [authenticate, authorize(["admin"])] },
    handleCreateConfig,
  );

  // 4. PUT /admin/storage-configs/:id — Update konfigurasi
  app.put(
    "/admin/storage-configs/:id",
    { preHandler: [authenticate, authorize(["admin"])] },
    handleUpdateConfig,
  );

  // 5. DELETE /admin/storage-configs/:id — Hapus konfigurasi
  app.delete(
    "/admin/storage-configs/:id",
    { preHandler: [authenticate, authorize(["admin"])] },
    handleDeleteConfig,
  );
};
