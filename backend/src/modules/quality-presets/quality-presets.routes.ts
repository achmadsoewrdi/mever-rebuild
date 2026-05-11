import { FastifyInstance } from "fastify";
import {
  handleCreatePreset,
  handleGetAllPresets,
  handleGetPresetById,
  handleUpdatePreset,
  handleDeletePreset,
} from "./quality-presets.controller";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";

// ============================================
// ROUTES: Quality Presets
// ============================================
export const registerQualityPresetsRoutes = async (
  app: FastifyInstance,
): Promise<void> => {
  // 1. GET /quality-presets — Ambil semua preset (Butuh Login)
  app.get(
    "/quality-presets",
    { preHandler: authenticate },
    handleGetAllPresets,
  );

  // 2. GET /quality-presets/:id — Ambil detail satu preset (Butuh Login)
  app.get(
    "/quality-presets/:id",
    { preHandler: authenticate },
    handleGetPresetById,
  );

  // 3. POST /admin/quality-presets — Buat preset baru (Hanya Admin)
  app.post(
    "/admin/quality-presets",
    { preHandler: [authenticate, authorize(["admin"])] },
    handleCreatePreset,
  );

  // 4. PUT /admin/quality-presets/:id — Update preset (Hanya Admin)
  app.put(
    "/admin/quality-presets/:id",
    { preHandler: [authenticate, authorize(["admin"])] },
    handleUpdatePreset,
  );

  // 5. DELETE /admin/quality-presets/:id — Hapus preset (Hanya Admin)
  app.delete(
    "/admin/quality-presets/:id",
    { preHandler: [authenticate, authorize(["admin"])] },
    handleDeletePreset,
  );
};
