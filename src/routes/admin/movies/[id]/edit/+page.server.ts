import { db } from '$lib/server/db';
import { movies, genres, movieGenres } from '$lib/server/db/schema';
import { loadMovieSubtitleTracks, parseSubtitleTracks, replaceMovieSubtitleTracks } from '$lib/server/subtitle-tracks';
import { eq, asc } from 'drizzle-orm';
import { MEDIA_BASE_URL } from '$lib/server/config';
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function toUuid(v: FormDataEntryValue | null): string | null { const s = v as string; return s && s.trim().length > 0 ? s.trim() : null; }

export const load: PageServerLoad = async ({ params }) => {
	const [movie, allGenres, existingSubtitleTracks] = await Promise.all([
		db.query.movies.findFirst({
			where: eq(movies.id, params.id),
			with: {
				poster: { columns: { id: true, storagePath: true } },
				video: { columns: { id: true, storagePath: true } },
				subtitle: { columns: { id: true, storagePath: true } },
				genres: { with: { genre: { columns: { id: true, name: true } } } }
			}
		}),
		db.query.genres.findMany({ orderBy: asc(genres.name) }),
		loadMovieSubtitleTracks(params.id)
	]);
	if (!movie) throw error(404, 'Movie not found');
	const subtitleTracks = existingSubtitleTracks.map((track) => ({
		language: track.language,
		fileId: track.mediaFile.id,
		fileName: track.mediaFile.originalName,
		isDefault: track.isDefault
	}));
	return {
		movie: {
			...movie,
			posterUrl: movie.poster ? `${MEDIA_BASE_URL}/${movie.poster.storagePath}` : null,
			selectedGenreIds: movie.genres.map(g => g.genre.id),
			subtitleTracks
		},
		genres: allGenres
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const description = (data.get('description') as string)?.trim() || null;
		const durationSeconds = data.get('duration') ? parseInt(data.get('duration') as string) * 60 : null;
		const releaseDate = data.get('releaseDate') ? new Date(data.get('releaseDate') as string) : null;
		const posterId = toUuid(data.get('posterId'));
		const videoId = toUuid(data.get('videoId'));
		const subtitleTracks = parseSubtitleTracks(data);
		const status = (data.get('status') as 'draft' | 'published') || 'draft';
		const featured = data.get('featured') === 'on';
		const trending = data.get('trending') === 'on';
		const genreIds = data.getAll('genreIds') as string[];
		if (!name) return fail(400, { error: 'Name is required' });
		try {
			const defaultSubtitleId = await replaceMovieSubtitleTracks(params.id, subtitleTracks);
			await db.update(movies).set({
				name, slug: slugify(name), description, durationSeconds, releaseDate,
				posterId, videoId, subtitleId: defaultSubtitleId, status, featured, trending, updatedAt: new Date()
			}).where(eq(movies.id, params.id));
			await db.delete(movieGenres).where(eq(movieGenres.movieId, params.id));
			if (genreIds.length > 0) {
				await db.insert(movieGenres).values(genreIds.map(gid => ({ movieId: params.id, genreId: gid })));
			}
		} catch (e: any) {
			if (e?.cause?.code === '23505') return fail(400, { error: 'A movie with that name/slug already exists' });
			if (e?.cause?.code === '23503') return fail(400, { error: 'Invalid file reference — please re-upload' });
			return fail(500, { error: e?.cause?.message ?? e?.message ?? 'Database error' });
		}
		throw redirect(303, '/admin/movies');
	}
};
