import { db } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { eq, desc, and } from 'drizzle-orm';
import { movies as moviesTable, series as seriesTable } from '$lib/server/db/schema';
import { MEDIA_BASE_URL as mediaBaseUrl } from '$lib/server/config';

function buildPosterUrl(storagePath: string | null | undefined): string | null {
	if (!storagePath) return null;
	return `${mediaBaseUrl}/${storagePath}`;
}

export const load: PageServerLoad = async () => {
	const [
		featuredMovies,
		featuredSeries,
		trendingMovies,
		trendingSeries,
		recentMovies,
		recentSeries
	] = await Promise.all([
		db.query.movies.findMany({
			where: and(eq(moviesTable.featured, true), eq(moviesTable.status, 'published')),
			with: {
				poster: { columns: { storagePath: true } },
				genres: { with: { genre: { columns: { name: true, slug: true } } } }
			},
			orderBy: desc(moviesTable.createdAt),
			limit: 8
		}),
		db.query.series.findMany({
			where: and(eq(seriesTable.featured, true), eq(seriesTable.status, 'published')),
			with: {
				poster: { columns: { storagePath: true } },
				genres: { with: { genre: { columns: { name: true, slug: true } } } }
			},
			orderBy: desc(seriesTable.createdAt),
			limit: 8
		}),
		db.query.movies.findMany({
			where: and(eq(moviesTable.trending, true), eq(moviesTable.status, 'published')),
			with: {
				poster: { columns: { storagePath: true } },
				genres: { with: { genre: { columns: { name: true, slug: true } } } }
			},
			orderBy: desc(moviesTable.viewCount),
			limit: 10
		}),
		db.query.series.findMany({
			where: and(eq(seriesTable.trending, true), eq(seriesTable.status, 'published')),
			with: {
				poster: { columns: { storagePath: true } },
				genres: { with: { genre: { columns: { name: true, slug: true } } } }
			},
			orderBy: desc(seriesTable.viewCount),
			limit: 10
		}),
		db.query.movies.findMany({
			where: eq(moviesTable.status, 'published'),
			with: {
				poster: { columns: { storagePath: true } },
				genres: { with: { genre: { columns: { name: true, slug: true } } } }
			},
			orderBy: desc(moviesTable.createdAt),
			limit: 10
		}),
		db.query.series.findMany({
			where: eq(seriesTable.status, 'published'),
			with: {
				poster: { columns: { storagePath: true } },
				genres: { with: { genre: { columns: { name: true, slug: true } } } }
			},
			orderBy: desc(seriesTable.createdAt),
			limit: 10
		})
	]);

	function mapMovie(m: typeof featuredMovies[number]) {
		return {
			id: m.id,
			name: m.name,
			slug: m.slug,
			description: m.description,
			durationSeconds: m.durationSeconds,
			posterUrl: buildPosterUrl(m.poster?.storagePath),
			genres: m.genres.map(g => g.genre),
			featured: m.featured,
			type: 'movie' as const
		};
	}

	function mapSeries(s: typeof featuredSeries[number]) {
		return {
			id: s.id,
			name: s.name,
			slug: s.slug,
			description: s.description,
			posterUrl: buildPosterUrl(s.poster?.storagePath),
			genres: s.genres.map(g => g.genre),
			featured: s.featured,
			type: 'series' as const
		};
	}

	// Combine featured for hero
	const heroItems = [
		...featuredMovies.slice(0, 3).map(mapMovie),
		...featuredSeries.slice(0, 2).map(mapSeries)
	].slice(0, 5);

	return {
		heroItems,
		featuredMovies: featuredMovies.map(mapMovie),
		featuredSeries: featuredSeries.map(mapSeries),
		trendingMovies: trendingMovies.map(mapMovie),
		trendingSeries: trendingSeries.map(mapSeries),
		recentMovies: recentMovies.map(mapMovie),
		recentSeries: recentSeries.map(mapSeries)
	};
};
