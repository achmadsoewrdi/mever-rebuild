declare global {
	namespace App {
		interface Locals {
			user: { sub: string; email: string; role: string; name: string; initials: string } | null;
			token: string | null;
		}
		interface PageData {
			user: App.Locals['user'];
		}
	}
}
export {};
