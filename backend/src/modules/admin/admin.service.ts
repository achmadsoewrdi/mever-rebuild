import {
  getAllUser,
  changeUserRole,
  toggleUserStatus,
  deleteUser,
  createUser as createUserRepo,
} from "./admin.repository";
import { hashPassword } from "../../utils/hash";

export const getAllUsers = async () => {
  return await getAllUser();
};

/**
 * mengubah role user
 */

export const updateUserRole = async (
  userId: string,
  newRole: "admin" | "user",
) => {
  const updateUser = await changeUserRole(userId, newRole);
  if (!updateUser) {
    throw new Error("User Not Found");
  }

  return updateUser;
};

/**
 * function untuk suspend dan unsuspend account user
 */

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const updateUser = await toggleUserStatus(userId, isActive);
  if (!updateUser) {
    throw new Error("User Not Found");
  }

  return updateUser;
};

/**
 * function untuk menghapus user
 */

export const removeUser = async (userId: string) => {
  const deleteuser = await deleteUser(userId);
  if (!deleteuser) {
    throw new Error("User Not Found");
  }

  return deleteuser;
};

export const createUser = async (data: { name: string; email: string; role: "admin" | "user"; password?: string }) => {
  const passwordHash = await hashPassword(data.password || "defaultPassword");
  
  const newUser = await createUserRepo({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
  });
  
  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
};
