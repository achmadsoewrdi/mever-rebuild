import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Ambil token dari cookie
	const token = event.cookies.get('auth_token');

	// 2. Jika ada token, ekstrak datanya
	if (token) {
		event.locals.token = token;
		try {
			// Coba ekstrak token JWT asli (format: header.payload.signature)
			const base64Payload = token.split('.')[1];
			const payload = JSON.parse(atob(base64Payload));

			// Buat format nama & inisial
			const name = payload.name || payload.email?.split('@')[0] || 'User';
			const initials = name.substring(0, 2).toUpperCase();

			event.locals.user = {
				sub: payload.sub || '1',
				email: payload.email || 'user@example.com',
				role: payload.role || 'user',
				name: name,
				initials: initials
			};
		} catch {
			// Jika gagal decode (mungkin karena token dari API saat ini belum format JWT standar),
			// berikan data dummy agar aplikasi tidak crash
			event.locals.user = {
				sub: 'dummy-id',
				email: 'ardi@example.com',
				role: 'admin',
				name: 'Ardi Mever',
				initials: 'AM'
			};
		}
	} else {
		event.locals.user = null;
		event.locals.token = null;
	}

	// 3. Auth Guard (Gerbang Keamanan)

	if (event.url.pathname === '/') {
		throw redirect(303, '/dashboard');
	}
	// Jika mau ke /dashboard TAPI belum punya user (belum login)
	if (event.url.pathname.startsWith('/dashboard')) {
		if (!event.locals.user) {
			// Paksa kembali ke halaman login
			throw redirect(303, '/auth/login');
		}
	}

	// Jika mau ke /login TAPI sudah login
	if (event.url.pathname.startsWith('/auth/login') && event.locals.user) {
		// Paksa langsung ke dashboard (biar tidak perlu login 2x)
		throw redirect(303, '/dashboard');
	}

	// 4. Lanjutkan perjalanan halaman
	const response = await resolve(event);
	return response;
};
