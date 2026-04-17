<script lang="ts">
	import { page } from '$app/stores';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Film from '@lucide/svelte/icons/film';
	import Tv from '@lucide/svelte/icons/tv';
	import Tags from '@lucide/svelte/icons/tags';
	import Users from '@lucide/svelte/icons/users';
	import PlaySquare from '@lucide/svelte/icons/play-square';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { canManageUsers } from '$lib/access';

	let { data, children } = $props();

	const navItems = $derived([
		{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
		{ href: '/admin/genres', label: 'Genres', icon: Tags },
		{ href: '/admin/movies', label: 'Movies', icon: Film },
		{ href: '/admin/series', label: 'Series', icon: Tv },
		...(canManageUsers(data.userRole)
			? [{ href: '/admin/users', label: 'Users', icon: Users }]
			: [])
	]);

	const current = $derived($page.url.pathname);

	function isActive(href: string, exact = false) {
		if (exact) return current === href;
		return current === href || current.startsWith(href + '/');
	}
</script>

<div class="flex h-screen overflow-hidden bg-background">
	<!-- Sidebar -->
	<aside class="flex h-full w-60 shrink-0 flex-col border-r border-border bg-card">
		<div class="p-5 border-b border-border">
			<a href="/" class="flex items-center gap-2.5">
				<div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
					<PlaySquare class="w-5 h-5 text-primary-foreground" />
				</div>
				<div>
					<span class="font-bold text-foreground text-sm">Apsara Entertainment</span>
					<p class="text-xs text-muted-foreground">Admin</p>
				</div>
			</a>
		</div>

		<nav class="flex-1 p-3 space-y-0.5">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
					{isActive(item.href, item.exact)
						? 'bg-primary/10 text-primary border border-primary/20'
						: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
				>
					<item.icon class="w-4 h-4 flex-shrink-0" />
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="p-3 border-t border-border">
			<a href="/" class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
				<ChevronRight class="w-4 h-4 rotate-180" />
				Back to Site
			</a>
		</div>
	</aside>

	<!-- Main -->
	<main class="min-h-0 flex-1 overflow-y-auto">
		<div class="p-8">
			{@render children()}
		</div>
	</main>
</div>
