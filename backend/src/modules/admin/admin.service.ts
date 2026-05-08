import {
  getAllUser,
  changeUserRole,
  toggleUserStatus,
} from "./admin.repository";

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
