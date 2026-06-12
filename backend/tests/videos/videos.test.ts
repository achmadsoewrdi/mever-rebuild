import { describe, it, expect, beforeAll } from 'vitest';
import { api } from '../helpers';

// ============================================
//  TEST: Videos Module
//  Routes:
//    GET  /videos          — daftar video (auth)
//    GET  /videos/:id      — detail video (auth)
//    POST /videos/request-upload — minta presigned URL (auth)
//    POST /videos/:id/confirm   — konfirmasi upload (auth)
//    GET  /videos/:id/stream    — ambil stream URL (auth)
// ============================================

const timestamp = Date.now();
const userEmail = `videotest_${timestamp}@example.com`;
const userPassword = 'Password123!';
let userToken = '';
let createdVideoId = '';

beforeAll(async () => {
  // Register & login user biasa
  await api('POST', '/auth/register', {
    name: 'Video Test User',
    email: userEmail,
    password: userPassword,
  });

  const loginRes = await api('POST', '/auth/login', {
    email: userEmail,
    password: userPassword,
  });

  userToken = loginRes.body.data?.token || '';
  if (!userToken) {
    console.warn('⚠️  Login gagal untuk video test user');
  }
});

// ============================================
//  GET /videos
// ============================================

describe('Videos — GET /videos', () => {
  it('[TC-53] Berhasil ambil daftar video dengan auth', async () => {
    const res = await api('GET', '/videos', undefined, userToken);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('[TC-54] Berhasil filter dengan query params', async () => {
    const res = await api('GET', '/videos?page=1&limit=5', undefined, userToken);
    expect(res.status).toBe(200);
  });

  it('[TC-55] Gagal filter dengan query tidak valid', async () => {
    // page=0 invalid (min=1)
    const res = await api('GET', '/videos?page=0', undefined, userToken);
    expect(res.status).toBe(400);
  });

  it('[TC-56] Ditolak tanpa auth token', async () => {
    const res = await api('GET', '/videos');
    expect(res.status).toBeOneOf([400, 401]);
  });
});

// ============================================
//  POST /videos/request-upload
// ============================================

describe('Videos — POST /videos/request-upload', () => {
  it('[TC-57] Berhasil request upload presigned URL', async () => {
    const res = await api('POST', '/videos/request-upload', {
      title: `Test Video ${timestamp}`,
      description: 'Video untuk integration test',
      originalName: 'test_video.mp4',
      fileSizeBytes: 1024 * 1024 * 10, // 10 MB
      targetCodec: 'h264',
      targetProtocol: 'hls',
    }, userToken);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('uploadUrl');
    expect(res.body.data).toHaveProperty('video');
    expect(res.body.data.video).toHaveProperty('id');
    createdVideoId = res.body.data.video.id;
    console.log(`✅ Video ID dibuat: ${createdVideoId}`);
  });

  it('[TC-58] Gagal — title kosong', async () => {
    const res = await api('POST', '/videos/request-upload', {
      title: '',
      originalName: 'test.mp4',
    }, userToken);
    expect(res.status).toBe(400);
  });

  it('[TC-59] Gagal — originalName tidak ada', async () => {
    const res = await api('POST', '/videos/request-upload', {
      title: 'Test Video',
    }, userToken);
    expect(res.status).toBe(400);
  });

  it('[TC-60] Gagal — codec tidak valid', async () => {
    const res = await api('POST', '/videos/request-upload', {
      title: 'Test Video',
      originalName: 'test.mp4',
      targetCodec: 'hevc_invalid',
    }, userToken);
    expect(res.status).toBe(400);
  });

  it('[TC-61] Ditolak tanpa auth token', async () => {
    const res = await api('POST', '/videos/request-upload', {
      title: 'Test Video',
      originalName: 'test.mp4',
    });
    expect(res.status).toBeOneOf([400, 401]);
  });
});

// ============================================
//  GET /videos/:id
// ============================================

describe('Videos — GET /videos/:id', () => {
  it('[TC-62] Berhasil ambil detail video yang sudah dibuat', async () => {
    if (!createdVideoId) {
      console.warn('⏭️  TC-62 skipped — createdVideoId tidak ada (TC-57 gagal)');
      return;
    }
    const res = await api('GET', `/videos/${createdVideoId}`, undefined, userToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', createdVideoId);
  });

  it('[TC-63] Gagal — video ID tidak ditemukan', async () => {
    // Harus pakai format UUID yang valid, kalau tidak Postgres akan error 500
    const res = await api('GET', '/videos/00000000-0000-0000-0000-000000000000', undefined, userToken);
    expect(res.status).toBe(404);
  });

  it('[TC-64] Ditolak tanpa auth', async () => {
    const res = await api('GET', '/videos/some-id');
    expect(res.status).toBeOneOf([400, 401]);
  });
});

// ============================================
//  GET /videos/:id/stream
// ============================================

describe('Videos — GET /videos/:id/stream', () => {
  it('[TC-65] Gagal stream — video belum ready (status uploading)', async () => {
    if (!createdVideoId) {
      console.warn('⏭️  TC-65 skipped — createdVideoId tidak ada');
      return;
    }
    const res = await api('GET', `/videos/${createdVideoId}/stream`, undefined, userToken);
    // Video baru dibuat, statusnya 'uploading' — belum bisa distream
    expect(res.status).toBeOneOf([400, 404]);
  });

  it('[TC-66] Gagal stream — video ID tidak ada', async () => {
    // Harus pakai format UUID yang valid
    const res = await api('GET', '/videos/00000000-0000-0000-0000-000000000000/stream', undefined, userToken);
    expect(res.status).toBe(404);
  });
});

// ============================================
//  POST /videos/:id/confirm
// ============================================

describe('Videos — POST /videos/:id/confirm', () => {
  it('[TC-67] Konfirmasi upload pada video yang ada', async () => {
    if (!createdVideoId) {
      console.warn('⏭️  TC-67 skipped — createdVideoId tidak ada');
      return;
    }
    const res = await api('POST', `/videos/${createdVideoId}/confirm`, undefined, userToken);
    // 200 = berhasil confirm atau sudah pernah confirm sebelumnya
    expect(res.status).toBe(200);
  });
});
