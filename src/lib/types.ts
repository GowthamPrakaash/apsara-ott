import type { userRoleEnum, permissionEnum, contentStatusEnum, fileTypeEnum } from '$lib/server/db/schema';

export type UserRole = typeof userRoleEnum.enumValues[number];
export type Permission = typeof permissionEnum.enumValues[number];
export type ContentStatus = typeof contentStatusEnum.enumValues[number];
export type FileType = typeof fileTypeEnum.enumValues[number];

export type AdminUser = {
	id: string;
	name: string | null;
	email: string | null;
	role: UserRole;
	image: string | null;
};

export type MovieWithRelations = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	durationSeconds: number | null;
	releaseDate: Date | null;
	posterId: string | null;
	videoId: string | null;
	subtitleId: string | null;
	status: ContentStatus;
	featured: boolean;
	trending: boolean;
	viewCount: number;
	poster?: { id: string; storagePath: string } | null;
	video?: { id: string; storagePath: string } | null;
	subtitle?: { id: string; storagePath: string } | null;
	genres?: { genre: { id: string; name: string; slug: string } }[];
};

export type SeriesWithRelations = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	posterId: string | null;
	status: ContentStatus;
	featured: boolean;
	trending: boolean;
	viewCount: number;
	poster?: { id: string; storagePath: string } | null;
	genres?: { genre: { id: string; name: string; slug: string } }[];
	episodes?: EpisodeWithRelations[];
};

export type EpisodeWithRelations = {
	id: string;
	seriesId: string;
	name: string;
	seasonNumber: number;
	episodeNumber: number;
	description: string | null;
	durationSeconds: number | null;
	releaseDate: Date | null;
	posterId: string | null;
	videoId: string | null;
	subtitleId: string | null;
	status: ContentStatus;
	poster?: { id: string; storagePath: string } | null;
	video?: { id: string; storagePath: string } | null;
	subtitle?: { id: string; storagePath: string } | null;
};

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
