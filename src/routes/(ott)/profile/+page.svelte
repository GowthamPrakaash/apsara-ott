<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { signOut } from '@auth/sveltekit/client';

	let { data } = $props();
	const user = $derived(data.user);
	const initials = $derived(user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U');

	const roleLabel: Record<string, string> = {
		viewer: 'Viewer', editor: 'Editor', admin: 'Admin', super_admin: 'Super Admin'
	};
	const roleBadgeClass: Record<string, string> = {
		viewer: 'bg-muted text-muted-foreground',
		editor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
		admin: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
		super_admin: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
	};
</script>

<svelte:head>
	<title>Profile — Apsara Entertainment</title>
</svelte:head>

<div class="space-y-6">
	<div class="bg-card border border-border rounded-2xl p-6">
		<div class="flex items-start gap-6">
			<Avatar class="w-20 h-20 ring-4 ring-border">
				<AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
				<AvatarFallback class="text-xl font-bold bg-primary text-primary-foreground">{initials}</AvatarFallback>
			</Avatar>
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-3 mb-1">
					<h2 class="text-2xl font-bold text-foreground">{user?.name ?? 'User'}</h2>
					{#if user?.role}
						<span class="text-xs px-2 py-0.5 rounded-full border {roleBadgeClass[user.role]}">
							{roleLabel[user.role] ?? user.role}
						</span>
					{/if}
				</div>
				<p class="text-muted-foreground">{user?.email}</p>
				<p class="text-xs text-muted-foreground mt-1">
					Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
				</p>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<a href="/profile/history" class="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
			<p class="text-xs text-muted-foreground mb-1">Watch History</p>
			<p class="text-lg font-bold text-foreground">View All</p>
		</a>
		<a href="/profile/watchlist" class="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
			<p class="text-xs text-muted-foreground mb-1">Watchlist</p>
			<p class="text-lg font-bold text-foreground">View All</p>
		</a>
		<a href="/profile/subscription" class="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors">
			<p class="text-xs text-muted-foreground mb-1">Subscription</p>
			<p class="text-lg font-bold text-foreground">Manage</p>
		</a>
	</div>

	<div class="border border-destructive/30 rounded-xl p-4 flex items-center justify-between">
		<div>
			<p class="font-medium text-foreground">Sign Out</p>
			<p class="text-sm text-muted-foreground">Sign out of your account</p>
		</div>
		<Button variant="destructive" onclick={() => signOut({ callbackUrl: '/' })}>Sign Out</Button>
	</div>
</div>
