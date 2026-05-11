import { FastifyRequest, FastifyReply } from "fastify";
import * as service from "./quality-presets.service";
import {
  createQualityPresetSchema,
  updateQualityPresetSchema,
} from "./quality-presets.schema";
import { SuccessResponse, errorResponse } from "../../utils/response";

// ============================================
// CONTROLLER: Quality Presets
// ============================================

/**
 * Handler untuk membuat preset baru
 */
export const handleCreatePreset = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    // 1. Validasi body menggunakan Zod Schema
    const parseResult = createQualityPresetSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send(errorResponse("Validasi gagal", parseResult.error.issues));
    }

    // 2. Ambil user ID dari request (dari JWT Auth middleware)
    const userId = (request as any).user?.sub;

    // 3. Panggil service
    const result = await service.createPreset(parseResult.data, userId);

    return reply
      .status(201)
      .send(SuccessResponse(result, "Berhasil membuat preset kualitas"));
  } catch (err: any) {
    console.error("Create Preset Error:", err);
    return reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

/**
 * Handler untuk mengambil semua preset
 */
export const handleGetAllPresets = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const result = await service.getAllPresets();
    return reply.send(
      SuccessResponse(result, "Berhasil mengambil semua preset kualitas"),
    );
  } catch (err: any) {
    console.error("Get All Presets Error:", err);
    return reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

/**
 * Handler untuk mengambil satu preset berdasarkan ID
 */
export const handleGetPresetById = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  try {
    const result = await service.getPresetById(id);
    return reply.send(
      SuccessResponse(result, "Berhasil mengambil detail preset"),
    );
  } catch (err: any) {
    if (err.message === "Preset tidak ditemukan") {
      return reply.status(404).send(errorResponse("Preset tidak ditemukan"));
    }
    console.error("Get Preset By Id Error:", err);
    return reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

/**
 * Handler untuk memperbarui preset
 */
export const handleUpdatePreset = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  try {
    // 1. Validasi body
    const parseResult = updateQualityPresetSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send(errorResponse("Validasi gagal", parseResult.error.issues));
    }

    // 2. Panggil service
    const result = await service.updatePreset(id, parseResult.data);

    return reply.send(
      SuccessResponse(result, "Berhasil memperbarui preset kualitas"),
    );
  } catch (err: any) {
    if (err.message === "Preset tidak ditemukan") {
      return reply.status(404).send(errorResponse("Preset tidak ditemukan"));
    }
    console.error("Update Preset Error:", err);
    return reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

/**
 * Handler untuk menghapus preset
 */
export const handleDeletePreset = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { id } = request.params as { id: string };
  try {
    const result = await service.deletePreset(id);
    return reply.send(
      SuccessResponse(result, "Berhasil menghapus preset kualitas"),
    );
  } catch (err: any) {
    if (err.message === "Preset tidak ditemukan") {
      return reply.status(404).send(errorResponse("Preset tidak ditemukan"));
    }
    console.error("Delete Preset Error:", err);
    return reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};
