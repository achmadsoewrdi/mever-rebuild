import crypto from 'crypto';

/**
 * Menghasilkan password acak
 * 
 * @param length penjang bytes akan di generate (defaulr 4 bytes = 8 karakter hex)
 * @returns string password acak (contoh: 'a1b2c3d4')
 */

export const generateRandomPassword = (length: number = 4): string => {
    return crypto.randomBytes(length).toString("hex");
}