import { db } from '$lib/server/db';
import { subscriptions, payments, watchHistory, watchlist, users } from '$lib/server/db/schema';
import { eq, and, gt, desc, asc } from 'drizzle-orm';
import { MEDIA_BASE_URL } from '$lib/server/config';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) throw redirect(303, '/login');

	const userId = session.user.id;

	const [dbUser, activeSub, paymentHistory] = await Promise.all([
		db.query.users.findFirst({ where: eq(users.id, userId), columns: { role: true, name: true, email: true, image: true } }),
		db.query.subscriptions.findFirst({
			where: and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active'), gt(subscriptions.endDate, new Date())),
			orderBy: desc(subscriptions.createdAt)
		}),
		db.query.payments.findMany({
			where: eq(payments.userId, userId),
			orderBy: desc(payments.createdAt),
			limit: 10
		})
	]);

	const isAdminOrSuper = dbUser?.role === 'admin' || dbUser?.role === 'super_admin';

	return {
		user: dbUser,
		subscription: activeSub ? {
			status: activeSub.status,
			startDate: activeSub.startDate,
			endDate: activeSub.endDate,
			amountPaise: activeSub.amountPaise
		} : null,
		isAdminOrSuper,
		payments: paymentHistory.map(p => ({
			id: p.id,
			razorpayPaymentId: p.razorpayPaymentId,
			amountPaise: p.amountPaise,
			currency: p.currency,
			status: p.status,
			createdAt: p.createdAt
		}))
	};
};
