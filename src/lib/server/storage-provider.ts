import { writeFile, mkdir, unlink, readFile, stat } from 'fs/promises';
import { open } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import {
	S3Client,
	PutObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '$env/dynamic/private';

// ─── Storage Provider Interface ───────────────────────────────────────────────

export interface StorageProvider {
	/** Write a file to storage. Returns the storage path (key). */
	save(storagePath: string, data: Buffer, mimeType: string): Promise<void>;

	/** Delete a file from storage. */
	delete(storagePath: string): Promise<void>;

	/**
	 * Get a publicly accessible URL for the file.
	 * For S3, this returns a presigned URL.
	 * For local, this returns the MEDIA_BASE_URL path.
	 */
	getUrl(storagePath: string): Promise<string>;

	/**
	 * Read file content for streaming/serving.
	 * Returns null if the file does not exist.
	 */
	getFile(storagePath: string): Promise<{ data: Buffer; size: number } | null>;

	/**
	 * Get file metadata (size, etc).
	 * Returns null if the file does not exist.
	 */
	getFileInfo(storagePath: string): Promise<{ size: number } | null>;

	/**
	 * Read a byte range from a file for range requests (video seeking).
	 * Returns null if the file does not exist.
	 */
	getFileRange(
		storagePath: string,
		start: number,
		end: number
	): Promise<{ data: Buffer; size: number; totalSize: number } | null>;
}

// ─── Local Filesystem Provider ────────────────────────────────────────────────

export class LocalStorageProvider implements StorageProvider {
	constructor(
		private uploadDir: string,
		private mediaBaseUrl: string
	) {}

	async save(storagePath: string, data: Buffer, _mimeType: string): Promise<void> {
		const fullPath = join(this.uploadDir, storagePath);
		const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
		if (!existsSync(dir)) {
			await mkdir(dir, { recursive: true });
		}
		await writeFile(fullPath, data);
	}

	async delete(storagePath: string): Promise<void> {
		const fullPath = join(this.uploadDir, storagePath);
		try {
			await unlink(fullPath);
		} catch {
			// File may not exist on disk
		}
	}

	async getUrl(storagePath: string): Promise<string> {
		return `${this.mediaBaseUrl}/${storagePath}`;
	}

	async getFile(storagePath: string): Promise<{ data: Buffer; size: number } | null> {
		const fullPath = join(this.uploadDir, storagePath);
		try {
			const data = await readFile(fullPath);
			return { data, size: data.length };
		} catch {
			return null;
		}
	}

	async getFileInfo(storagePath: string): Promise<{ size: number } | null> {
		const fullPath = join(this.uploadDir, storagePath);
		try {
			const stats = await stat(fullPath);
			return { size: stats.size };
		} catch {
			return null;
		}
	}

	async getFileRange(
		storagePath: string,
		start: number,
		end: number
	): Promise<{ data: Buffer; size: number; totalSize: number } | null> {
		const fullPath = join(this.uploadDir, storagePath);
		try {
			const stats = await stat(fullPath);
			const chunkSize = end - start + 1;
			const buffer = Buffer.alloc(chunkSize);
			const fd = await open(fullPath, 'r');
			await fd.read(buffer, 0, chunkSize, start);
			await fd.close();
			return { data: buffer, size: chunkSize, totalSize: stats.size };
		} catch {
			return null;
		}
	}
}

// ─── S3-Compatible Provider (Cloudflare R2, AWS S3, MinIO, etc.) ──────────────

export class S3StorageProvider implements StorageProvider {
	private client: S3Client;
	private bucket: string;
	private publicUrl: string | null;
	private presignedUrlExpiry: number;

	constructor(config: {
		endpoint: string;
		region: string;
		accessKeyId: string;
		secretAccessKey: string;
		bucket: string;
		publicUrl?: string;
		presignedUrlExpiry?: number;
	}) {
		this.client = new S3Client({
			endpoint: config.endpoint,
			region: config.region,
			credentials: {
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey
			},
			forcePathStyle: true // Required for R2 and most S3-compatible services
		});
		this.bucket = config.bucket;
		this.publicUrl = config.publicUrl || null;
		this.presignedUrlExpiry = config.presignedUrlExpiry ?? 3600; // 1 hour default
	}

	async save(storagePath: string, data: Buffer, mimeType: string): Promise<void> {
		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: storagePath,
				Body: data,
				ContentType: mimeType
			})
		);
	}

	async delete(storagePath: string): Promise<void> {
		try {
			await this.client.send(
				new DeleteObjectCommand({
					Bucket: this.bucket,
					Key: storagePath
				})
			);
		} catch {
			// Object may not exist
		}
	}

	async getUrl(storagePath: string): Promise<string> {
		// If a public URL is configured (e.g. R2 custom domain or CDN), use it directly
		if (this.publicUrl) {
			return `${this.publicUrl}/${storagePath}`;
		}

		// Otherwise, generate a presigned URL
		const command = new GetObjectCommand({
			Bucket: this.bucket,
			Key: storagePath
		});
		return getSignedUrl(this.client, command, { expiresIn: this.presignedUrlExpiry });
	}

	async getFile(storagePath: string): Promise<{ data: Buffer; size: number } | null> {
		try {
			const response = await this.client.send(
				new GetObjectCommand({
					Bucket: this.bucket,
					Key: storagePath
				})
			);
			const bytes = await response.Body?.transformToByteArray();
			if (!bytes) return null;
			const data = Buffer.from(bytes);
			return { data, size: data.length };
		} catch {
			return null;
		}
	}

	async getFileInfo(storagePath: string): Promise<{ size: number } | null> {
		try {
			const response = await this.client.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: storagePath
				})
			);
			return { size: response.ContentLength ?? 0 };
		} catch {
			return null;
		}
	}

	async getFileRange(
		storagePath: string,
		start: number,
		end: number
	): Promise<{ data: Buffer; size: number; totalSize: number } | null> {
		try {
			// First get total size
			const headResponse = await this.client.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: storagePath
				})
			);
			const totalSize = headResponse.ContentLength ?? 0;

			// Then get the range
			const response = await this.client.send(
				new GetObjectCommand({
					Bucket: this.bucket,
					Key: storagePath,
					Range: `bytes=${start}-${end}`
				})
			);
			const bytes = await response.Body?.transformToByteArray();
			if (!bytes) return null;
			const data = Buffer.from(bytes);
			return { data, size: data.length, totalSize };
		} catch {
			return null;
		}
	}
}

