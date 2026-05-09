import { db } from '$lib/server/db';
import { watchHistory } from '$lib/server/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';
import { buildMediaUrl } from '$lib/server/storage';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const PAGE_SIZE = 10;

function parsePage(input: string | null): number {
	const value = Number(input ?? '1');
	return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.auth();
	if (!session?.user?.id) throw redirect(303, '/login');
	const page = parsePage(url.searchParams.get('page'));
	const limit = page * PAGE_SIZE;

	const [history, totalRows] = await Promise.all([
		db.query.watchHistory.findMany({
			where: eq(watchHistory.userId, session.user.id),
			with: {
				movie: {
					columns: { id: true, name: true, durationSeconds: true },
					with: { poster: { columns: { storagePath: true } } }
				},
				episode: {
					columns: { id: true, name: true, seasonNumber: true, episodeNumber: true, durationSeconds: true },
					with: {
						poster: { columns: { storagePath: true } },
						series: { columns: { id: true, name: true } }
					}
				}
			},
			orderBy: desc(watchHistory.watchedAt),
			limit
		}),
		db.select({ count: count() }).from(watchHistory).where(eq(watchHistory.userId, session.user.id))
	]);

	const totalItems = totalRows[0]?.count ?? 0;

	return {
		history: history.map((h) => {
			const m = h.movie as {
				id: string;
				name: string;
				durationSeconds: number | null;
				poster: { storagePath: string } | null;
			} | null;
			const ep = h.episode as {
				id: string;
				name: string;
				seasonNumber: number;
				episodeNumber: number;
				durationSeconds: number | null;
				poster: { storagePath: string } | null;
				series: { id: string; name: string } | null;
			} | null;
			return {
				id: h.id,
				watchedAt: h.watchedAt,
				href: m
					? `/movies/${m.id}`
					: ep?.series
						? `/series/${ep.series.id}/episode/${ep.id}`
						: null,
				title: m
					? m.name
					: ep
						? `${ep.series?.name ?? 'Series'} - S${ep.seasonNumber}E${ep.episodeNumber}: ${ep.name}`
						: 'Unavailable title',
				movie: m
					? {
							id: m.id,
							name: m.name,
							durationSeconds: m.durationSeconds,
							posterUrl: m.poster ? buildMediaUrl(m.poster.storagePath) : null
						}
					: null,
				episode: ep
					? {
							id: ep.id,
							name: ep.name,
							seasonNumber: ep.seasonNumber,
							episodeNumber: ep.episodeNumber,
							durationSeconds: ep.durationSeconds,
							series: ep.series,
							posterUrl: ep.poster ? buildMediaUrl(ep.poster.storagePath) : null
						}
					: null
			};
		}),
		pagination: {
			page,
			pageSize: PAGE_SIZE,
			loadedItems: history.length,
			totalItems,
			hasMore: history.length < totalItems
		}
	};
};

export const actions: Actions = {
	clearHistory: async ({ locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) throw redirect(303, '/login');
		await db.delete(watchHistory).where(eq(watchHistory.userId, session.user.id));
		return { success: true };
	},
	removeItem: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) throw redirect(303, '/login');
		const data = await request.formData();
		const id = data.get('id') as string;
		await db
			.delete(watchHistory)
			.where(and(eq(watchHistory.id, id), eq(watchHistory.userId, session.user.id)));
		return { success: true };
	}
};
