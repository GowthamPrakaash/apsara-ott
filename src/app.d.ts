// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { UserRole } from '$lib/types';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth(): Promise<import('@auth/core').Session | null>;
		}
		interface PageData {
			session: import('@auth/core').Session | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

// Augment session user type with role
declare module '@auth/core' {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			role?: string;
		};
	}
}

export {};
