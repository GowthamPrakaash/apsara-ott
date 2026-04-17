import { db } from '$lib/server/db';
import { movies as moviesTable, subscriptions, users, watchlist } from '$lib/server/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { MEDIA_BASE_URL } from '$lib/server/config';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.auth();

	const movie = await db.query.movies.findFirst({
		where: and(eq(moviesTable.id, params.id), eq(moviesTable.status, 'published')),
		with: {
			poster: { columns: { storagePath: true } },
			video: { columns: { storagePath: true } },
			subtitle: { columns: { storagePath: true } },
			subtitleTracks: {
				with: {
					mediaFile: { columns: { storagePath: true } }
				}
			},
			genres: { with: { genre: { columns: { name: true, slug: true } } } }
		}
	});

	if (!movie) throw error(404, 'Movie not found');

	// Check subscription / admin bypass
	let canWatch = false;
	let inWatchlist = false;

	if (session?.user?.id) {
		const dbUser = await db.query.users.findFirst({
			where: eq(users.id, session.user.id),
			columns: { role: true }
		});

		if (dbUser?.role === 'admin' || dbUser?.role === 'super_admin') {
			canWatch = true;
		} else {
			const sub = await db.query.subscriptions.findFirst({
				where: and(
					eq(subscriptions.userId, session.user.id),
					eq(subscriptions.status, 'active'),
					gt(subscriptions.endDate, new Date())
				)
			});
			canWatch = !!sub;
		}

		const wl = await db.query.watchlist.findFirst({
			where: and(eq(watchlist.userId, session.user.id), eq(watchlist.movieId, params.id))
		});
		inWatchlist = !!wl;
	}

	return {
		movie: {
			...movie,
			posterUrl: movie.poster ? `${MEDIA_BASE_URL}/${movie.poster.storagePath}` : null,
			videoUrl: movie.video ? `${MEDIA_BASE_URL}/${movie.video.storagePath}` : null,
			subtitles:
				movie.subtitleTracks.length > 0
					? movie.subtitleTracks.map((track) => ({
							src: `${MEDIA_BASE_URL}/${track.mediaFile.storagePath}`,
							srclang: track.language,
							label: track.language.replace('_', ' '),
							default: track.isDefault
						}))
					: movie.subtitle
						? [
								{
									src: `${MEDIA_BASE_URL}/${movie.subtitle.storagePath}`,
									srclang: 'english',
									label: 'English',
									default: true
								}
							]
						: [],
			genres: movie.genres.map(g => g.genre)
		},
		canWatch,
		inWatchlist,
		isLoggedIn: !!session?.user
	};
};
