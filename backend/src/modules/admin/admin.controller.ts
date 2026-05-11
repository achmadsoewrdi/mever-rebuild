import { FastifyRequest, FastifyReply } from "fastify";
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  removeUser,
  createUser,
  getAllVideos,
  getVideoDetail,
  editVideo,
  removeVideo,
} from "./admin.service";
import { updateRoleSchema, updateStatusSchema, createUserSchema } from "./admin.types";
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

// ============================================
//  HANDLER: DELETE /admin/users/:id
// ============================================
export const handleRemoveUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { id } = request.params as { id: string };
  try {
    const deleteUser = await removeUser(id);
    reply
      .status(200)
      .send(SuccessResponse(deleteUser, "Berhasil menghapus User"));
  } catch (err: any) {
    if (err.message === "User Not Found") {
      return reply.status(404).send(errorResponse("User tidak ditemukan"));
    }
    reply.status(500).send(errorResponse("Internal Server Error"));
  }
};

// ============================================
//  HANDLER: POST /admin/users
// ============================================
export const handleCreateUser = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const parsed = createUserSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send(errorResponse("Input tidak valid", parsed.error.issues));
  }

  try {
    const newUser = await createUser(parsed.data);
    reply
      .status(201)
      .send(SuccessResponse(newUser, "Berhasil membuat User baru"));
  } catch (err: any) {
    console.error("❌ Create user error:", err);
    reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

// ============================================
//  HANDLER: GET /admin/videos
// ============================================
export const handleGetAllVideos = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = request.query as { page?: string; limit?: string; search?: string; status?: string };
  
  try {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    
    const result = await getAllVideos({
      page,
      limit,
      search: query.search,
      status: query.status,
    });
    
    reply.send(SuccessResponse(result, "Berhasil mengambil data video"));
  } catch (err: any) {
    reply.status(500).send(errorResponse("Internal Server Error"));
  }
};

// ============================================
//  HANDLER: GET /admin/videos/:id
// ============================================
export const handleGetVideoDetail = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  try {
    const video = await getVideoDetail(id);
    reply.send(SuccessResponse(video, "Berhasil mengambil detail video"));
  } catch (err: any) {
    if (err.message === "Video Not Found") {
      return reply.status(404).send(errorResponse("Video tidak ditemukan"));
    }
    reply.status(500).send(errorResponse("Internal Server Error"));
  }
};

// ============================================
//  HANDLER: PUT /admin/videos/:id
// ============================================
export const handleUpdateVideo = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const data = request.body as any;
  try {
    const updated = await editVideo(id, data);
    reply.send(SuccessResponse(updated, "Berhasil memperbarui video"));
  } catch (err: any) {
    if (err.message === "Video Not Found") {
      return reply.status(404).send(errorResponse("Video tidak ditemukan"));
    }
    reply.status(500).send(errorResponse("Internal Server Error"));
  }
};

// ============================================
//  HANDLER: DELETE /admin/videos/:id
// ============================================
export const handleDeleteVideo = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const { hard } = request.query as { hard?: string };
  const isHard = hard === "true";
  
  try {
    const deleted = await removeVideo(id, isHard);
    reply.send(
      SuccessResponse(
        deleted, 
        isHard ? "Berhasil menghapus video secara permanen" : "Berhasil menghapus video (Soft Delete)"
      )
    );
  } catch (err: any) {
    if (err.message === "Video Not Found") {
      return reply.status(404).send(errorResponse("Video tidak ditemukan"));
    }
    reply.status(500).send(errorResponse("Internal Server Error"));
  }
};
