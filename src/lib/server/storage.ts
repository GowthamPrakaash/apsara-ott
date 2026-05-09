import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '$lib/server/db';
import { mediaFiles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getStorageProvider } from '$lib/server/storage-provider';
import { env } from '$env/dynamic/private';

export type FileType = 'poster' | 'video' | 'subtitle';

export async function saveUploadedFile(
	file: File,
	fileType: FileType
): Promise<{ id: string; path: string }> {
	const id = uuidv4();
	const ext = extname(file.name) || getDefaultExt(file.type);
	const filename = `${id}${ext}`;
	const storagePath = `${fileType}s/${filename}`; // posters, videos, subtitles

	// Write file via storage provider
	const buffer = await file.arrayBuffer();
	const mimeType = file.type || 'application/octet-stream';
	const provider = getStorageProvider();
	await provider.save(storagePath, Buffer.from(buffer), mimeType);

	// Record in DB
	await db.insert(mediaFiles).values({
		id,
		originalName: file.name,
		mimeType,
		sizeBytes: file.size,
		storagePath,
		fileType
	});

	return { id, path: storagePath };
}

export async function deleteMediaFile(fileId: string): Promise<void> {
	const file = await db.query.mediaFiles.findFirst({
		where: eq(mediaFiles.id, fileId)
	});
	if (!file) return;

	const provider = getStorageProvider();
	await provider.delete(file.storagePath);

	await db.delete(mediaFiles).where(eq(mediaFiles.id, fileId));
}

export async function getMediaUrl(storagePath: string): Promise<string> {
	const provider = getStorageProvider();
	return provider.getUrl(storagePath);
}

function getDefaultExt(mimeType: string): string {
	const map: Record<string, string> = {
		'image/jpeg': '.jpg',
		'image/png': '.png',
		'image/webp': '.webp',
		'video/mp4': '.mp4',
		'video/webm': '.webm',
		'text/vtt': '.vtt',
		'text/plain': '.vtt'
	};
	return map[mimeType] ?? '';
}

/**
 * Synchronous URL builder for media files.
 *
 * - Local storage:         uses MEDIA_BASE_URL (serves via /api/media route)
 * - S3 with S3_PUBLIC_URL: uses the public URL directly (e.g. R2 custom domain / CDN)
 * - S3 without public URL: falls back to MEDIA_BASE_URL (/api/media route does 302 → presigned URL)
 */
export function buildMediaUrl(storagePath: string): string {
	const storageType = env.STORAGE_PROVIDER ?? 'local';

	if (storageType === 's3' && env.S3_PUBLIC_URL) {
		return `${env.S3_PUBLIC_URL}/${storagePath}`;
	}

	const mediaBaseUrl = env.MEDIA_BASE_URL ?? 'http://localhost:5173/api/media';
	return `${mediaBaseUrl}/${storagePath}`;
}
