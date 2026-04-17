import { canAccessAdmin, canManageContent, canManageUsers, getRolePermissions } from '$lib/access';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) throw redirect(303, '/login?callbackUrl=/admin');

	const dbUser = await db.query.users.findFirst({
		where: eq(users.id, session.user.id),
		columns: { role: true }
	});

	if (!dbUser || !canAccessAdmin(dbUser.role)) {
		throw redirect(303, '/');
	}

	return {
		session,
		userRole: dbUser.role,
		capabilities: {
			canManageUsers: canManageUsers(dbUser.role),
			canManageContent: canManageContent(dbUser.role),
			permissions: getRolePermissions(dbUser.role)
		}
	};
};
