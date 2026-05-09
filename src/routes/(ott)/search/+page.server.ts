import { db } from '$lib/server/db';
import { movies as moviesTable, series as seriesTable } from '$lib/server/db/schema';
import { eq, ilike, or } from 'drizzle-orm';
import { buildMediaUrl } from '$lib/server/storage';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';

	if (!q.trim()) return { q: '', movies: [], series: [] };

	const [movies, series] = await Promise.all([
		db.query.movies.findMany({
			where: (m, { and }) => and(eq(m.status, 'published'), ilike(m.name, `%${q}%`)),
			with: { poster: { columns: { storagePath: true } }, genres: { with: { genre: { columns: { name: true, slug: true } } } } },
			limit: 20
		}),
		db.query.series.findMany({
			where: (s, { and }) => and(eq(s.status, 'published'), ilike(s.name, `%${q}%`)),
			with: { poster: { columns: { storagePath: true } }, genres: { with: { genre: { columns: { name: true, slug: true } } } } },
			limit: 20
		})
	]);

	return {
		q,
		movies: movies.map(m => ({
			id: m.id, name: m.name, slug: m.slug,
			posterUrl: m.poster ? buildMediaUrl(m.poster.storagePath) : null,
			genres: m.genres.map(g => g.genre),
			durationSeconds: m.durationSeconds,
			featured: m.featured
		})),
		series: series.map(s => ({
			id: s.id, name: s.name, slug: s.slug,
			posterUrl: s.poster ? buildMediaUrl(s.poster.storagePath) : null,
			genres: s.genres.map(g => g.genre),
			featured: s.featured
		}))
	};
};
