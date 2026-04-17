<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { UserRole } from '$lib/types';
	import { toast } from 'svelte-sonner';
	import Users from '@lucide/svelte/icons/users';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Search from '@lucide/svelte/icons/search';
	import Check from '@lucide/svelte/icons/check';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import X from '@lucide/svelte/icons/x';

	let { data } = $props();
	let expandedUser = $state<string | null>(null);
	let deleteConfirm = $state<string | null>(null);
	let searchValue = $state(data.search);
	let roleValue = $state(data.roleFilter);
	let pendingRoles = $state<Record<string, UserRole>>({});
	let updatingUserId = $state<string | null>(null);
	let deletingUserId = $state<string | null>(null);

	const roleColors: Record<string, string> = {
		viewer: 'bg-muted text-muted-foreground border-border',
		editor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
		admin: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
		super_admin: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
	};

	function toggleExpand(userId: string, currentRole: UserRole) {
		if (expandedUser === userId) {
			expandedUser = null;
			return;
		}

		if (!(userId in pendingRoles)) {
			pendingRoles = { ...pendingRoles, [userId]: currentRole };
		}

		expandedUser = userId;
	}

	function selectedRoleFor(userId: string, fallbackRole: UserRole): UserRole {
		return pendingRoles[userId] ?? fallbackRole;
	}

	async function updateRole(userId: string, currentRole: UserRole) {
		const nextRole = selectedRoleFor(userId, currentRole);
		updatingUserId = userId;

		try {
			const response = await fetch(`/api/admin/users/${userId}/role`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role: nextRole })
			});

			const result = await response.json().catch(() => ({}));
			if (!response.ok) {
				throw new Error(result.error ?? 'Failed to update role');
			}

			toast.success('Role updated');
			await invalidateAll();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to update role');
		} finally {
			updatingUserId = null;
		}
	}

	function pageHref(page: number) {
		const params = new URLSearchParams();
		if (searchValue) params.set('search', searchValue);
		if (roleValue) params.set('role', roleValue);
		params.set('page', String(page));
		return `?${params.toString()}`;
	}

	function applyFilters() {
		goto(pageHref(1), { replaceState: true });
	}

	function clearFilters() {
		searchValue = '';
		roleValue = '';
		goto('/admin/users', { replaceState: true });
	}

	function formatDate(d: Date | null) {
		if (!d) return '—';
		return new Date(d).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function initials(name: string | null) {
		return (
			name
				?.split(' ')
				.map((n) => n[0])
				.join('')
				.slice(0, 2)
				.toUpperCase() ?? 'U'
		);
	}
</script>

<svelte:head><title>Users — Admin</title></svelte:head>

{#if deleteConfirm}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
	>
		<div class="bg-card border border-border rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-in">
			<div class="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-4">
				<AlertTriangle class="w-6 h-6 text-destructive" />
			</div>
			<h3 class="text-lg font-semibold text-foreground text-center mb-1">Delete User?</h3>
			<p class="text-sm text-muted-foreground text-center mb-6">
				This will permanently delete the user and all their data. Super admin deletion is blocked if
				it would leave the system without a super admin.
			</p>
			<div class="flex gap-3">
				<Button variant="outline" class="flex-1" onclick={() => (deleteConfirm = null)}>
					Cancel
				</Button>
				<form
					method="POST"
					action="?/deleteUser"
					class="flex-1"
					use:enhance={() => {
						deletingUserId = deleteConfirm;
						return async ({ result }) => {
							await applyAction(result);
							deletingUserId = null;
							if (result.type === 'failure') {
								const message = typeof result.data?.error === 'string' ? result.data.error : 'Failed to delete user';
								toast.error(message);
								return;
							}
							if (result.type === 'success') {
								deleteConfirm = null;
								toast.success('User deleted');
							}
						};
					}}
				>
					<input type="hidden" name="userId" value={deleteConfirm} />
					<Button
						type="submit"
						variant="destructive"
						class="w-full"
						disabled={deletingUserId === deleteConfirm}
					>
						{#if deletingUserId === deleteConfirm}
							<LoaderCircle class="w-4 h-4 animate-spin" />
							Deleting...
						{:else}
							Delete
						{/if}
					</Button>
				</form>
			</div>
		</div>
	</div>
{/if}

<div class="space-y-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Users</h1>
			<p class="text-muted-foreground text-sm mt-0.5">
				Page {data.pagination.page} of {data.pagination.totalPages}
			</p>
		</div>
	</div>

	<div class="grid grid-cols-2 lg:grid-cols-6 gap-3">
		{#each [
			{ label: 'Viewers', value: data.stats.viewers, color: 'text-muted-foreground' },
			{ label: 'Editors', value: data.stats.editors, color: 'text-blue-400' },
			{ label: 'Admins', value: data.stats.admins, color: 'text-orange-400' },
			{ label: 'Subscribers', value: data.stats.subscribers, color: 'text-green-400' },
			{ label: 'History Items', value: data.stats.historyItems, color: 'text-cyan-400' },
			{ label: 'Watchlist Items', value: data.stats.watchlistItems, color: 'text-pink-400' }
		] as stat}
			<div class="bg-card border border-border rounded-xl p-4">
				<p class="text-2xl font-bold {stat.color}">{stat.value}</p>
				<p class="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
			</div>
		{/each}
	</div>

	<div class="flex gap-3 flex-wrap items-end">
		<div class="flex-1 min-w-48">
			<label for="user-search" class="text-xs font-medium text-muted-foreground mb-1.5 block">
				Search
			</label>
			<div class="relative">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<input
					id="user-search"
					type="text"
					placeholder="Name or email..."
					bind:value={searchValue}
					onkeydown={(e) => e.key === 'Enter' && applyFilters()}
					class="w-full pl-9 pr-4 py-2 rounded-lg bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>
		</div>
		<div>
			<label for="user-role-filter" class="text-xs font-medium text-muted-foreground mb-1.5 block">
				Role
			</label>
			<select
				id="user-role-filter"
				bind:value={roleValue}
				class="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
			>
				<option value="">All roles</option>
				<option value="viewer">viewer</option>
				<option value="editor">editor</option>
				<option value="admin">admin</option>
				<option value="super_admin">super admin</option>
			</select>
		</div>
		<Button onclick={applyFilters} size="sm">Apply</Button>
		{#if data.search || data.roleFilter}
			<Button onclick={clearFilters} size="sm" variant="ghost" class="gap-1.5">
				<X class="w-3.5 h-3.5" /> Clear
			</Button>
		{/if}
	</div>

	<div class="bg-card border border-border rounded-xl overflow-hidden">
		{#if data.users.length > 0}
			{#each data.users as user}
				<div class="border-b border-border last:border-0">
					<div class="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
						<Avatar class="w-9 h-9 shrink-0">
							<AvatarImage src={user.image ?? ''} alt={user.name ?? ''} />
							<AvatarFallback class="bg-primary text-primary-foreground text-xs font-bold">
								{initials(user.name)}
							</AvatarFallback>
						</Avatar>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 flex-wrap">
								<p class="font-medium text-foreground text-sm">{user.name ?? 'Unknown'}</p>
								<span class="text-xs px-2 py-0.5 rounded-full border font-medium {roleColors[user.role]}">
									{user.role.replace('_', ' ')}
								</span>
							</div>
							<p class="text-xs text-muted-foreground mt-0.5">{user.email}</p>
						</div>
						<div class="hidden sm:block text-right shrink-0">
							<p class="text-xs text-muted-foreground">Joined</p>
							<p class="text-xs font-medium text-foreground">{formatDate(user.createdAt)}</p>
						</div>
						<div class="flex items-center gap-1">
							{#if user.canDelete}
								<button
									onclick={() => (deleteConfirm = user.id)}
									class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
									title="Delete user"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							{/if}
							<button
								onclick={() => toggleExpand(user.id, user.role)}
								class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							>
								<ChevronDown class="w-4 h-4 transition-transform {expandedUser === user.id ? 'rotate-180' : ''}" />
							</button>
						</div>
					</div>

					{#if expandedUser === user.id}
						<div class="px-4 pb-4 pt-3 bg-muted/10 border-t border-border space-y-5">
							<div>
								<p class="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
									Role
								</p>
								{#if user.assignableRoles.length > 0}
									<div class="flex gap-2 items-center flex-wrap">
										<select
											bind:value={pendingRoles[user.id]}
											class="px-3 py-1.5 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
											disabled={updatingUserId === user.id}
										>
											{#each user.assignableRoles as role}
												<option value={role}>
													{role.replace('_', ' ')}
												</option>
											{/each}
										</select>
										<Button
											type="button"
											size="sm"
											class="gap-1.5"
											disabled={updatingUserId === user.id}
											onclick={() => updateRole(user.id, user.role)}
										>
											{#if updatingUserId === user.id}
												<LoaderCircle class="w-3.5 h-3.5 animate-spin" />
												Updating...
											{:else}
												<Check class="w-3.5 h-3.5" /> Update Role
											{/if}
										</Button>
									</div>
								{:else}
									<p class="text-sm text-muted-foreground">
										You cannot change this user's role.
									</p>
								{/if}
							</div>

							<div>
								<p class="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
									Permissions
								</p>
								<div class="flex flex-wrap gap-2">
									{#if data.rolePermissions[selectedRoleFor(user.id, user.role)].length > 0}
										{#each data.rolePermissions[selectedRoleFor(user.id, user.role)] as permission}
											<Badge variant="secondary">{permission.replace(/_/g, ' ')}</Badge>
										{/each}
									{:else}
										<span class="text-sm text-muted-foreground">
											No admin permissions for this role.
										</span>
									{/if}
								</div>
							</div>

							<div>
								<p class="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
									Account Activity
								</p>
								<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<div class="rounded-xl border border-border bg-card px-3 py-2.5">
										<p class="text-[11px] uppercase tracking-wide text-muted-foreground">Subscription</p>
										<p class="mt-1 text-sm font-medium text-foreground">
											{user.hasActiveSubscription ? 'Active' : 'Inactive'}
										</p>
									</div>
									<div class="rounded-xl border border-border bg-card px-3 py-2.5">
										<p class="text-[11px] uppercase tracking-wide text-muted-foreground">Watch History</p>
										<p class="mt-1 text-sm font-medium text-foreground">{user.historyCount} items</p>
									</div>
									<div class="rounded-xl border border-border bg-card px-3 py-2.5">
										<p class="text-[11px] uppercase tracking-wide text-muted-foreground">Watchlist</p>
										<p class="mt-1 text-sm font-medium text-foreground">{user.watchlistCount} items</p>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		{:else}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<Users class="w-10 h-10 text-muted-foreground/40 mb-3" />
				<p class="font-medium text-foreground">
					{data.search || data.roleFilter ? 'No users match your filters' : 'No users yet'}
				</p>
				{#if data.search || data.roleFilter}
					<button onclick={clearFilters} class="mt-2 text-sm text-primary hover:underline">
						Clear filters
					</button>
				{/if}
			</div>
		{/if}
	</div>

	{#if data.pagination.totalPages > 1}
		<div class="flex items-center justify-between gap-3 flex-wrap">
			<p class="text-sm text-muted-foreground">
				Showing page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalItems}
				total users)
			</p>
			<div class="flex items-center gap-2">
				<Button
					href={data.pagination.hasPrev ? pageHref(data.pagination.page - 1) : undefined}
					variant="outline"
					size="sm"
					disabled={!data.pagination.hasPrev}
				>
					Previous
				</Button>
				<Button
					href={data.pagination.hasNext ? pageHref(data.pagination.page + 1) : undefined}
					variant="outline"
					size="sm"
					disabled={!data.pagination.hasNext}
				>
					Next
				</Button>
			</div>
		</div>
	{/if}
</div>

<style>
	.animate-in {
		animation: scale-in 0.15s ease-out;
	}
	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
