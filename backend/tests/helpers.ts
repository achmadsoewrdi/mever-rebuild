import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = 'http://localhost:3000';

// ============================================
// HELPERS
// ============================================

async function api(
  method: string,
  path: string,
  body?: object,
  token?: string,
) {
  const headers: Record<string, string> = {};

  // Hanya kirim Content-Type jika ada body
  // (Tanpa ini, Fastify akan coba parse JSON kosong dan return 400)
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { status: res.status, body: json };
}

export async function loginAs(email: string, password: string): Promise<string> {
  const res = await api('POST', '/auth/login', { email, password });
  if (res.status !== 200) throw new Error(`Login gagal: ${JSON.stringify(res.body)}`);
  return res.body.token;
}

export { api, BASE_URL };
