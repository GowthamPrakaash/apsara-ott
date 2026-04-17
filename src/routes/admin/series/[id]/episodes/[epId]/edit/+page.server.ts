import { db } from '$lib/server/db';
import { episodes, series as seriesTable } from '$lib/server/db/schema';
import { loadEpisodeSubtitleTracks, parseSubtitleTracks, replaceEpisodeSubtitleTracks } from '$lib/server/subtitle-tracks';
import { eq } from 'drizzle-orm';
import { MEDIA_BASE_URL } from '$lib/server/config';
import { error, redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function toUuid(v: FormDataEntryValue | null): string | null { const s = v as string; return s && s.trim().length > 0 ? s.trim() : null; }

export const load: PageServerLoad = async ({ params }) => {
	const [ep, series, existingSubtitleTracks] = await Promise.all([
		db.query.episodes.findFirst({
			where: eq(episodes.id, params.epId),
			with: {
				poster: { columns: { id: true, storagePath: true } },
				video: { columns: { id: true, storagePath: true } },
				subtitle: { columns: { id: true, storagePath: true } }
			}
		}),
		db.query.series.findFirst({
			where: eq(seriesTable.id, params.id),
			columns: { id: true, name: true }
		}),
		loadEpisodeSubtitleTracks(params.epId)
	]);
	if (!ep || !series) throw error(404, 'Not found');
	const subtitleTracks = existingSubtitleTracks.map((track) => ({
		language: track.language,
		fileId: track.mediaFile.id,
		fileName: track.mediaFile.originalName,
		isDefault: track.isDefault
	}));
	return {
		episode: {
			...ep,
			posterUrl: ep.poster ? `${MEDIA_BASE_URL}/${ep.poster.storagePath}` : null,
			subtitleTracks
		},
		series
	};
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
			const defaultSubtitleId = await replaceEpisodeSubtitleTracks(params.epId, subtitleTracks);
			await db.update(episodes).set({
				name, slug: slugify(name), seasonNumber, episodeNumber, description,
				durationSeconds, releaseDate, posterId, videoId, subtitleId: defaultSubtitleId, status, updatedAt: new Date()
			}).where(eq(episodes.id, params.epId));
		} catch (e: any) {
			if (e?.cause?.code === '23503') return fail(400, { error: 'Invalid file reference — please re-upload' });
			return fail(500, { error: e?.cause?.message ?? e?.message ?? 'Database error' });
		}
		throw redirect(303, `/admin/series/${params.id}/episodes`);
	}
};
