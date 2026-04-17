import { db } from '$lib/server/db';
import { movies, series, users, subscriptions } from '$lib/server/db/schema';
import { count, eq, and, gt } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [movieCount, seriesCount, userCount, subscriberCount] = await Promise.all([
		db.select({ count: count() }).from(movies).where(eq(movies.status, 'published')),
		db.select({ count: count() }).from(series).where(eq(series.status, 'published')),
		db.select({ count: count() }).from(users),
		db.select({ count: count() }).from(subscriptions).where(
			and(eq(subscriptions.status, 'active'), gt(subscriptions.endDate, new Date()))
		)
	]);

	return {
		stats: {
			movies: movieCount[0]?.count ?? 0,
			series: seriesCount[0]?.count ?? 0,
			users: userCount[0]?.count ?? 0,
			subscribers: subscriberCount[0]?.count ?? 0
		}
	};
};
