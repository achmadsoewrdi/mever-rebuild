import bycrypt from "bcryptjs";

const SALT = 12;

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bycrypt.hash(plainPassword, SALT);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bycrypt.compare(plainPassword, hashedPassword);
};
