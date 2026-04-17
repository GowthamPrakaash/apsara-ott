import { db } from '$lib/server/db';
import { series, genres, seriesGenres } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export const load: PageServerLoad = async () => {
	const allGenres = await db.query.genres.findMany({ orderBy: asc(genres.name) });
	return { genres: allGenres };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const description = (data.get('description') as string)?.trim() || null;
		const posterId = (data.get('posterId') as string) || null;
		const status = (data.get('status') as 'draft' | 'published') || 'draft';
		const featured = data.get('featured') === 'on';
		const trending = data.get('trending') === 'on';
		const genreIds = data.getAll('genreIds') as string[];
		if (!name) return fail(400, { error: 'Name is required' });
		const [s] = await db.insert(series).values({ name, slug: slugify(name), description, posterId, status, featured, trending }).returning({ id: series.id });
		if (genreIds.length > 0) await db.insert(seriesGenres).values(genreIds.map(gid => ({ seriesId: s.id, genreId: gid })));
		throw redirect(303, '/admin/series');
	}
};
