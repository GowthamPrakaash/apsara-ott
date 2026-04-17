import { db } from '$lib/server/db';
import { movies, genres, movieGenres } from '$lib/server/db/schema';
import { parseSubtitleTracks, replaceMovieSubtitleTracks } from '$lib/server/subtitle-tracks';
import { asc, eq } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function toUuid(v: FormDataEntryValue | null): string | null { const s = v as string; return s && s.trim().length > 0 ? s.trim() : null; }

export const load: PageServerLoad = async () => {
	const allGenres = await db.query.genres.findMany({ orderBy: asc(genres.name) });
	return { genres: allGenres };
};

export const actions: Actions = {
	default: async ({ request }) => {
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
			const [movie] = await db.insert(movies).values({
				name, slug: slugify(name), description, durationSeconds, releaseDate,
				posterId, videoId, subtitleId: null, status, featured, trending
			}).returning({ id: movies.id });
			if (genreIds.length > 0) {
				await db.insert(movieGenres).values(genreIds.map(gid => ({ movieId: movie.id, genreId: gid })));
			}
			const defaultSubtitleId = await replaceMovieSubtitleTracks(movie.id, subtitleTracks);
			if (defaultSubtitleId) {
				await db.update(movies).set({ subtitleId: defaultSubtitleId }).where(eq(movies.id, movie.id));
			}
		} catch (e: any) {
			if (e?.cause?.code === '23505') return fail(400, { error: 'A movie with that name/slug already exists' });
			if (e?.cause?.code === '23503') return fail(400, { error: 'Invalid file reference — please re-upload' });
			console.error('[movies/new] DB error:', e?.cause ?? e);
			return fail(500, { error: e?.cause?.message ?? e?.message ?? 'Database error' });
		}
		throw redirect(303, '/admin/movies');
	}
};
