import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Ambil token dari cookie
	const token = event.cookies.get('auth_token');

	// 2. Jika ada token, ekstrak datanya
	if (token) {
		event.locals.token = token;
		try {
			// Ekstrak token JWT asli
			let base64Payload = token.split('.')[1];
			base64Payload = base64Payload.replace(/-/g, '+').replace(/_/g, '/');

			// Tambahkan padding jika diperlukan
			while (base64Payload.length % 4) {
				base64Payload += '=';
			}
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
			// Jika gagal decode, pastikan user dianggap tidak login
			event.locals.user = null;
			event.locals.token = null;
		}
	} else {
		event.locals.user = null;
		event.locals.token = null;
	}

	// 3. Auth Guard (Gerbang Keamanan)
	const { pathname } = event.url;

	// Catatan: Rute '/' (Landing Page) tidak di-redirect di sini
	// sehingga semua orang (login maupun belum) bisa mengaksesnya.

	// Proteksi Halaman Dashboard
	if (pathname.startsWith('/dashboard')) {
		if (!event.locals.user) {
			// Belum login, lempar ke halaman login
			throw redirect(303, '/auth/login');
		}
	}

	// Proteksi Halaman Admin
	if (pathname.startsWith('/admin')) {
		if (!event.locals.user) {
			// Belum login, lempar ke login
			throw redirect(303, '/auth/login');
		}
		if (event.locals.user.role !== 'admin') {
			// Sudah login tapi bukan admin, lempar ke dashboard user
			throw redirect(303, '/dashboard');
		}
	}

	// Mencegah user yang sudah login untuk mengakses halaman login kembali
	if (pathname.startsWith('/auth/login') && event.locals.user) {
		// Jika admin, lempar ke /admin. Jika user biasa, ke /dashboard
		throw redirect(303, event.locals.user.role === 'admin' ? '/admin' : '/dashboard');
	}

	// 4. Lanjutkan perjalanan halaman
	return await resolve(event);
};
