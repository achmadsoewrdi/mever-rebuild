import { v4 as uuidv4 } from "uuid";
import {
  findUserByEmail,
  createUser,
  findUserById,
  updateMfaSecret,
  enableMfa,
} from "./auth.repository";
import { hashPassword, comparePassword } from "../../utils/hash";
import { redisCache } from "../../loaders";
import { RegisterDto, LoginDto, JwtPayload, LoginResult } from "./auth.types";
import { generateSecret, verify, generateURI } from "otplib";

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

  // console.log("🔍 DEBUG LOGIN - User Data:", {
  //   email: user.email,
  //   role: user.role,
  //   mfaEnabled: user.mfaEnabled
  // });

  if (user.role === "admin") {
    if (user.mfaEnabled) {
      return { mfaRequired: true, userId: user.id };
    } else {
      // Admin tapi belum aktifkan MFA -> Paksa Setup
      const secret = generateSecret();
      const otpauthUrl = generateURI({
        issuer: "MEVER ADMIN",
        label: user.email,
        secret,
      });
      await updateMfaSecret(user.id, secret);

      return {
        mfaSetupRequired: true,
        userId: user.id,
        otpauthUrl,
      } as any;
    }
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
  await redisCache.set(`session:blacklist:${jti}`, "1", "EX", 60 * 60 * 24 * 7);
};

/**
 * SETUP MFA
 */

export const setupMFA = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("USER NOT FOUND");
  }

  if (user.role !== "admin") {
    throw new Error("MFA ADMIN ONLY");
  }

  const secret = generateSecret();
  const otpauthUrl = generateURI({
    issuer: "MEVER ADMIN",
    label: user.email,
    secret,
  });

  await updateMfaSecret(userId, secret);
  return { secret, otpauthUrl };
};

/**
 * ENABLE MFA
 */

export const verifyAndEnableMFA = async (userId: string, token: string) => {
  const user = await findUserById(userId);
  if (!user || !user.mfaSecretEnc) {
    throw new Error("MFA NOT SETUP");
  }

  const result = await verify({
    token,
    secret: user.mfaSecretEnc,
  });

  if (!result.valid) {
    throw new Error("INVALID MFA TOKEN");
  }

  await enableMfa(userId);

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    jti: uuidv4(),
  };

  return { success: true, payload };
};

/**
 * VERIFY MFA LOGIN
 */

export const verifyMFALogin = async (userId: string, token: string) => {
  const user = await findUserById(userId);
  if (!user || !user.mfaEnabled || !user.mfaSecretEnc) {
    throw new Error("MFA NOT ENABLED");
  }

  // lockout key
  const lockoutKey = `mfa:LockoutKay: ${userId}`;
  const maxAttempts = 3;
  const lockDuration = 600; //10 menit dalam hitungan detik

  // cek apakah akun sedang di lock
  const currentAttempts = await redisCache.get(lockoutKey);
  const attemptsCount = currentAttempts ? parseInt(currentAttempts, 10) : 0;

  if (attemptsCount >= maxAttempts) {
    throw new Error("Account Locked Try Again in 10 minutes");
  }

  // otplib bersifat async
  const result = await verify({
    token,
    secret: user.mfaSecretEnc,
  });

  if (result.valid) {
    // Bersihkan history kesalahan di Redis jika berhasil
    await redisCache.del(lockoutKey);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: uuidv4(),
    };

    return payload;
  }

  // Jika gagal, hitung kesalahan
  const newAttempts = attemptsCount + 1;

  if (newAttempts >= maxAttempts) {
    // Jika sudah salah 3 kali, kunci selama 10 menit
    await redisCache.set(
      lockoutKey,
      newAttempts.toString(),
      "EX",
      lockDuration,
    );
    throw new Error("Account Locked Try Again in 10 minutes");
  } else {
    // Jika belum sampai 3 kali, update jumlah salahnya
    await redisCache.set(
      lockoutKey,
      newAttempts.toString(),
      "EX",
      lockDuration,
    );
    throw new Error(
      `Invalid MFA Token. Remaining attempts: ${maxAttempts - newAttempts}`,
    );
  }
};
