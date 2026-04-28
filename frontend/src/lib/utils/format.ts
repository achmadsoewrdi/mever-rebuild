/**
 * Format detik ke format durasi Video (HH:MM:SS atau MM:SS)
 */

export function formatDuration(seconds: number): string {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);

	const parts = [];

	if (h > 0) parts.push(h);
	parts.push(h > 0 ? m.toString().padStart(2, '0') : m);
	parts.push(s.toString().padStart(2, '0'));

	return parts.join(':');
}

/**
 * format bytes ke ukuran file manusiasi
 * contoh : 1048576 -> "1.0 mb"
 */

export function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * format tanggal standar (locale indonesia)
 * constoh : "28 Apr 2026"
 */

export function formatDate(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return new Intl.DateTimeFormat('id-ID', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(d);
}

/**
 * format waktu relatif (locale indonesia)
 * contoh: "3 Jam yang lalu"
 */

export function formatRelativeTime(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffInSeconds = Math.floor((d.getTime() - now.getTime()) / 1000);
	const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
		{ unit: 'year', seconds: 31536000 },
		{ unit: 'month', seconds: 2592000 },
		{ unit: 'week', seconds: 604800 },
		{ unit: 'day', seconds: 86400 },
		{ unit: 'hour', seconds: 3600 },
		{ unit: 'minute', seconds: 60 },
		{ unit: 'second', seconds: 1 }
	];

	const rtf = new Intl.RelativeTimeFormat('id-ID', {
		numeric: 'auto'
	});
	for (const { unit, seconds } of units) {
		if (Math.abs(diffInSeconds) >= seconds || unit === 'second') {
			return rtf.format(Math.round(diffInSeconds / seconds), unit);
		}
	}
	return '';
}
