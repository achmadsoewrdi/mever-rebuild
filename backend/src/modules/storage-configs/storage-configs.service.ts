import * as repo from "./storage-configs.repository";
import {
  CreateStorageConfigInput,
  UpdateStorageConfigInput,
} from "./storage-configs.schema";
import { encrypt } from "../../utils/encrypt";

// ============================================
// SERVICE: Storage Configs
// ============================================

/**
 * Logika bisnis untuk membuat konfigurasi baru
 */
export const createConfig = async (
  data: CreateStorageConfigInput,
  userId?: string,
) => {
  // Enkripsi secret key sebelum disimpan ke database
  const secretKeyEnc = encrypt(data.secretKey);

  // Pisahkan secretKey dari data objek dan ganti dengan secretKeyEnc
  const { secretKey, ...rest } = data;

  return await repo.create({
    ...rest,
    secretKeyEnc,
    createdBy: userId,
  });
};

/**
 * Mengambil semua konfigurasi penyimpanan
 */
export const getAllConfigs = async () => {
  return await repo.findAll();
};

/**
 * Mengambil satu konfigurasi berdasarkan ID
 */
export const getConfigById = async (id: string) => {
  const config = await repo.findById(id);
  if (!config) {
    throw new Error("Konfigurasi tidak ditemukan");
  }
  return config;
};

/**
 * Memperbarui data konfigurasi
 */
export const updateConfig = async (
  id: string,
  data: UpdateStorageConfigInput,
) => {
  const existingConfig = await repo.findById(id);
  if (!existingConfig) {
    throw new Error("Konfigurasi tidak ditemukan");
  }

  const updateData: any = { ...data };

  // Jika user mengupdate secret key, lakukan enkripsi ulang
  if (data.secretKey) {
    updateData.secretKeyEnc = encrypt(data.secretKey);
    delete updateData.secretKey; // Hapus plain text key
  }

  return await repo.update(id, updateData);
};

/**
 * Menghapus konfigurasi penyimpanan
 */
export const deleteConfig = async (id: string) => {
  const existingConfig = await repo.findById(id);
  if (!existingConfig) {
    throw new Error("Konfigurasi tidak ditemukan");
  }
  return await repo.remove(id);
};
