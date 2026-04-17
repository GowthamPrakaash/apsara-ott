import { handle as authHandle } from '$lib/server/auth';
import { canAccessAdmin, canManageContent } from '$lib/access';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { eq } from 'drizzle-orm';
import type { Handle } from '@sveltejs/kit';

const guardHandle: Handle = async ({ event, resolve }) => {
	const session = await event.locals.auth();
	const url = event.url.pathname;
	const dbUser =
		session?.user?.id
			? await db.query.users.findFirst({
					where: eq(users.id, session.user.id),
					columns: { role: true }
				})
			: null;
	const role = dbUser?.role;

	// Protect /admin routes
	if (url.startsWith('/admin')) {
		if (!session?.user) {
			throw redirect(303, `/login?callbackUrl=${encodeURIComponent(url)}`);
		}
		if (!canAccessAdmin(role)) {
			throw redirect(303, '/');
		}
	}

	if (url.startsWith('/api/upload')) {
		if (!session?.user) {
			throw redirect(303, `/login?callbackUrl=${encodeURIComponent(url)}`);
		}
		if (!canManageContent(role)) {
			throw redirect(303, '/');
		}
	}

	// Protect /profile routes
	if (url.startsWith('/profile') && !session?.user) {
		throw redirect(303, `/login?callbackUrl=${encodeURIComponent(url)}`);
	}

	return resolve(event);
};

export const handle = sequence(authHandle, guardHandle);
