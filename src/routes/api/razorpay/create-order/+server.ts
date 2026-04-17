import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { createSubscriptionOrder } from '$lib/server/razorpay';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Unauthorized' }, { status: 401 });

	try {
		const order = await createSubscriptionOrder(session.user.id);
		return json(order);
	} catch (err) {
		console.error('Razorpay order creation failed:', err);
		return json({ error: 'Failed to create order' }, { status: 500 });
	}
};