// ─── Provider Factory ─────────────────────────────────────────────────────────

let _provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
	if (_provider) return _provider;

	const storageType = env.STORAGE_PROVIDER ?? 'local';

	if (storageType === 's3') {
		const endpoint = env.S3_ENDPOINT;
		const region = env.S3_REGION ?? 'auto';
		const accessKeyId = env.S3_ACCESS_KEY_ID;
		const secretAccessKey = env.S3_SECRET_ACCESS_KEY;
		const bucket = env.S3_BUCKET;
		const publicUrl = env.S3_PUBLIC_URL;
		const presignedUrlExpiry = env.S3_PRESIGNED_URL_EXPIRY
			? parseInt(env.S3_PRESIGNED_URL_EXPIRY, 10)
			: undefined;

		if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
			throw new Error(
				'S3 storage requires S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_BUCKET env variables'
			);
		}

		_provider = new S3StorageProvider({
			endpoint,
			region,
			accessKeyId,
			secretAccessKey,
			bucket,
			publicUrl,
			presignedUrlExpiry
		});
	} else {
		const uploadDir = env.UPLOAD_DIR ?? './uploads';
		const mediaBaseUrl = env.MEDIA_BASE_URL ?? 'http://localhost:5173/api/media';
		_provider = new LocalStorageProvider(uploadDir, mediaBaseUrl);
	}

	return _provider;
}
