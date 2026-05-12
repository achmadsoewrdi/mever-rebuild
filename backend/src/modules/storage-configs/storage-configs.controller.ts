import { FastifyRequest, FastifyReply } from "fastify";
import * as service from "./storage-configs.service";
import {
  createStorageConfigSchema,
  updateStorageConfigSchema,
} from "./storage-configs.schema";
import { SuccessResponse, errorResponse } from "../../utils/response";

// ============================================
// CONTROLLER: Storage Configs
// ============================================

export const handleCreateConfig = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const parseResult = createStorageConfigSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send(errorResponse("Validasi gagal", parseResult.error.issues));
    }

    const userId = (request as any).user?.sub;
    const result = await service.createConfig(parseResult.data, userId);

    return reply
      .status(201)
      .send(
        SuccessResponse(result, "Berhasil membuat konfigurasi penyimpanan"),
      );
  } catch (err: any) {
    console.error("Create Storage Config Error:", err);
    return reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

export const handleGetAllConfigs = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const result = await service.getAllConfigs();
    return reply.send(
      SuccessResponse(
        result,
        "Berhasil mengambil semua konfigurasi penyimpanan",
      ),
    );
  } catch (err: any) {
    console.error("Get All Storage Configs Error:", err);
    return reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

export const handleGetConfigById = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  try {
    const result = await service.getConfigById(id);
    return reply.send(
      SuccessResponse(result, "Berhasil mengambil detail konfigurasi"),
    );
  } catch (err: any) {
    if (err.message === "Konfigurasi tidak ditemukan") {
      return reply
        .status(404)
        .send(errorResponse("Konfigurasi tidak ditemukan"));
    }
    console.error("Get Storage Config By Id Error:", err);
    return reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

export const handleUpdateConfig = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  try {
    const parseResult = updateStorageConfigSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send(errorResponse("Validasi gagal", parseResult.error.issues));
    }

    const result = await service.updateConfig(id, parseResult.data);

    return reply.send(
      SuccessResponse(result, "Berhasil memperbarui konfigurasi penyimpanan"),
    );
  } catch (err: any) {
    if (err.message === "Konfigurasi tidak ditemukan") {
      return reply
        .status(404)
        .send(errorResponse("Konfigurasi tidak ditemukan"));
    }
    console.error("Update Storage Config Error:", err);
    return reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

export const handleDeleteConfig = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  try {
    const result = await service.deleteConfig(id);
    return reply.send(
      SuccessResponse(result, "Berhasil menghapus konfigurasi penyimpanan"),
    );
  } catch (err: any) {
    if (err.message === "Konfigurasi tidak ditemukan") {
      return reply
        .status(404)
        .send(errorResponse("Konfigurasi tidak ditemukan"));
    }
    console.error("Delete Storage Config Error:", err);
    return reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};
