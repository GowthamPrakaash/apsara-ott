import { pgTable, text, timestamp, integer, boolean, pgEnum, primaryKey, uuid, bigint, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

type AdapterAccountType = 'oauth' | 'email' | 'credentials' | 'webauthn';

// ============================================================
// Enums
// ============================================================

export const userRoleEnum = pgEnum('user_role', ['viewer', 'editor', 'admin', 'super_admin']);
export const contentStatusEnum = pgEnum('content_status', ['draft', 'published']);
export const fileTypeEnum = pgEnum('file_type', ['poster', 'video', 'subtitle']);
export const permissionEnum = pgEnum('permission_type', [
	'edit_movies',
	'edit_series',
	'edit_episodes',
	'edit_genres',
	'manage_users'
]);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'captured', 'failed', 'refunded']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'expired', 'cancelled']);
export const subtitleLanguageEnum = pgEnum('subtitle_language', [
	'english',
	'hindi',
	'tamil',
	'telugu',
	'malayalam',
	'kannada',
	'bengali',
	'marathi',
	'gujarati',
	'punjabi'
]);

// ============================================================
// Auth.js Tables
// ============================================================

export const users = pgTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name'),
	email: text('email').unique(),
	emailVerified: timestamp('email_verified', { mode: 'date' }),
	image: text('image'),
	role: userRoleEnum('role').notNull().default('viewer'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const accounts = pgTable(
	'accounts',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: text('type').$type<AdapterAccountType>().notNull(),
		provider: text('provider').notNull(),
		providerAccountId: text('provider_account_id').notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: integer('expires_at'),
		token_type: text('token_type'),
		scope: text('scope'),
		id_token: text('id_token'),
		session_state: text('session_state')
	},
	(account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })]
);

export const sessions = pgTable('sessions', {
	sessionToken: text('session_token').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires: timestamp('expires', { mode: 'date' }).notNull()
});

export const verificationTokens = pgTable(
	'verification_tokens',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull()
	},
	(verificationToken) => [
		primaryKey({ columns: [verificationToken.identifier, verificationToken.token] })
	]
);

// ============================================================
// Media Files (GUID-based)
// ============================================================

