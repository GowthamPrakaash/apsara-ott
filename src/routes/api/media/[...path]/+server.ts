// MEDIA SERVING IS DISABLED ON CLOUDFLARE PAGES
// Local filesystem access is not available in the Cloudflare Workers runtime.
// To serve media files, store them in Cloudflare R2 and serve via a public R2 bucket URL
// or a Cloudflare Worker that proxies from R2.

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	throw error(
		501,
		'Media serving from local disk is not available on Cloudflare Pages. Configure Cloudflare R2 for media storage.'
	);
};
