import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getStorageProvider } from '$lib/server/storage-provider';
import { env } from '$env/dynamic/private';

// MIME type map for serving media files
const MIME_TYPES: Record<string, string> = {
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.ogg': 'video/ogg',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.gif': 'image/gif',
	'.vtt': 'text/vtt',
	'.srt': 'text/plain'
};

export const GET: RequestHandler = async ({ params, request }) => {
	const filePath = params.path;

	// Security: prevent directory traversal
	if (filePath.includes('..') || filePath.includes('~')) {
		throw error(400, 'Invalid path');
	}

	const storageType = env.STORAGE_PROVIDER ?? 'local';

	// For S3 storage with a public URL, redirect to the public/presigned URL
	if (storageType === 's3') {
		const provider = getStorageProvider();
		const url = await provider.getUrl(filePath);
		throw redirect(302, url);
	}

	// Local storage: serve the file directly
	const provider = getStorageProvider();

	const fileInfo = await provider.getFileInfo(filePath);
	if (!fileInfo) {
		throw error(404, 'File not found');
	}

	const ext = '.' + filePath.split('.').pop()?.toLowerCase();
	const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
	const fileSize = fileInfo.size;

	// Handle Range requests for video seeking
	const rangeHeader = request.headers.get('range');

	if (rangeHeader && contentType.startsWith('video/')) {
		const parts = rangeHeader.replace('bytes=', '').split('-');
		const start = parseInt(parts[0], 10);
		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

		const result = await provider.getFileRange(filePath, start, end);
		if (!result) throw error(404, 'File not found');

		return new Response(new Uint8Array(result.data), {
			status: 206,
			headers: {
				'Content-Range': `bytes ${start}-${end}/${result.totalSize}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': String(result.size),
				'Content-Type': contentType
			}
		});
	}

	// Full file response
	const result = await provider.getFile(filePath);
	if (!result) throw error(404, 'File not found');

	return new Response(new Uint8Array(result.data), {
		headers: {
			'Content-Type': contentType,
			'Content-Length': String(result.size),
			'Accept-Ranges': 'bytes',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
