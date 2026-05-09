import { db } from '$lib/server/db';
import { movies } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { buildMediaUrl } from '$lib/server/storage';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const allMovies = await db.query.movies.findMany({
		with: {
			poster: { columns: { storagePath: true } },
			genres: { with: { genre: { columns: { name: true } } } }
		},
		orderBy: desc(movies.createdAt)
	});
	return {
		movies: allMovies.map(m => ({
			...m,
			posterUrl: m.poster ? buildMediaUrl(m.poster.storagePath) : null,
			genreNames: m.genres.map(g => g.genre.name)
		}))
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const data = await request.formData();
		await db.delete(movies).where(eq(movies.id, data.get('id') as string));
		return { success: true };
	}
};
