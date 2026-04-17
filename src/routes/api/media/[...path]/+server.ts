import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { UPLOAD_DIR } from '$lib/server/config';

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

	const fullPath = join(UPLOAD_DIR, filePath);

	let fileStats;
	try {
		fileStats = await stat(fullPath);
	} catch {
		throw error(404, 'File not found');
	}

	const ext = '.' + fullPath.split('.').pop()?.toLowerCase();
	const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
	const fileSize = fileStats.size;

	// Handle Range requests for video seeking
	const rangeHeader = request.headers.get('range');

	if (rangeHeader && contentType.startsWith('video/')) {
		const parts = rangeHeader.replace('bytes=', '').split('-');
		const start = parseInt(parts[0], 10);
		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
		const chunkSize = end - start + 1;

		const buffer = Buffer.alloc(chunkSize);
		const { open } = await import('fs/promises');
		const fd = await open(fullPath, 'r');
		await fd.read(buffer, 0, chunkSize, start);
		await fd.close();

		return new Response(buffer, {
			status: 206,
			headers: {
				'Content-Range': `bytes ${start}-${end}/${fileSize}`,
				'Accept-Ranges': 'bytes',
				'Content-Length': String(chunkSize),
				'Content-Type': contentType
			}
		});
	}

	// Full file response
	const data = await readFile(fullPath);
	return new Response(data, {
		headers: {
			'Content-Type': contentType,
			'Content-Length': String(fileSize),
			'Accept-Ranges': 'bytes',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
