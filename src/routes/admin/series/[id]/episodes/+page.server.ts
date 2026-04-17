import { db } from '$lib/server/db';
import { episodes, series as seriesTable } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { MEDIA_BASE_URL } from '$lib/server/config';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const series = await db.query.series.findFirst({
		where: eq(seriesTable.id, params.id),
		columns: { id: true, name: true }
	});
	if (!series) throw error(404, 'Series not found');
	const allEpisodes = await db.query.episodes.findMany({
		where: eq(episodes.seriesId, params.id),
		with: { poster: { columns: { storagePath: true } } },
		orderBy: [asc(episodes.seasonNumber), asc(episodes.episodeNumber)]
	});
	return {
		series,
		episodes: allEpisodes.map(e => ({
			...e,
			posterUrl: e.poster ? `${MEDIA_BASE_URL}/${e.poster.storagePath}` : null
		})),
		seasons: Array.from(new Set(allEpisodes.map((episode) => episode.seasonNumber)))
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		await db.delete(episodes).where(eq(episodes.id, data.get('id') as string));
		return { success: true };
	}
};
