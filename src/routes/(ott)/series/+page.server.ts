import { db } from '$lib/server/db';
import { series as seriesTable, genres as genresTable } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { MEDIA_BASE_URL } from '$lib/server/config';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
	const genreSlug = url.searchParams.get('genre') ?? '';
	const limit = 24;
	const offset = (page - 1) * limit;

	const genres = await db.query.genres.findMany({ orderBy: genresTable.name });

	const allSeries = await db.query.series.findMany({
		where: eq(seriesTable.status, 'published'),
		with: {
			poster: { columns: { storagePath: true } },
			genres: { with: { genre: { columns: { name: true, slug: true } } } }
		},
		orderBy: desc(seriesTable.createdAt)
	});

	const filtered = genreSlug
		? allSeries.filter(s => s.genres.some(g => g.genre.slug === genreSlug))
		: allSeries;

	const totalCount = filtered.length;
	const paginated = filtered.slice(offset, offset + limit);

	return {
		series: paginated.map(s => ({
			id: s.id,
			name: s.name,
			slug: s.slug,
			description: s.description,
			featured: s.featured,
			posterUrl: s.poster ? `${MEDIA_BASE_URL}/${s.poster.storagePath}` : null,
			genres: s.genres.map(g => g.genre)
		})),
		genres,
		selectedGenre: genreSlug,
		pagination: { page, totalPages: Math.ceil(totalCount / limit), totalCount }
	};
};
