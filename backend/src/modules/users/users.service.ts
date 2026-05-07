import * as userRepository from "./users.repository";
import { findUserByEmail } from "../auth/auth.repository";
import { comparePassword, hashPassword } from "../../utils/hash";

/**
 * Service User:
 * menangani logika bisnis utama untuk manajemen user
 */

/**
 * get Profile
 */

export const getProfile = async (userId: string) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new Error("User Not Found");
  }
  return user;
};

/**
 * Edit Profile
 */

export const editProfile = async (
  userId: string,
  data: { name?: string; email?: string },
) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User Not Found");
  }
  if (data.email && data.email !== user.email) {
    const isEmailTaken = await findUserByEmail(data.email);
    if (isEmailTaken) {
      throw new Error("Email Already Taken");
    }
  }
  return await userRepository.updateProfile(userId, data);
};

/**
 * CHANGE PASSWORD
 */

export const changePassword = async (
  userId: string,
  oldPass: string,
  newPass: string,
) => {
  const user = await userRepository.findWithPassword(userId);
  if (!user) {
    throw new Error("User Not Found");
  }

  const isMatch = await comparePassword(oldPass, user.passwordHash);
  if (!isMatch) {
    throw new Error("Old Password Incorrect");
  }

  const hashedNewPass = await hashPassword(newPass);
  await userRepository.updatePassword(userId, hashedNewPass);
  return { success: true };
};
