import Razorpay from 'razorpay';
import crypto from 'crypto';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SUBSCRIPTION_AMOUNT_PAISE } from '$lib/server/config';

export const razorpay = new Razorpay({
	key_id: RAZORPAY_KEY_ID,
	key_secret: RAZORPAY_KEY_SECRET
});

export async function createSubscriptionOrder(userId: string) {
	const order = await razorpay.orders.create({
		amount: SUBSCRIPTION_AMOUNT_PAISE,
		currency: 'INR',
		receipt: `sub_${userId}_${Date.now()}`,
		notes: {
			userId,
			purpose: 'apsara_ott_subscription'
		}
	});
	return order;
}

export function verifyPaymentSignature(
	orderId: string,
	paymentId: string,
	signature: string
): boolean {
	const body = `${orderId}|${paymentId}`;
	const expectedSignature = crypto
		.createHmac('sha256', RAZORPAY_KEY_SECRET)
		.update(body)
		.digest('hex');
	return expectedSignature === signature;
}
