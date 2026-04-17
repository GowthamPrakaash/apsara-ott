import { env } from '$env/dynamic/private';

export const DATABASE_URL = env.DATABASE_URL ?? '';
export const AUTH_SECRET = env.AUTH_SECRET ?? '';
export const RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID ?? '';
export const RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET ?? '';
export const UPLOAD_DIR = env.UPLOAD_DIR ?? './uploads';
export const MEDIA_BASE_URL = env.MEDIA_BASE_URL ?? 'http://localhost:5173/api/media';
export const SUPER_ADMIN_EMAIL = env.SUPER_ADMIN_EMAIL ?? 'gowthamprakaash@gmail.com';
export const SUBSCRIPTION_AMOUNT_PAISE = 9900; // ₹99
export const SUBSCRIPTION_DURATION_DAYS = 30;
