import { db } from '$lib/server/db';
import { subtitleTracks } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import type { SubtitleLanguage } from '$lib/subtitles';

export type SubmittedSubtitleTrack = {
	language: SubtitleLanguage;
	mediaFileId: string;
	isDefault: boolean;
};

export function parseSubtitleTracks(data: FormData): SubmittedSubtitleTrack[] {
	const languages = data.getAll('subtitleTrackLanguage') as SubtitleLanguage[];
	const fileIds = data.getAll('subtitleTrackFileId') as string[];
	const requestedDefaultLanguage = data.get('defaultSubtitleLanguage') as SubtitleLanguage | null;

	const tracks = languages
		.map((language, index) => ({
			language,
			mediaFileId: fileIds[index]?.trim() ?? '',
			isDefault: false
		}))
		.filter((track) => track.language && track.mediaFileId);

	const defaultLanguage = requestedDefaultLanguage ?? tracks[0]?.language ?? null;

	return tracks.map((track, index) => ({
		...track,
		isDefault: defaultLanguage ? track.language === defaultLanguage : index === 0
	}));
}

export async function replaceMovieSubtitleTracks(movieId: string, tracks: SubmittedSubtitleTrack[]) {
	await db.delete(subtitleTracks).where(eq(subtitleTracks.movieId, movieId));
	if (tracks.length === 0) return null;

	await db.insert(subtitleTracks).values(
		tracks.map((track) => ({
			movieId,
			episodeId: null,
			mediaFileId: track.mediaFileId,
			language: track.language,
			isDefault: track.isDefault
		}))
	);

	return tracks.find((track) => track.isDefault)?.mediaFileId ?? tracks[0]?.mediaFileId ?? null;
}

export async function replaceEpisodeSubtitleTracks(episodeId: string, tracks: SubmittedSubtitleTrack[]) {
	await db.delete(subtitleTracks).where(eq(subtitleTracks.episodeId, episodeId));
	if (tracks.length === 0) return null;

	await db.insert(subtitleTracks).values(
		tracks.map((track) => ({
			movieId: null,
			episodeId,
			mediaFileId: track.mediaFileId,
			language: track.language,
			isDefault: track.isDefault
		}))
	);

	return tracks.find((track) => track.isDefault)?.mediaFileId ?? tracks[0]?.mediaFileId ?? null;
}

export async function loadMovieSubtitleTracks(movieId: string) {
	return db.query.subtitleTracks.findMany({
		where: eq(subtitleTracks.movieId, movieId),
		with: {
			mediaFile: { columns: { id: true, originalName: true, storagePath: true } }
		}
	});
}

export async function loadEpisodeSubtitleTracks(episodeId: string) {
	return db.query.subtitleTracks.findMany({
		where: eq(subtitleTracks.episodeId, episodeId),
		with: {
			mediaFile: { columns: { id: true, originalName: true, storagePath: true } }
		}
	});
}
