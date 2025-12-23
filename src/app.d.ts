// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			authUser?: import('$lib/permissions').AuthUser | null;
			session?: Session;
			user?: User;
		}
		interface PageData {
			authUser?: import('$lib/permissions').AuthUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
