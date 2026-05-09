import { db } from '$lib/server/db';
import { movies as moviesTable, genres as genresTable } from '$lib/server/db/schema';
import { eq, and, ilike, desc, sql } from 'drizzle-orm';
import { buildMediaUrl } from '$lib/server/storage';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
	const genreSlug = url.searchParams.get('genre') ?? '';
	const limit = 24;
	const offset = (page - 1) * limit;

	// Get all genres for filter
	const genres = await db.query.genres.findMany({ orderBy: genresTable.name });

	// Get selected genre
	let selectedGenre = null;
	if (genreSlug) {
		selectedGenre = await db.query.genres.findFirst({ where: eq(genresTable.slug, genreSlug) });
	}

	const allMovies = await db.query.movies.findMany({
		where: eq(moviesTable.status, 'published'),
		with: {
			poster: { columns: { storagePath: true } },
			genres: { with: { genre: { columns: { name: true, slug: true } } } }
		},
		orderBy: desc(moviesTable.createdAt)
	});

	const filtered = selectedGenre
		? allMovies.filter(m => m.genres.some(g => g.genre.slug === genreSlug))
		: allMovies;

	const totalCount = filtered.length;
	const paginatedMovies = filtered.slice(offset, offset + limit);

	return {
		movies: paginatedMovies.map(m => ({
			id: m.id,
			name: m.name,
			slug: m.slug,
			description: m.description,
			durationSeconds: m.durationSeconds,
			featured: m.featured,
			posterUrl: m.poster ? buildMediaUrl(m.poster.storagePath) : null,
			genres: m.genres.map(g => g.genre)
		})),
		genres,
		selectedGenre: genreSlug,
		pagination: {
			page,
			totalPages: Math.ceil(totalCount / limit),
			totalCount
		}
	};
};
