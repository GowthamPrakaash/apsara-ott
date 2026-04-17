import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { watchHistory } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Unauthorized' }, { status: 401 });

	const { movieId, episodeId } = await request.json();
	if (!movieId && !episodeId) return json({ error: 'Invalid' }, { status: 400 });

	// Upsert watch history
	const existing = await db.query.watchHistory.findFirst({
		where: and(
			eq(watchHistory.userId, session.user.id),
			movieId ? eq(watchHistory.movieId, movieId) : eq(watchHistory.episodeId, episodeId)
		)
	});

	if (existing) {
		await db.update(watchHistory)
			.set({ progressSeconds: 0, watchedAt: new Date() })
			.where(eq(watchHistory.id, existing.id));
	} else {
		await db.insert(watchHistory).values({
			userId: session.user.id,
			movieId: movieId ?? null,
			episodeId: episodeId ?? null,
			progressSeconds: 0,
			watchedAt: new Date()
		});
	}

	return json({ ok: true });
};
