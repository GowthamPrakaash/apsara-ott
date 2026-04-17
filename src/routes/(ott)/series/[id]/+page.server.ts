import { loadSeriesView } from '$lib/server/series-view';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.auth();
	return loadSeriesView(params.id, session?.user?.id ?? null, null);
};
