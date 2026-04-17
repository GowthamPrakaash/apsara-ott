import { db } from '$lib/server/db';
import { watchlist } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { MEDIA_BASE_URL } from '$lib/server/config';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) throw redirect(303, '/login');

	const items = await db.query.watchlist.findMany({
		where: eq(watchlist.userId, session.user.id),
		with: {
			movie: { with: { poster: { columns: { storagePath: true } } } },
			series: { with: { poster: { columns: { storagePath: true } } } }
		},
		orderBy: (watchlist, { desc }) => [desc(watchlist.addedAt)]
	});

	return {
		watchlist: items.map(item => {
			const m = item.movie as { id: string; name: string; poster: { storagePath: string } | null } | null;
			const s = item.series as { id: string; name: string; poster: { storagePath: string } | null } | null;
			return {
				id: item.id,
				addedAt: item.addedAt,
				movie: m ? { id: m.id, name: m.name, posterUrl: m.poster ? `${MEDIA_BASE_URL}/${m.poster.storagePath}` : null } : null,
				series: s ? { id: s.id, name: s.name, posterUrl: s.poster ? `${MEDIA_BASE_URL}/${s.poster.storagePath}` : null } : null
			};
		})
	};
};

export const actions: Actions = {
	toggle: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) throw redirect(303, '/login');
		const data = await request.formData();
		const movieId = (data.get('movieId') as string) || null;
		const seriesId = (data.get('seriesId') as string) || null;
		const userId = session.user.id;

		// Check if already in watchlist
		const existing = await db.query.watchlist.findFirst({
			where: and(
				eq(watchlist.userId, userId),
				movieId ? eq(watchlist.movieId, movieId) : eq(watchlist.seriesId, seriesId!)
			)
		});
		if (existing) {
			await db.delete(watchlist).where(eq(watchlist.id, existing.id));
		} else {
			await db.insert(watchlist).values({ userId, movieId, seriesId });
		}
		return { success: true };
	},
	remove: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) throw redirect(303, '/login');
		const data = await request.formData();
		const id = data.get('id') as string;
		await db.delete(watchlist).where(and(eq(watchlist.id, id), eq(watchlist.userId, session.user.id)));
		return { success: true };
	}
};
