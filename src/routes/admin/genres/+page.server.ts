import { db } from '$lib/server/db';
import { genres } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

function slugify(str: string) {
	return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export const load: PageServerLoad = async () => {
	const allGenres = await db.query.genres.findMany({ orderBy: asc(genres.name) });
	return { genres: allGenres };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		if (!name) return fail(400, { error: 'Name is required' });
		const slug = slugify(name);
		try {
			await db.insert(genres).values({ name, slug });
			return { success: true };
		} catch (e: any) {
			if (e.code === '23505') return fail(400, { error: 'Genre already exists' });
			throw e;
		}
	},
	update: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = (data.get('name') as string)?.trim();
		if (!name || !id) return fail(400, { error: 'Invalid data' });
		await db.update(genres).set({ name, slug: slugify(name) }).where(eq(genres.id, id));
		return { success: true };
	},
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		await db.delete(genres).where(eq(genres.id, id));
		return { success: true };
	}
};
