import { describe, it, expect } from 'vitest';
import { api } from '../helpers';

// ============================================
//  TEST: Auth Module
//  Routes: POST /auth/register, /auth/login, /auth/logout, /auth/request-account
// ============================================

const timestamp = Date.now();
const testEmail = `testuser_${timestamp}@example.com`;
const testPassword = 'Password123!';

describe('Auth — POST /auth/register', () => {
  it('[TC-01] Register berhasil dengan data valid', async () => {
    const res = await api('POST', '/auth/register', {
      name: 'Test User',
      email: testEmail,
      password: testPassword,
    });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('email', testEmail);
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('[TC-02] Register gagal — email sudah terdaftar', async () => {
    const res = await api('POST', '/auth/register', {
      name: 'Test User',
      email: testEmail,
      password: testPassword,
    });
    expect(res.status).toBe(409);
  });

  it('[TC-03] Register gagal — body kosong', async () => {
    const res = await api('POST', '/auth/register', {});
    expect(res.status).toBe(400);
  });

  it('[TC-04] Register gagal — format email tidak valid', async () => {
    const res = await api('POST', '/auth/register', {
      name: 'Test User',
      email: 'bukan-email',
      password: testPassword,
    });
    expect(res.status).toBe(400);
  });
});

describe('Auth — POST /auth/login', () => {
  it('[TC-05] Login berhasil — user biasa', async () => {
    const res = await api('POST', '/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('[TC-06] Login gagal — password salah', async () => {
    const res = await api('POST', '/auth/login', {
      email: testEmail,
      password: 'passwordsalah',
    });
    expect(res.status).toBe(401);
  });

  it('[TC-07] Login gagal — email tidak terdaftar', async () => {
    const res = await api('POST', '/auth/login', {
      email: 'emailtidakada@test.com',
      password: testPassword,
    });
    expect(res.status).toBe(401);
  });

  it('[TC-08] Login gagal — body kosong', async () => {
    const res = await api('POST', '/auth/login', {});
    expect(res.status).toBe(400);
  });
});

describe('Auth — POST /auth/logout', () => {
  it('[TC-11] Logout berhasil dengan token valid', async () => {
    const loginRes = await api('POST', '/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.data?.token;
    expect(token).toBeTruthy();

    const res = await api('POST', '/auth/logout', undefined, token);
    expect(res.status).toBe(200);
  });

  it('[TC-12] Logout gagal — tanpa token', async () => {
    const res = await api('POST', '/auth/logout');
    expect(res.status).toBeOneOf([400, 401]);
  });

  it('[TC-13] Logout gagal — token sudah di-blacklist (logout 2x)', async () => {
    const loginRes = await api('POST', '/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    const token = loginRes.body.data?.token;

    await api('POST', '/auth/logout', undefined, token);
    const res = await api('POST', '/auth/logout', undefined, token);
    expect(res.status).toBeOneOf([400, 401]);
  });
});

describe('Auth — POST /auth/request-account', () => {
  const reqEmail = `reqtest_${timestamp}@example.com`;

  it('[TC-14] Request account berhasil', async () => {
    const res = await api('POST', '/auth/request-account', {
      name: 'Pemohon Baru',
      email: reqEmail,
      department: 'IT Department',
    });
    expect(res.status).toBeOneOf([201, 429]);
    if (res.status === 201) {
      expect(res.body.data).toHaveProperty('id');
    }
  });

  it('[TC-15] Request gagal — email sudah terdaftar sebagai user', async () => {
    const res = await api('POST', '/auth/request-account', {
      name: 'Test User',
      email: testEmail,
      department: 'IT',
    });
    expect(res.status).toBeOneOf([409, 429]);
  });

  it('[TC-16] Request gagal — sudah ada request pending untuk email ini', async () => {
    const res = await api('POST', '/auth/request-account', {
      name: 'Pemohon Baru',
      email: reqEmail,
      department: 'IT Department',
    });
    expect(res.status).toBeOneOf([409, 429]);
  });

  it('[TC-17] Request gagal — body tidak lengkap', async () => {
    const res = await api('POST', '/auth/request-account', {});
    expect(res.status).toBeOneOf([400, 429]);
  });
});
