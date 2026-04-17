import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { subscriptions, payments } from '$lib/server/db/schema';
import { verifyPaymentSignature } from '$lib/server/razorpay';
import { SUBSCRIPTION_AMOUNT_PAISE, SUBSCRIPTION_DURATION_DAYS } from '$lib/server/config';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Unauthorized' }, { status: 401 });

	const { orderId, paymentId, signature } = await request.json();

	// Verify signature
	const isValid = verifyPaymentSignature(orderId, paymentId, signature);
	if (!isValid) {
		return json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
	}

	const now = new Date();
	const endDate = new Date(now.getTime() + SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000);

	// Create subscription record
	const [sub] = await db.insert(subscriptions).values({
		userId: session.user.id,
		razorpayOrderId: orderId,
		razorpayPaymentId: paymentId,
		razorpaySignature: signature,
		amountPaise: SUBSCRIPTION_AMOUNT_PAISE,
		status: 'active',
		startDate: now,
		endDate
	}).returning();

	// Record payment
	await db.insert(payments).values({
		userId: session.user.id,
		subscriptionId: sub.id,
		razorpayOrderId: orderId,
		razorpayPaymentId: paymentId,
		razorpaySignature: signature,
		amountPaise: SUBSCRIPTION_AMOUNT_PAISE,
		currency: 'INR',
		status: 'captured'
	});

	return json({ success: true, endDate });
};
