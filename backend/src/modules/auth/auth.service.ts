import { v4 as uuidv4 } from "uuid";
import {
  findUserByEmail,
  createUser,
  findUserById,
  updateMfaSecret,
  enableMfa,
  checkExistingEmail,
  checkExistingPendingRequest,
  createAccountRequest
} from "./auth.repository";
import { hashPassword, comparePassword } from "../../utils/hash";
import { redisCache } from "../../loaders";
import { RegisterDto, LoginDto, JwtPayload, LoginResult } from "./auth.types";
import { generateSecret, verify, generateURI } from "otplib";
import { RequestsAccountInput } from "./auth.schema";

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

  if (user.mfaEnabled) {
    // Jika mfaTrustToken disertakan, cek validitasnya di Redis
    if (dto.mfaTrustToken) {
      const trustedUserId = await redisCache.get(`mfa:trust:${dto.mfaTrustToken}`);
      if (trustedUserId === user.id) {
        // Bypass MFA karena token valid
        const payload: JwtPayload = {
          sub: user.id,
          email: user.email,
          role: user.role,
          jti: uuidv4(),
        };
        return { mfaRequired: false, payload };
      }
    }
    return { mfaRequired: true, userId: user.id };
  } else {
    // Semua user wajib setup MFA jika belum mengaktifkan
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: "MEVER",
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

  // Menghapus batasan role admin agar user biasa bisa setup MFA
  // if (user.role !== "admin") { ... }

  const secret = generateSecret();
  const otpauthUrl = generateURI({
    issuer: "MEVER",
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

  // Buat MFA Trust Token berlaku 7 hari
  const mfaTrustToken = uuidv4();
  await redisCache.set(`mfa:trust:${mfaTrustToken}`, user.id, "EX", 60 * 60 * 24 * 7);

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    jti: uuidv4(),
  };

  return { success: true, payload, mfaTrustToken };
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
  const lockoutKey = `mfa:lockout:${userId}`;
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

    // Buat MFA Trust Token berlaku 7 hari
    const mfaTrustToken = uuidv4();
    await redisCache.set(`mfa:trust:${mfaTrustToken}`, user.id, "EX", 60 * 60 * 24 * 7);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: uuidv4(),
    };

    return { payload, mfaTrustToken };
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

// request account
export const requestAccount = async(payload:RequestsAccountInput)=>{
  const isEmailTaken = await checkExistingEmail(payload.email);
  if(isEmailTaken){
    throw new Error("EMAIL_ALREADY_EXIST");
  }

  const isPending = await checkExistingPendingRequest(payload.email);
  if(isPending){
    throw new Error("REQUEST_ALREADY_PENDING");
  }

  const newRequest = await createAccountRequest(payload);
  return newRequest;
}