import { db } from '$lib/server/db';
import { series } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { buildMediaUrl } from '$lib/server/storage';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const allSeries = await db.query.series.findMany({
		with: {
			poster: { columns: { storagePath: true } },
			genres: { with: { genre: { columns: { name: true } } } },
			episodes: { columns: { id: true } }
		},
		orderBy: desc(series.createdAt)
	});
	return {
		series: allSeries.map(s => ({
			...s,
			posterUrl: s.poster ? buildMediaUrl(s.poster.storagePath) : null,
			genreNames: s.genres.map(g => g.genre.name),
			episodeCount: s.episodes.length
		}))
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		await db.delete(series).where(eq(series.id, data.get('id') as string));
		return { success: true };
	}
};