export const mediaFiles = pgTable('media_files', {
	id: uuid('id').primaryKey().defaultRandom(),
	originalName: text('original_name').notNull(),
	mimeType: text('mime_type').notNull(),
	sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
	storagePath: text('storage_path').notNull(), // relative path under uploads/
	fileType: fileTypeEnum('file_type').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// ============================================================
// Genres
// ============================================================

export const genres = pgTable('genres', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull().unique(),
	slug: text('slug').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// ============================================================
// Movies
// ============================================================

export const movies = pgTable('movies', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	durationSeconds: integer('duration_seconds'), // in seconds
	releaseDate: timestamp('release_date', { mode: 'date' }),
	posterId: uuid('poster_id').references(() => mediaFiles.id),
	videoId: uuid('video_id').references(() => mediaFiles.id),
	subtitleId: uuid('subtitle_id').references(() => mediaFiles.id),
	status: contentStatusEnum('status').notNull().default('draft'),
	featured: boolean('featured').notNull().default(false),
	trending: boolean('trending').notNull().default(false),
	viewCount: integer('view_count').notNull().default(0),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const movieGenres = pgTable(
	'movie_genres',
	{
		movieId: uuid('movie_id')
			.notNull()
			.references(() => movies.id, { onDelete: 'cascade' }),
		genreId: uuid('genre_id')
			.notNull()
			.references(() => genres.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.movieId, t.genreId] })]
);

// ============================================================
// Series
// ============================================================

export const series = pgTable('series', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	posterId: uuid('poster_id').references(() => mediaFiles.id),
	status: contentStatusEnum('status').notNull().default('draft'),
	featured: boolean('featured').notNull().default(false),
	trending: boolean('trending').notNull().default(false),
	viewCount: integer('view_count').notNull().default(0),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const seriesGenres = pgTable(
	'series_genres',
	{
		seriesId: uuid('series_id')
			.notNull()
			.references(() => series.id, { onDelete: 'cascade' }),
		genreId: uuid('genre_id')
			.notNull()
			.references(() => genres.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.seriesId, t.genreId] })]
);

// ============================================================
// Episodes
// ============================================================

export const episodes = pgTable('episodes', {
	id: uuid('id').primaryKey().defaultRandom(),
	seriesId: uuid('series_id')
		.notNull()
		.references(() => series.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	slug: text('slug').notNull().default(''),
	seasonNumber: integer('season_number').notNull().default(1),
	episodeNumber: integer('episode_number').notNull(),
	description: text('description'),
	durationSeconds: integer('duration_seconds'),
	releaseDate: timestamp('release_date', { mode: 'date' }),
	posterId: uuid('poster_id').references(() => mediaFiles.id),
	videoId: uuid('video_id').references(() => mediaFiles.id),
	subtitleId: uuid('subtitle_id').references(() => mediaFiles.id),
	status: contentStatusEnum('status').notNull().default('draft'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// ============================================================
// Watch History
// ============================================================

export const watchHistory = pgTable('watch_history', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	movieId: uuid('movie_id').references(() => movies.id, { onDelete: 'cascade' }),
	episodeId: uuid('episode_id').references(() => episodes.id, { onDelete: 'cascade' }),
	progressSeconds: integer('progress_seconds').notNull().default(0),
	watchedAt: timestamp('watched_at').defaultNow().notNull()
});

// ============================================================
// Watchlist
// ============================================================

export const watchlist = pgTable('watchlist', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	movieId: uuid('movie_id').references(() => movies.id, { onDelete: 'cascade' }),
	seriesId: uuid('series_id').references(() => series.id, { onDelete: 'cascade' }),
	addedAt: timestamp('added_at').defaultNow().notNull()
});

// ============================================================
// Subtitle Tracks
// ============================================================

export const subtitleTracks = pgTable(
	'subtitle_tracks',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		movieId: uuid('movie_id').references(() => movies.id, { onDelete: 'cascade' }),
		episodeId: uuid('episode_id').references(() => episodes.id, { onDelete: 'cascade' }),
		mediaFileId: uuid('media_file_id')
			.notNull()
			.references(() => mediaFiles.id, { onDelete: 'cascade' }),
		language: subtitleLanguageEnum('language').notNull(),
		isDefault: boolean('is_default').notNull().default(false),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(t) => [
		uniqueIndex('subtitle_tracks_movie_language_idx').on(t.movieId, t.language),
		uniqueIndex('subtitle_tracks_episode_language_idx').on(t.episodeId, t.language)
	]
);

// ============================================================
// Subscriptions
// ============================================================

export const subscriptions = pgTable('subscriptions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	razorpayOrderId: text('razorpay_order_id'),
	razorpayPaymentId: text('razorpay_payment_id'),
	razorpaySignature: text('razorpay_signature'),
	amountPaise: integer('amount_paise').notNull().default(9900), // ₹99 in paise
	status: subscriptionStatusEnum('status').notNull().default('active'),
	startDate: timestamp('start_date').notNull(),
	endDate: timestamp('end_date').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// ============================================================
// Payments
// ============================================================

export const payments = pgTable('payments', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
	razorpayOrderId: text('razorpay_order_id'),
	razorpayPaymentId: text('razorpay_payment_id'),
	razorpaySignature: text('razorpay_signature'),
	amountPaise: integer('amount_paise').notNull(),
	currency: text('currency').notNull().default('INR'),
	status: paymentStatusEnum('status').notNull().default('pending'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// ============================================================
// Permissions
// ============================================================

export const permissions = pgTable(
	'permissions',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		permission: permissionEnum('permission').notNull()
	},
	(t) => [primaryKey({ columns: [t.userId, t.permission] })]
);

// ============================================================
// Relations
// ============================================================

export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	watchHistory: many(watchHistory),
	watchlist: many(watchlist),
	subscriptions: many(subscriptions),
	payments: many(payments),
	permissions: many(permissions)
}));

export const moviesRelations = relations(movies, ({ one, many }) => ({
	poster: one(mediaFiles, { fields: [movies.posterId], references: [mediaFiles.id] }),
	video: one(mediaFiles, { fields: [movies.videoId], references: [mediaFiles.id] }),
	subtitle: one(mediaFiles, { fields: [movies.subtitleId], references: [mediaFiles.id] }),
	genres: many(movieGenres),
	subtitleTracks: many(subtitleTracks),
	watchHistory: many(watchHistory),
	watchlist: many(watchlist)
}));

export const seriesRelations = relations(series, ({ one, many }) => ({
	poster: one(mediaFiles, { fields: [series.posterId], references: [mediaFiles.id] }),
	genres: many(seriesGenres),
	episodes: many(episodes),
	watchlist: many(watchlist)
}));

export const episodesRelations = relations(episodes, ({ one, many }) => ({
	series: one(series, { fields: [episodes.seriesId], references: [series.id] }),
	poster: one(mediaFiles, { fields: [episodes.posterId], references: [mediaFiles.id] }),
	video: one(mediaFiles, { fields: [episodes.videoId], references: [mediaFiles.id] }),
	subtitle: one(mediaFiles, { fields: [episodes.subtitleId], references: [mediaFiles.id] }),
	subtitleTracks: many(subtitleTracks),
	watchHistory: many(watchHistory)
}));

export const genresRelations = relations(genres, ({ many }) => ({
	movies: many(movieGenres),
	series: many(seriesGenres)
}));

export const movieGenresRelations = relations(movieGenres, ({ one }) => ({
	movie: one(movies, { fields: [movieGenres.movieId], references: [movies.id] }),
	genre: one(genres, { fields: [movieGenres.genreId], references: [genres.id] })
}));

export const seriesGenresRelations = relations(seriesGenres, ({ one }) => ({
	series: one(series, { fields: [seriesGenres.seriesId], references: [series.id] }),
	genre: one(genres, { fields: [seriesGenres.genreId], references: [genres.id] })
}));

export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
	user: one(users, { fields: [watchHistory.userId], references: [users.id] }),
	movie: one(movies, { fields: [watchHistory.movieId], references: [movies.id] }),
	episode: one(episodes, { fields: [watchHistory.episodeId], references: [episodes.id] })
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
	user: one(users, { fields: [watchlist.userId], references: [users.id] }),
	movie: one(movies, { fields: [watchlist.movieId], references: [movies.id] }),
	series: one(series, { fields: [watchlist.seriesId], references: [series.id] })
}));

export const subtitleTracksRelations = relations(subtitleTracks, ({ one }) => ({
	movie: one(movies, { fields: [subtitleTracks.movieId], references: [movies.id] }),
	episode: one(episodes, { fields: [subtitleTracks.episodeId], references: [episodes.id] }),
	mediaFile: one(mediaFiles, { fields: [subtitleTracks.mediaFileId], references: [mediaFiles.id] })
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
	user: one(users, { fields: [subscriptions.userId], references: [users.id] })
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
	user: one(users, { fields: [payments.userId], references: [users.id] }),
	subscription: one(subscriptions, { fields: [payments.subscriptionId], references: [subscriptions.id] })
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
	user: one(users, { fields: [permissions.userId], references: [users.id] })
}));
