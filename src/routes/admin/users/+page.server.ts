import { db } from '$lib/server/db';
import { users, watchHistory, watchlist, subscriptions } from '$lib/server/db/schema';
import {
	canDeleteUser,
	canManageUsers,
	getAssignableRoles,
	getRolePermissions
} from '$lib/access';
import { and, count, desc, eq, gt, ilike, inArray, or, sql } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { UserRole } from '$lib/types';

const PAGE_SIZE = 10;
const ROLES: UserRole[] = ['viewer', 'editor', 'admin', 'super_admin'];

function parsePage(input: string | null): number {
	const value = Number(input ?? '1');
	return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

function buildUserFilters(search: string, roleFilter: string) {
	const conditions = [];

	if (search) {
		const q = `%${search}%`;
		conditions.push(or(ilike(users.name, q), ilike(users.email, q)));
	}

	if (roleFilter && ROLES.includes(roleFilter as UserRole)) {
		conditions.push(eq(users.role, roleFilter as UserRole));
	}

	if (conditions.length === 0) return undefined;
	if (conditions.length === 1) return conditions[0];
	return and(...conditions);
}

async function getActorRole(userId: string): Promise<UserRole | null> {
	const dbUser = await db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: { role: true }
	});

	return dbUser?.role ?? null;
}

async function getSuperAdminCount(): Promise<number> {
	const result = await db
		.select({ count: count() })
		.from(users)
		.where(eq(users.role, 'super_admin'));

	return result[0]?.count ?? 0;
}

export const load: PageServerLoad = async ({ url, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) throw error(401, 'Unauthorized');

	const actorRole = await getActorRole(session.user.id);
	if (!actorRole || !canManageUsers(actorRole)) {
		throw error(403, 'Forbidden');
	}

	const search = url.searchParams.get('search')?.trim() ?? '';
	const roleFilter = url.searchParams.get('role') ?? '';
	const requestedPage = parsePage(url.searchParams.get('page'));
	const whereClause = buildUserFilters(search, roleFilter);

	const [totalRows, historyCount, watchlistCount, subscriberCount, roleCounts] =
		await Promise.all([
			db.select({ count: count() }).from(users).where(whereClause),
			db.select({ count: count() }).from(watchHistory),
			db.select({ count: count() }).from(watchlist),
			db
				.select({ count: count() })
				.from(subscriptions)
				.where(and(eq(subscriptions.status, 'active'), gt(subscriptions.endDate, new Date()))),
			db
				.select({
					role: users.role,
					count: sql<number>`count(*)::int`
				})
				.from(users)
				.groupBy(users.role)
		]);

	const totalItems = totalRows[0]?.count ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
	const page = Math.min(requestedPage, totalPages);
	const pageRows = await db.query.users.findMany({
		where: whereClause,
		columns: {
			id: true,
			name: true,
			email: true,
			image: true,
			role: true,
			createdAt: true
		},
		orderBy: desc(users.createdAt),
		limit: PAGE_SIZE,
		offset: (page - 1) * PAGE_SIZE
	});
	const userIds = pageRows.map((user) => user.id);

	const [historyByUser, watchlistByUser, activeSubscribers] = userIds.length
		? await Promise.all([
				db
					.select({
						userId: watchHistory.userId,
						count: sql<number>`count(*)::int`
					})
					.from(watchHistory)
					.where(inArray(watchHistory.userId, userIds))
					.groupBy(watchHistory.userId),
				db
					.select({
						userId: watchlist.userId,
						count: sql<number>`count(*)::int`
					})
					.from(watchlist)
					.where(inArray(watchlist.userId, userIds))
					.groupBy(watchlist.userId),
				db
					.select({ userId: subscriptions.userId })
					.from(subscriptions)
					.where(
						and(
							inArray(subscriptions.userId, userIds),
							eq(subscriptions.status, 'active'),
							gt(subscriptions.endDate, new Date())
						)
					)
			])
		: [[], [], []];

	const historyCountByUser = Object.fromEntries(historyByUser.map((row) => [row.userId, row.count]));
	const watchlistCountByUser = Object.fromEntries(
		watchlistByUser.map((row) => [row.userId, row.count])
	);
	const activeSubscriberIds = new Set(activeSubscribers.map((row) => row.userId));
	const roleCountMap = Object.fromEntries(roleCounts.map((row) => [row.role, row.count]));

	return {
		users: pageRows.map((user) => ({
			...user,
			historyCount: historyCountByUser[user.id] ?? 0,
			watchlistCount: watchlistCountByUser[user.id] ?? 0,
			hasActiveSubscription: activeSubscriberIds.has(user.id),
			assignableRoles: getAssignableRoles(actorRole, user.role),
			canDelete: canDeleteUser(actorRole, user.role)
		})),
		stats: {
			total: totalItems,
			viewers: roleCountMap.viewer ?? 0,
			editors: roleCountMap.editor ?? 0,
			admins: (roleCountMap.admin ?? 0) + (roleCountMap.super_admin ?? 0),
			subscribers: subscriberCount[0]?.count ?? 0,
			historyItems: historyCount[0]?.count ?? 0,
			watchlistItems: watchlistCount[0]?.count ?? 0
		},
		search,
		roleFilter,
		currentUserRole: actorRole,
		rolePermissions: Object.fromEntries(
			ROLES.map((role) => [role, getRolePermissions(role)])
		) as Record<UserRole, ReturnType<typeof getRolePermissions>>,
		pagination: {
			page,
			pageSize: PAGE_SIZE,
			totalItems,
			totalPages,
			hasPrev: page > 1,
			hasNext: page < totalPages
		}
	};
};

export const actions: Actions = {
	deleteUser: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) return fail(401, { error: 'Unauthorized' });

		const actorRole = await getActorRole(session.user.id);
		if (!actorRole || !canManageUsers(actorRole)) {
			return fail(403, { error: 'Forbidden' });
		}

		const data = await request.formData();
		const userId = data.get('userId') as string;
		if (!userId) return fail(400, { error: 'Invalid' });

		const targetUser = await db.query.users.findFirst({
			where: eq(users.id, userId),
			columns: { id: true, role: true }
		});

		if (!targetUser) {
			return fail(404, { error: 'User not found' });
		}

		if (!canDeleteUser(actorRole, targetUser.role)) {
			return fail(403, { error: 'You are not allowed to delete this user' });
		}

		if (targetUser.role === 'super_admin') {
			const superAdminCount = await getSuperAdminCount();
			if (superAdminCount <= 1) {
				return fail(400, { error: 'At least one super admin is required' });
			}
		}

		await db.delete(users).where(eq(users.id, userId));
		return { success: true };
	}
};
