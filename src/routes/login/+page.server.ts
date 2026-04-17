import { signIn } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (session?.user) {
		throw redirect(303, '/');
	}
	// Pass callbackUrl from query param so we can use it in the form
	const callbackUrl = event.url.searchParams.get('callbackUrl') ?? '/';
	return { callbackUrl };
};

export const actions: Actions = {
	default: signIn
};
