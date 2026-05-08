import { FastifyRequest, FastifyReply } from "fastify";
import { getAllUsers, updateUserRole, updateUserStatus } from "./admin.service";
import { updateRoleSchema, updateStatusSchema } from "./admin.types";
import { SuccessResponse, errorResponse } from "../../utils/response";

// ============================================
//  HANDLER: GET /admin/users
// ============================================
export const handleGetAllUsers = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const users = await getAllUsers();
    reply
      .status(200)
      .send(SuccessResponse(users, "Berhasil mengambil semua data user"));
  } catch (err: any) {
    console.error("❌ Get all users error:", err);
    reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

// ============================================
//  HANDLER: PUT /admin/users/:id/role
// ============================================
export const handleUpdateRole = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { id } = request.params as { id: string }; // Ambil ID user dari URL

  // Validasi body request pakai Zod Schema yang kamu buat tadi
  const parsed = updateRoleSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send(errorResponse("Input tidak valid", parsed.error.issues));
  }

  try {
    const updatedUser = await updateUserRole(id, parsed.data.role);
    reply
      .status(200)
      .send(SuccessResponse(updatedUser, "Berhasil mengubah role user"));
  } catch (err: any) {
    if (err.message === "User Not Found") {
      return reply.status(404).send(errorResponse("User tidak ditemukan"));
    }
    console.error("❌ Update role error:", err);
    reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

// ============================================
//  HANDLER: PUT /admin/users/:id/status
// ============================================
export const handleUpdateStatus = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { id } = request.params as { id: string };

  const parsed = updateStatusSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send(errorResponse("Input tidak valid", parsed.error.issues));
  }

  try {
    const updatedUser = await updateUserStatus(id, parsed.data.isActive);
    reply
      .status(200)
      .send(SuccessResponse(updatedUser, "Berhasil mengubah status akun user"));
  } catch (err: any) {
    if (err.message === "User Not Found") {
      return reply.status(404).send(errorResponse("User tidak ditemukan"));
    }
    console.error("❌ Update status error:", err);
    reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};
