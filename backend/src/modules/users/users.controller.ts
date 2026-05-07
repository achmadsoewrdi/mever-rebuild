import { FastifyReply, FastifyRequest } from "fastify";
import * as userService from "./users.service";
import { SuccessResponse, errorResponse } from "../../utils/response";

/**
 * handle GET /user/me
 */

export const handleGetMe = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = request.user.sub;
    const user = await userService.getProfile(userId);
    return reply.status(200).send(SuccessResponse(user));
  } catch (error: any) {
    reply.status(400).send(errorResponse(error.message));
  }
};

/**
 * Handle update - PUT / users/me
 */

export const handleUpdateMe = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = request.user.sub;
    const body = request.body as {
      name?: string;
      email?: string;
    };

    const updateUser = await userService.editProfile(userId, body);
    return reply
      .status(200)
      .send(SuccessResponse(updateUser, "Profile Updated"));
  } catch (error: any) {
    const status = error.message === "Email Already Taken" ? 409 : 400;
    reply.status(status).send(errorResponse(error.message));
  }
};

/**
 * Handle change password
 */

export const handleChangePassword = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const userId = request.user.sub;
    const { oldPassword, newPassword } = request.body as any;

    if (!oldPassword || !newPassword) {
      return reply
        .status(400)
        .send(errorResponse("Password lama dan Baru wajib diisi"));
    }
    await userService.changePassword(userId, oldPassword, newPassword);
    return reply
      .status(200)
      .send(SuccessResponse(null, "Password Berhasil diperbarui"));
  } catch (error: any) {
    const status = error.message === "Old Password Incorrect" ? 401 : 400;
    return reply.status(status).send(errorResponse(error.message));
  }
};
