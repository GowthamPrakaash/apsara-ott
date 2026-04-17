import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '$lib/server/db';
import { mediaFiles } from '$lib/server/db/schema';
import { UPLOAD_DIR } from '$lib/server/config';
import { eq } from 'drizzle-orm';

export type FileType = 'poster' | 'video' | 'subtitle';

const ALLOWED_TYPES: Record<FileType, string[]> = {
	poster: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
	video: ['video/mp4', 'video/webm', 'video/ogg', 'video/x-matroska', 'application/octet-stream'],
	subtitle: ['text/vtt', 'text/srt', 'application/x-subrip', 'text/plain']
};

export async function saveUploadedFile(
	file: File,
	fileType: FileType
): Promise<{ id: string; path: string }> {
	const id = uuidv4();
	const ext = extname(file.name) || getDefaultExt(file.type);
	const filename = `${id}${ext}`;
	const subDir = join(UPLOAD_DIR, `${fileType}s`); // posters, videos, subtitles
	const storagePath = `${fileType}s/${filename}`;
	const fullPath = join(UPLOAD_DIR, storagePath);

	// Ensure directory exists
	if (!existsSync(subDir)) {
		await mkdir(subDir, { recursive: true });
	}

	// Write file
	const buffer = await file.arrayBuffer();
	await writeFile(fullPath, Buffer.from(buffer));

	// Record in DB
	await db.insert(mediaFiles).values({
		id,
		originalName: file.name,
		mimeType: file.type || 'application/octet-stream',
		sizeBytes: file.size,
		storagePath,
		fileType
	});

	return { id, path: storagePath };
}

export async function deleteMediaFile(fileId: string): Promise<void> {
	const { unlink } = await import('fs/promises');
	const file = await db.query.mediaFiles.findFirst({
		where: eq(mediaFiles.id, fileId)
	});
	if (!file) return;

	const fullPath = join(UPLOAD_DIR, file.storagePath);
	try {
		await unlink(fullPath);
	} catch {
		// File may not exist on disk
	}
	await db.delete(mediaFiles).where(eq(mediaFiles.id, fileId));
}

export function getMediaUrl(storagePath: string, mediaBaseUrl: string): string {
	return `${mediaBaseUrl}/${storagePath}`;
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
