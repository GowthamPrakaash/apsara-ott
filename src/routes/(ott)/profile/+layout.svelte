<script lang="ts">
	import { page } from '$app/stores';
	import User from '@lucide/svelte/icons/user';
	import BookMarked from '@lucide/svelte/icons/bookmark';
	import History from '@lucide/svelte/icons/history';
	import Settings from '@lucide/svelte/icons/settings';
	import CreditCard from '@lucide/svelte/icons/credit-card';

	let { data, children } = $props();

	const navItems = [
		{ href: '/profile', label: 'Profile', icon: User },
		{ href: '/profile/history', label: 'Watch History', icon: History },
		{ href: '/profile/watchlist', label: 'Watchlist', icon: BookMarked },
		{ href: '/profile/subscription', label: 'Subscription', icon: CreditCard },
		{ href: '/profile/settings', label: 'Settings', icon: Settings }
	];

	const current = $derived($page.url.pathname);
</script>

<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
	<!-- Sidebar -->
	<aside class="md:col-span-1">
		<nav class="space-y-1">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
					{current === item.href
						? 'bg-primary/10 text-primary border border-primary/20'
						: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
				>
					<item.icon class="w-4 h-4 flex-shrink-0" />
					{item.label}
				</a>
			{/each}
		</nav>
	</aside>

	<!-- Content -->
	<div class="md:col-span-3">
		{@render children()}
	</div>
</div>
