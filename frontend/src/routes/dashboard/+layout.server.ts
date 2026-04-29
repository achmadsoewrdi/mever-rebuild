import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Karena kita sudah melindungi route /dashboard di hooks.server.ts,
	// locals.user PASTI ada isinya jika sampai ke halaman ini.
	
	// Data ini akan otomatis masuk ke objek `data` di +layout.svelte
	return {
		user: locals.user
	};
};
