import { json } from '@sveltejs/kit';
import { canManageContent } from '$lib/access';
import { saveUploadedFile } from '$lib/server/storage';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user) return json({ error: 'Unauthorized' }, { status: 401 });

	const role = (session.user as { role?: string }).role;
	if (!canManageContent(role as any)) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const fileType = formData.get('type') as 'poster' | 'video' | 'subtitle' | null;

	if (!file || !fileType) return json({ error: 'Missing file or type' }, { status: 400 });

	try {
		const result = await saveUploadedFile(file, fileType);
		return json({ id: result.id, path: result.path });
	} catch (err: any) {
		return json({ error: err.message }, { status: 400 });
	}
};
