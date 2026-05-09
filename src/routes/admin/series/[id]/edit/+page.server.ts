import { db } from '$lib/server/db';
import { series, genres, seriesGenres } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { buildMediaUrl } from '$lib/server/storage';
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export const load: PageServerLoad = async ({ params }) => {
	const [s, allGenres] = await Promise.all([
		db.query.series.findFirst({
			where: eq(series.id, params.id),
			with: {
				poster: { columns: { id: true, storagePath: true } },
				genres: { with: { genre: { columns: { id: true, name: true } } } }
			}
		}),
		db.query.genres.findMany({ orderBy: asc(genres.name) })
	]);
	if (!s) throw error(404, 'Series not found');
	return {
		series: { ...s, posterUrl: s.poster ? buildMediaUrl(s.poster.storagePath) : null, selectedGenreIds: s.genres.map(g => g.genre.id) },
		genres: allGenres
	};
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const description = (data.get('description') as string)?.trim() || null;
		const posterId = (data.get('posterId') as string) || null;
		const status = (data.get('status') as 'draft' | 'published') || 'draft';
		const featured = data.get('featured') === 'on';
		const trending = data.get('trending') === 'on';
		const genreIds = data.getAll('genreIds') as string[];
		if (!name) return fail(400, { error: 'Name is required' });
		await db.update(series).set({ name, slug: slugify(name), description, posterId, status, featured, trending, updatedAt: new Date() }).where(eq(series.id, params.id));
		await db.delete(seriesGenres).where(eq(seriesGenres.seriesId, params.id));
		if (genreIds.length > 0) await db.insert(seriesGenres).values(genreIds.map(gid => ({ seriesId: params.id, genreId: gid })));
		throw redirect(303, '/admin/series');
	}
};
