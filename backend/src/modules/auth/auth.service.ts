import { v4 as uuidv4 } from "uuid";
import { findUserByEmail, createUser } from "./auth.repository";
import { hashPassword, comparePassword } from "../../utils/hash";
import { redisCache } from "../../loaders";
import { RegisterDto, LoginDto, JwtPayload, LoginResult } from "./auth.types";

// ============================================
//  SERVICE: Auth
// ============================================

export const register = async (dto: RegisterDto) => {
  const existing = await findUserByEmail(dto.email);
  if (existing) {
    throw new Error("EMAIL_TAKEN");
  }
  const passwordHash = await hashPassword(dto.password);
  const user = await createUser({
    name: dto.name,
    email: dto.email,
    passwordHash,
  });
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
};

export const login = async (dto: LoginDto): Promise<LoginResult> => {
  const user = await findUserByEmail(dto.email);
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const isValid = await comparePassword(dto.password, user.passwordHash);
  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }
  if (user.role === "admin" && user.mfaEnabled) {
    return { mfaRequired: true, userId: user.id };
  }
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    jti: uuidv4(),
  };
  return { mfaRequired: false, payload };
};

export const logout = async (jti: string): Promise<void> => {
  await redisCache.set(
    `session:blacklist:${jti}`,
    "1",
    "EX",
    60 * 60 * 24 * 7,
  );
};
