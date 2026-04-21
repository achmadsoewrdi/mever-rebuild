import { v4 as uuidv4 } from "uuid";
import { authRepository } from "./auth.repository";
import { hashPassword, comparePassword } from "../../utils/hash";
import { redisCache } from "../../loaders";
import { RegisterDto, LoginDto, JwtPayload, LoginResult } from "./auth.types";
import { userRoleEnum } from "../../../drizzle/schema";

class AuthService {
  async register(dto: RegisterDto) {
    const exsisting = await authRepository.findByEmail(dto.email);
    if (exsisting) {
      throw new Error("EMAIL_TAKEN");
    }
    const passwordHash = await hashPassword(dto.password);
    const user = await authRepository.createUser({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await authRepository.findByEmail(dto.email);
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
  }

  async logout(jti: string): Promise<void> {
    await redisCache.set(
      `session:blacklist:${jti}`,
      "1",
      "EX",
      60 * 60 * 24 * 7,
    );
  }
}

export const authService = new AuthService();
