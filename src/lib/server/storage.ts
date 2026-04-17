// FILE STORAGE IS DISABLED ON CLOUDFLARE PAGES
// The local filesystem is not available in the Cloudflare Workers runtime.
// To re-enable uploads, use Cloudflare R2 (or another object storage) instead of local disk.

import { db } from '$lib/server/db';
import { mediaFiles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export type FileType = 'poster' | 'video' | 'subtitle';

export async function saveUploadedFile(
	_file: File,
	_fileType: FileType
): Promise<{ id: string; path: string }> {
	throw new Error(
		'File uploads are not supported on Cloudflare Pages. Configure Cloudflare R2 for object storage.'
	);
}

export async function deleteMediaFile(fileId: string): Promise<void> {
	// DB record cleanup still works; the file itself was never on disk here
	await db.delete(mediaFiles).where(eq(mediaFiles.id, fileId));
}

export function getMediaUrl(storagePath: string, mediaBaseUrl: string): string {
	return `${mediaBaseUrl}/${storagePath}`;
}
