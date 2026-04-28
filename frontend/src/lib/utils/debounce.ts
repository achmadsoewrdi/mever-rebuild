/**
 * Fungsi Debounce untuk menunda eksekusi fungsi sampai waktu tunggu (delay) terpenuhi
 * Berguna untuk input search, window resize, dll.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	fn: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return function (this: unknown, ...args: Parameters<T>) {
		// Hapus timeout sebelumnya jika user masih melakukan aksi
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		// Setel ulang timeout baru
		timeoutId = setTimeout(() => {
			fn.apply(this, args);
		}, delay);
	};
}
