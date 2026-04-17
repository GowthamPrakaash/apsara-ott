import type { UserRole, Permission } from '$lib/types';

export const ADMIN_PANEL_ROLES: UserRole[] = ['admin', 'super_admin'];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
	viewer: [],
	editor: [],
	admin: ['edit_movies', 'edit_series', 'edit_episodes', 'edit_genres', 'manage_users'],
	super_admin: ['edit_movies', 'edit_series', 'edit_episodes', 'edit_genres', 'manage_users']
};

export function getRolePermissions(role: UserRole): Permission[] {
	return ROLE_PERMISSIONS[role];
}

export function canAccessAdmin(role: UserRole | null | undefined): boolean {
	return !!role && ADMIN_PANEL_ROLES.includes(role);
}

export function canManageUsers(role: UserRole | null | undefined): boolean {
	return role === 'admin' || role === 'super_admin';
}

export function canManageContent(role: UserRole | null | undefined): boolean {
	return role === 'admin' || role === 'super_admin';
}

export function canChangeUserRole(
	actorRole: UserRole,
	targetRole: UserRole,
	nextRole: UserRole
): boolean {
	if (actorRole === 'super_admin') return true;
	if (actorRole !== 'admin') return false;
	if (targetRole === 'admin' || targetRole === 'super_admin') return false;
	return nextRole === 'viewer' || nextRole === 'editor';
}

export function getAssignableRoles(actorRole: UserRole, targetRole: UserRole): UserRole[] {
	if (actorRole === 'super_admin') {
		return ['viewer', 'editor', 'admin', 'super_admin'];
	}
	if (actorRole === 'admin' && targetRole !== 'admin' && targetRole !== 'super_admin') {
		return ['viewer', 'editor'];
	}
	return [];
}

export function canDeleteUser(actorRole: UserRole, targetRole: UserRole): boolean {
	if (actorRole === 'super_admin') return true;
	if (actorRole !== 'admin') return false;
	return targetRole === 'viewer' || targetRole === 'editor';
}
