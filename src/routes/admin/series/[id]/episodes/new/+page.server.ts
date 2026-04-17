import { db } from '$lib/server/db';
import { episodes, series as seriesTable } from '$lib/server/db/schema';
import { parseSubtitleTracks, replaceEpisodeSubtitleTracks } from '$lib/server/subtitle-tracks';
import { eq } from 'drizzle-orm';
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function toUuid(v: FormDataEntryValue | null): string | null { const s = v as string; return s && s.trim().length > 0 ? s.trim() : null; }

export const load: PageServerLoad = async ({ params }) => {
	const series = await db.query.series.findFirst({
		where: eq(seriesTable.id, params.id),
		columns: { id: true, name: true }
	});
	if (!series) throw error(404, 'Series not found');
	return { series };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const data = await request.formData();
		const name = (data.get('name') as string)?.trim();
		const seasonNumber = parseInt(data.get('season') as string) || 1;
		const episodeNumber = parseInt(data.get('episode') as string) || 1;
		const description = (data.get('description') as string)?.trim() || null;
		const durationSeconds = data.get('duration') ? parseInt(data.get('duration') as string) * 60 : null;
		const releaseDate = data.get('releaseDate') ? new Date(data.get('releaseDate') as string) : null;
		const posterId = toUuid(data.get('posterId'));
		const videoId = toUuid(data.get('videoId'));
		const subtitleTracks = parseSubtitleTracks(data);
		const status = (data.get('status') as 'draft' | 'published') || 'draft';
		if (!name) return fail(400, { error: 'Name required' });
		try {
			const [episode] = await db.insert(episodes).values({
				seriesId: params.id, name, slug: slugify(name),
				seasonNumber, episodeNumber, description, durationSeconds,
				releaseDate, posterId, videoId, subtitleId: null, status
			}).returning({ id: episodes.id });
			const defaultSubtitleId = await replaceEpisodeSubtitleTracks(episode.id, subtitleTracks);
			if (defaultSubtitleId) {
				await db.update(episodes).set({ subtitleId: defaultSubtitleId }).where(eq(episodes.id, episode.id));
			}
		} catch (e: any) {
			if (e?.cause?.code === '23505') return fail(400, { error: 'An episode with that name already exists in this series' });
			if (e?.cause?.code === '23503') return fail(400, { error: 'Invalid file reference — please re-upload' });
			return fail(500, { error: e?.cause?.message ?? e?.message ?? 'Database error' });
		}
		throw redirect(303, `/admin/series/${params.id}/episodes`);
	}
};
