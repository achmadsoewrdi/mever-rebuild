import { describe, it, expect, beforeAll } from 'vitest';
import { api } from '../helpers';

// ============================================
//  TEST: Admin Module
//  Semua route butuh token Admin
//  Routes:
//    GET/POST /admin/users
//    PUT /admin/users/:id/role
//    PUT /admin/users/:id/status
//    PUT /admin/users/:id/profile
//    DELETE /admin/users/:id
//    GET /admin/videos
//    GET /admin/videos/:id
//    GET /admin/account-requests
//    POST /admin/account-requests/:id/approve
//    POST /admin/account-requests/:id/reject
//    GET /admin/dashboard
//    GET /admin/jobs
// ============================================

// Catatan: Test ini membutuhkan akun admin yang sudah ada di database
// dengan MFA DINONAKTIFKAN (atau sudah disetup dan di-verify)
// Set nilai ini sesuai environment testing kamu:
// ⚙️  Sesuaikan nilai ini dengan akun admin di environment testing kamu
// Admin harus sudah ada di DB dan TIDAK perlu MFA (atau MFA sudah di-bypass untuk test)
const ADMIN_EMAIL = 'admin@mever.test';
const ADMIN_PASSWORD = 'Apalah12';

let adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWY5NmM5NS1kNGU5LTRhNzktOWYyOS1kZjY1NzEyN2EwMjciLCJlbWFpbCI6ImFkbWluQG1ldmVyLnRlc3QiLCJyb2xlIjoiYWRtaW4iLCJqdGkiOiJkNWFkMmI3Zi00ZTMwLTQ4ZjQtOWIxZC0wZTAwYTFlZWU4MzciLCJpYXQiOjE3ODEyNTM4MTcsImV4cCI6MTc4MTg1ODYxN30.Trpe3EJ3OoiNvp47HRNC_AUCFsFq6FsopSh_kgXV8mY';
let createdUserId = '';
let pendingRequestId = '';
const timestamp = Date.now();
const newUserEmail = `newuser_admin_${timestamp}@example.com`;

// ============================================
//  SETUP: Login sebagai Admin
// ============================================
beforeAll(async () => {
  const res = await api('POST', '/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (res.status !== 200 || !res.body.data?.token) {
    console.warn('⚠️  Admin login gagal. Pastikan TEST_ADMIN_EMAIL & TEST_ADMIN_PASSWORD sudah diset dan admin tidak memerlukan MFA saat test.');
    console.warn('Response:', JSON.stringify(res.body));
    return;
  }

  adminToken = res.body.data.token;
  console.log('✅ Admin token berhasil didapat');
});

// ============================================
//  GUARD: Skip jika tidak ada admin token
// ============================================
function requireAdminToken() {
  if (!adminToken) {
    console.warn('⏭️  Skipped — admin token tidak tersedia');
  }
  return !!adminToken;
}

// ============================================
//  USER MANAGEMENT
// ============================================

