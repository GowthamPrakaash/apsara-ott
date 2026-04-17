import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { canChangeUserRole, canManageUsers } from '$lib/access';
import { count, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import type { UserRole } from '$lib/types';

const ROLES: UserRole[] = ['viewer', 'editor', 'admin', 'super_admin'];

async function getActorRole(userId: string): Promise<UserRole | null> {
	const dbUser = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: { role: true }
	});

	return dbUser?.role ?? null;
}

async function getSuperAdminCount(): Promise<number> {
	const result = await db
		.select({ count: count() })
		.from(users)
		.where(eq(users.role, 'super_admin'));

	return result[0]?.count ?? 0;
}

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const actorRole = await getActorRole(session.user.id);
	if (!actorRole || !canManageUsers(actorRole)) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const body = await request.json().catch(() => null);
	const nextRole = body?.role as UserRole | undefined;
	if (!nextRole || !ROLES.includes(nextRole)) {
		return json({ error: 'Invalid role' }, { status: 400 });
	}

	const targetUser = await db.query.users.findFirst({
		where: eq(users.id, params.id),
		columns: { id: true, role: true }
	});

	if (!targetUser) {
		return json({ error: 'User not found' }, { status: 404 });
	}

	if (!canChangeUserRole(actorRole, targetUser.role, nextRole)) {
		return json({ error: 'You are not allowed to assign this role' }, { status: 403 });
	}

	if (targetUser.role === 'super_admin' && nextRole !== 'super_admin') {
		const superAdminCount = await getSuperAdminCount();
		if (superAdminCount <= 1) {
			return json({ error: 'At least one super admin is required' }, { status: 400 });
		}
	}

	await db.update(users).set({ role: nextRole }).where(eq(users.id, params.id));
	return json({ success: true });
};
