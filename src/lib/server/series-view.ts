import { db } from '$lib/server/db';
import {
	series as seriesTable,
	episodes as episodesTable,
	subscriptions,
	users
} from '$lib/server/db/schema';
import { buildMediaUrl } from '$lib/server/storage';
import { and, asc, eq, gt } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function loadSeriesView(seriesId: string, userId?: string | null, selectedEpisodeId?: string | null) {
	const seriesData = await db.query.series.findFirst({
		where: and(eq(seriesTable.id, seriesId), eq(seriesTable.status, 'published')),
		with: {
			poster: { columns: { storagePath: true } },
			genres: { with: { genre: { columns: { name: true, slug: true } } } },
			episodes: {
				where: eq(episodesTable.status, 'published'),
				with: {
					poster: { columns: { storagePath: true } },
					video: { columns: { storagePath: true } },
					subtitle: { columns: { storagePath: true } },
					subtitleTracks: {
						with: {
							mediaFile: { columns: { storagePath: true } }
						}
					}
				},
				orderBy: [asc(episodesTable.seasonNumber), asc(episodesTable.episodeNumber)]
			}
		}
	});

	if (!seriesData) throw error(404, 'Series not found');

	let canWatch = false;
	if (userId) {
		const dbUser = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: { role: true }
		});

		if (dbUser?.role === 'admin' || dbUser?.role === 'super_admin') {
			canWatch = true;
		} else {
			const sub = await db.query.subscriptions.findFirst({
				where: and(
					eq(subscriptions.userId, userId),
					eq(subscriptions.status, 'active'),
					gt(subscriptions.endDate, new Date())
				)
			});
			canWatch = !!sub;
		}
	}

	const seasonMap: Record<number, typeof seriesData.episodes> = {};
	for (const episode of seriesData.episodes) {
		if (!seasonMap[episode.seasonNumber]) seasonMap[episode.seasonNumber] = [];
		seasonMap[episode.seasonNumber].push(episode);
	}

	const seasons = Object.entries(seasonMap)
		.map(([number, episodes]) => ({
			number: parseInt(number),
			episodes: episodes.map((episode) => ({
				id: episode.id,
				name: episode.name,
				episodeNumber: episode.episodeNumber,
				seasonNumber: episode.seasonNumber,
				description: episode.description,
				durationSeconds: episode.durationSeconds,
				releaseDate: episode.releaseDate,
				posterUrl: episode.poster ? buildMediaUrl(episode.poster.storagePath) : null,
				videoUrl: episode.video ? buildMediaUrl(episode.video.storagePath) : null,
				href: `/series/${seriesData.id}/episode/${episode.id}`,
				subtitles:
					episode.subtitleTracks.length > 0
						? episode.subtitleTracks.map((track) => ({
								src: buildMediaUrl(track.mediaFile.storagePath),
								srclang: track.language,
								label: track.language.replace('_', ' '),
								default: track.isDefault
							}))
						: episode.subtitle
							? [
									{
										src: buildMediaUrl(episode.subtitle.storagePath),
										srclang: 'english',
										label: 'English',
										default: true
									}
								]
							: []
			}))
		}))
		.sort((a, b) => a.number - b.number);

	const selectedEpisode =
		selectedEpisodeId == null
			? null
			: seasons
					.flatMap((season) => season.episodes)
					.find((episode) => episode.id === selectedEpisodeId) ?? null;

	if (selectedEpisodeId && !selectedEpisode) {
		throw error(404, 'Episode not found');
	}

	return {
		series: {
			...seriesData,
			posterUrl: seriesData.poster ? buildMediaUrl(seriesData.poster.storagePath) : null,
			genres: seriesData.genres.map((genre) => genre.genre)
		},
		seasons,
		selectedEpisode,
		canWatch,
		isLoggedIn: !!userId
	};
}