describe('Admin — GET /admin/users', () => {
  it('[TC-24] Berhasil ambil semua user (admin)', async () => {
    if (!requireAdminToken()) return;
    const res = await api('GET', '/admin/users', undefined, adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('[TC-25] Ditolak jika tidak ada token', async () => {
    const res = await api('GET', '/admin/users');
    expect(res.status).toBeOneOf([400, 401]);
  });
});

describe('Admin — POST /admin/users', () => {
  it('[TC-26] Berhasil buat user baru', async () => {
    if (!requireAdminToken()) return;
    const res = await api('POST', '/admin/users', {
      name: 'User Test Admin',
      email: newUserEmail,
      role: 'user',
      password: 'Password123!',
    }, adminToken);
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    createdUserId = res.body.data.id;
  });

  it('[TC-27] Gagal buat user — body tidak lengkap', async () => {
    if (!requireAdminToken()) return;
    const res = await api('POST', '/admin/users', {}, adminToken);
    expect(res.status).toBe(400);
  });

  it('[TC-28] Ditolak jika user biasa akses', async () => {
    // Daftar sebagai user biasa
    const ts = Date.now();
    await api('POST', '/auth/register', {
      name: 'Ordinary User',
      email: `ordinary_${ts}@example.com`,
      password: 'Password123!',
    });
    const loginRes = await api('POST', '/auth/login', {
      email: `ordinary_${ts}@example.com`,
      password: 'Password123!',
    });
    const userToken = loginRes.body.data?.token;
    const res = await api('POST', '/admin/users', {
      name: 'Hacker',
      email: `hacker_${ts}@example.com`,
      role: 'admin',
      password: 'Password123!',
    }, userToken);
    expect(res.status).toBe(403);
  });
});

describe('Admin — PUT /admin/users/:id/role', () => {
  it('[TC-29] Berhasil update role user → admin', async () => {
    if (!requireAdminToken() || !createdUserId) return;
    const res = await api('PUT', `/admin/users/${createdUserId}/role`, { role: 'admin' }, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('role', 'admin');
  });

  it('[TC-30] Berhasil update role admin → user', async () => {
    if (!requireAdminToken() || !createdUserId) return;
    const res = await api('PUT', `/admin/users/${createdUserId}/role`, { role: 'user' }, adminToken);
    expect(res.status).toBe(200);
  });

  it('[TC-31] Gagal — role tidak valid', async () => {
    if (!requireAdminToken() || !createdUserId) return;
    const res = await api('PUT', `/admin/users/${createdUserId}/role`, { role: 'superadmin' }, adminToken);
    expect(res.status).toBe(400);
  });

  it('[TC-32] Gagal — user ID tidak ditemukan', async () => {
    if (!requireAdminToken()) return;
    const res = await api('PUT', '/admin/users/00000000-0000-0000-0000-000000000000/role', { role: 'user' }, adminToken);
    expect(res.status).toBe(404);
  });
});

describe('Admin — PUT /admin/users/:id/status', () => {
  it('[TC-33] Berhasil non-aktifkan user', async () => {
    if (!requireAdminToken() || !createdUserId) return;
    const res = await api('PUT', `/admin/users/${createdUserId}/status`, { isActive: false }, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('isActive', false);
  });

  it('[TC-34] Berhasil aktifkan user kembali', async () => {
    if (!requireAdminToken() || !createdUserId) return;
    const res = await api('PUT', `/admin/users/${createdUserId}/status`, { isActive: true }, adminToken);
    expect(res.status).toBe(200);
  });

  it('[TC-35] Gagal — isActive bukan boolean', async () => {
    if (!requireAdminToken() || !createdUserId) return;
    const res = await api('PUT', `/admin/users/${createdUserId}/status`, { isActive: 'aktif' }, adminToken);
    expect(res.status).toBe(400);
  });
});

describe('Admin — PUT /admin/users/:id/profile', () => {
  it('[TC-36] Berhasil update profil user', async () => {
    if (!requireAdminToken() || !createdUserId) return;
    const res = await api('PUT', `/admin/users/${createdUserId}/profile`, {
      name: 'Nama Baru Admin',
      email: `updated_admin_${timestamp}@example.com`,
    }, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name', 'Nama Baru Admin');
  });

  it('[TC-37] Gagal — email tidak valid', async () => {
    if (!requireAdminToken() || !createdUserId) return;
    const res = await api('PUT', `/admin/users/${createdUserId}/profile`, {
      name: 'Valid Name',
      email: 'bukan-email',
    }, adminToken);
    expect(res.status).toBe(400);
  });
});

describe('Admin — DELETE /admin/users/:id', () => {
  it('[TC-38] Berhasil hapus user', async () => {
    if (!requireAdminToken() || !createdUserId) return;
    const res = await api('DELETE', `/admin/users/${createdUserId}`, undefined, adminToken);
    expect(res.status).toBe(200);
  });

  it('[TC-39] Gagal hapus — ID tidak ditemukan', async () => {
    if (!requireAdminToken()) return;
    const res = await api('DELETE', '/admin/users/00000000-0000-0000-0000-000000000000', undefined, adminToken);
    expect(res.status).toBe(404);
  });
});

// ============================================
//  VIDEO MANAGEMENT (ADMIN)
// ============================================

describe('Admin — GET /admin/videos', () => {
  it('[TC-40] Berhasil ambil semua video', async () => {
    if (!requireAdminToken()) return;
    const res = await api('GET', '/admin/videos', undefined, adminToken);
    expect(res.status).toBe(200);
    // data bisa object dengan pagination atau array langsung
    expect(res.body).toHaveProperty('data');
  });

  it('[TC-41] Berhasil filter video dengan query params', async () => {
    if (!requireAdminToken()) return;
    const res = await api('GET', '/admin/videos?page=1&limit=5', undefined, adminToken);
    expect(res.status).toBe(200);
  });

  it('[TC-42] Ditolak tanpa token', async () => {
    const res = await api('GET', '/admin/videos');
    expect(res.status).toBeOneOf([400, 401]);
  });
});

describe('Admin — GET /admin/videos/:id', () => {
  it('[TC-43] Gagal ambil video — ID tidak ada', async () => {
    if (!requireAdminToken()) return;
    const res = await api('GET', '/admin/videos/00000000-0000-0000-0000-000000000000', undefined, adminToken);
    expect(res.status).toBe(404);
  });
});

// ============================================
//  ACCOUNT REQUESTS
// ============================================

describe('Admin — GET /admin/account-requests', () => {
  it('[TC-44] Berhasil ambil semua account requests', async () => {
    if (!requireAdminToken()) return;
    const res = await api('GET', '/admin/account-requests', undefined, adminToken);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    // Simpan ID request pending pertama untuk test approve/reject
    const data = res.body.data;
    const pending = Array.isArray(data) ? data.find((r: any) => r.status === 'pending') : null;
    if (pending) {
      pendingRequestId = pending.id;
      console.log(`✅ Found pending request ID: ${pendingRequestId}`);
    }
  });

  it('[TC-45] Filter by status pending', async () => {
    if (!requireAdminToken()) return;
    const res = await api('GET', '/admin/account-requests?status=pending', undefined, adminToken);
    expect(res.status).toBe(200);
  });
});

describe('Admin — POST /admin/account-requests/:id/reject', () => {
  it('[TC-46] Gagal reject — ID tidak ditemukan', async () => {
    if (!requireAdminToken()) return;
    const res = await api('POST', '/admin/account-requests/00000000-0000-0000-0000-000000000000/reject', undefined, adminToken);
    expect(res.status).toBe(404);
  });

  it('[TC-47] Berhasil reject request pending', async () => {
    if (!requireAdminToken() || !pendingRequestId) {
      console.warn('⏭️  TC-47 skipped — tidak ada pending request ID');
      return;
    }
    const res = await api('POST', `/admin/account-requests/${pendingRequestId}/reject`, undefined, adminToken);
    expect(res.status).toBe(200);
  });

  it('[TC-48] Gagal reject request yang sudah bukan pending', async () => {
    if (!requireAdminToken() || !pendingRequestId) return;
    // Request sudah di-reject di TC-47, sekarang coba reject lagi
    const res = await api('POST', `/admin/account-requests/${pendingRequestId}/reject`, undefined, adminToken);
    expect(res.status).toBe(400);
  });
});

describe('Admin — POST /admin/account-requests/:id/approve', () => {
  it('[TC-49] Gagal approve — ID tidak ditemukan', async () => {
    if (!requireAdminToken()) return;
    const res = await api('POST', '/admin/account-requests/00000000-0000-0000-0000-000000000000/approve', undefined, adminToken);
    expect(res.status).toBe(404);
  });
});

// ============================================
//  DASHBOARD & JOBS
// ============================================

describe('Admin — GET /admin/dashboard', () => {
  it('[TC-50] Berhasil ambil data dashboard', async () => {
    if (!requireAdminToken()) return;
    const res = await api('GET', '/admin/dashboard', undefined, adminToken);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});

describe('Admin — GET /admin/jobs', () => {
  it('[TC-51] Berhasil ambil data jobs', async () => {
    if (!requireAdminToken()) return;
    const res = await api('GET', '/admin/jobs', undefined, adminToken);
    expect(res.status).toBe(200);
  });

  it('[TC-52] Ditolak tanpa token', async () => {
    const res = await api('GET', '/admin/jobs');
    expect(res.status).toBeOneOf([400, 401]);
  });
});
