import { describe, it, expect, beforeAll } from 'vitest';
import { api } from '../helpers';

// ============================================
//  TEST: Users (Self) Module
//  Routes: GET /users/me, PUT /users/me, PUT /users/me/password
//  NOTE: prefix /users diregister di app.ts baris 25
// ============================================

const timestamp = Date.now();
const testEmail = `metest_${timestamp}@example.com`;
const testPassword = 'Password123!';
let userToken = '';

beforeAll(async () => {
  await api('POST', '/auth/register', {
    name: 'Me Test User',
    email: testEmail,
    password: testPassword,
  });

  const loginRes = await api('POST', '/auth/login', {
    email: testEmail,
    password: testPassword,
  });
  userToken = loginRes.body.data.token;
});

describe('Users — GET /users/me', () => {
  it('[TC-18] Berhasil ambil data profil sendiri', async () => {
    const res = await api('GET', '/users/me', undefined, userToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('email', testEmail);
    expect(res.body.data).not.toHaveProperty('passwordHash');
  });

  it('[TC-19] Gagal tanpa auth token', async () => {
    const res = await api('GET', '/users/me');
    expect(res.status).toBeOneOf([400, 401]);
  });
});

describe('Users — PUT /users/me', () => {
  it('[TC-20] Berhasil update nama dan email', async () => {
    const newName = 'Updated Name';
    const newEmail = `updated_${timestamp}@example.com`;

    const res = await api('PUT', '/users/me', { name: newName, email: newEmail }, userToken);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('name', newName);
  });

  it('[TC-21] Gagal update tanpa auth', async () => {
    const res = await api('PUT', '/users/me', { name: 'hacker' });
    expect(res.status).toBeOneOf([400, 401]);
  });
});

describe('Users — PUT /users/me/password', () => {
  const newPassword = 'NewPassword456!';

  it('[TC-22] Berhasil ganti password', async () => {
    const res = await api(
      'PUT',
      '/users/me/password',
      { oldPassword: testPassword, newPassword },
      userToken,
    );
    expect(res.status).toBe(200);
  });

  it('[TC-23] Gagal ganti password — old password salah', async () => {
    const res = await api(
      'PUT',
      '/users/me/password',
      { oldPassword: 'passwordsalah', newPassword: 'SomethingNew123!' },
      userToken,
    );
    expect(res.status).toBeOneOf([400, 401]);
  });
});
