import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { subscriptions, payments } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { RAZORPAY_KEY_SECRET } from '$lib/server/config';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const rawBody = await request.text();
	const signature = request.headers.get('x-razorpay-signature');
	const webhookSecret = RAZORPAY_KEY_SECRET;

	// Verify webhook signature
	const expectedSig = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
	if (expectedSig !== signature) {
		return json({ error: 'Invalid signature' }, { status: 400 });
	}

	const event = JSON.parse(rawBody);
	const paymentEntity = event.payload?.payment?.entity;

	if (event.event === 'payment.captured' && paymentEntity) {
		await db
			.update(payments)
			.set({ status: 'captured' })
			.where(eq(payments.razorpayPaymentId, paymentEntity.id));
	}

	if (event.event === 'payment.failed' && paymentEntity) {
		await db
			.update(payments)
			.set({ status: 'failed' })
			.where(eq(payments.razorpayPaymentId, paymentEntity.id));

		// Mark subscription as expired if payment failed
		await db
			.update(subscriptions)
			.set({ status: 'expired' })
			.where(eq(subscriptions.razorpayPaymentId, paymentEntity.id));
	}

	return json({ received: true });
};
