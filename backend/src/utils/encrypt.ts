import crypto from "crypto";
import { env } from "../config/env";
import { buffer } from "stream/consumers";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(env.ENCRYPTION_KEY, "utf-8");

// ================
// ENCRYPT TOOLS
// ================
export const encrypt = (plainText: string): string => {
  const iv = crypto.randomBytes(16);
  const chiper = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    chiper.update(plainText, "utf-8"),
    chiper.final(),
  ]);

  const authTag = chiper.getAuthTag();
  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
};

// ================
// DECRYPT TOOLS
// ================

export const decrypt = (encryptedText: string): string => {
  const [ivHex, authTagHex, encryptedHex] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const dechiper = crypto.createDecipheriv(ALGORITHM, KEY, iv);

  dechiper.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    dechiper.update(encrypted),
    dechiper.final(),
  ]);

  return decrypted.toString("utf-8");
};
