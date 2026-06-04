import { FastifyRequest, FastifyReply } from "fastify";
import {
  listVideos,
  getVideoById,
  requestUpload,
  confirmUpload,
  getVideoStream,
} from "./videos.service";
import { requestUploadSchema, videoFilterSchema } from "./videos.schema";
import { SuccessResponse, errorResponse } from "../../utils/response";

// ============================================
//  HANDLER: GET /videos
// ============================================
export const handleListVideos = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  console.log(">>>>>>>>>> [REQUEST MASUK] GET /videos <<<<<<<<<<");
  console.log("[BACKEND CONTROLLER] Query raw:", JSON.stringify(request.query));
  const parsed = videoFilterSchema.safeParse(request.query);
  if (!parsed.success) {
    console.error(
      "[BACKEND CONTROLLER] Validasi filter GAGAL:",
      parsed.error.format(),
    );
    return reply
      .status(400)
      .send(errorResponse("Query parameter tidak valid", parsed.error.issues));
  }
  console.log("[BACKEND CONTROLLER] Validasi sukses, memanggil service...");
  try {
    const videos = await listVideos(parsed.data);
    reply
      .status(200)
      .send(SuccessResponse(videos, "Berhasil mengambil daftar video"));
  } catch (err: any) {
    console.error("LIST Videos Error:", err);
    reply
      .status(500)
      .send(errorResponse(err.message + " | Stack: " + err.stack));
  }
};

// ============================================
//  HANDLER: GET /videos/:id
// ============================================
export const handleGetVideoById = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { id } = request.params as { id: string };
  try {
    const video = await getVideoById(id);
    reply
      .status(200)
      .send(SuccessResponse(video, "Berhasil mengambil detail video"));
  } catch (err: any) {
    if (err.message === "VIDEO_NOT_FOUND") {
      return reply.status(404).send(errorResponse("Video tidak ditemukan"));
    }
    console.error("Get By Id Error:", err);
    reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

// ============================================
//  HANDLER: POST /videos/request-upload
// ============================================
export const handleRequestUpload = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const parsed = requestUploadSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .status(400)
      .send(errorResponse("Input tidak valid", parsed.error.issues));
  }
  try {
    const userId = request.user.sub;
    const result = await requestUpload(userId, parsed.data);
    reply
      .status(200)
      .send(SuccessResponse(result, "Presigned URL berhasil dibuat"));
  } catch (err: any) {
    console.error("Request Upload Error:", err);
    reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

// ============================================
//  HANDLER: POST /videos/:id/confirm
// ============================================
export const handleConfirmUpload = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { id } = request.params as { id: string };
  try {
    await confirmUpload(id);
    reply
      .status(200)
      .send(SuccessResponse(null, "Upload terkonfirmasi. Video siap ditonton"));
  } catch (err: any) {
    console.error("Confirm Upload Error:", err);
    reply.status(500).send(errorResponse("Terjadi kesalahan server"));
  }
};

// ============================================
//  HANDLER: GET /videos/:id/stream
// ============================================
//
export const handleGetVideostream = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const { id } = request.params as { id: string };
  try {
    const streamInfo = await getVideoStream(id);
    reply
      .status(200)
      .send(SuccessResponse(streamInfo, "Stream URL Berhasil Diambil"));
  } catch (err: any) {
    if (err.message === "VIDEO_NOT_FOUND") {
      return reply.status(404).send(errorResponse("VIDEO TIDAK DITEMUKAN"));
    }
    if (err.message === "VIDEO_NOT_READY") {
      return reply.status(400).send(errorResponse("VIDEO BELUM SIAP DITONTON"));
    }
    if (err.message === "VIDEO_STREAM_NOT_AVAILABLE") {
      return reply.status(404).send(errorResponse("STREAM URL BELUM TERSEDIA"));
    }
    console.error("Get Stream Error:", err);
    reply.status(500).send(errorResponse("Terjadi Kesalahan Server"));
  }
};
