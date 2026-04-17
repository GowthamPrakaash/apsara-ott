import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) throw redirect(303, '/login');

	const dbUser = await db.query.users.findFirst({
		where: eq(users.id, session.user.id),
		columns: { id: true, name: true, email: true, image: true, role: true, createdAt: true }
	});

	return { user: dbUser };
};
