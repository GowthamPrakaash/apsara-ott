<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { signOut } from '@auth/sveltekit/client';
	import PlaySquare from '@lucide/svelte/icons/play-square';
	import Search from '@lucide/svelte/icons/search';
	import Menu from '@lucide/svelte/icons/menu';
	import X from '@lucide/svelte/icons/x';
	import User from '@lucide/svelte/icons/user';
	import LogOut from '@lucide/svelte/icons/log-out';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { canAccessAdmin } from '$lib/access';

	type SessionProp = {
		user?: {
			name?: string | null;
			email?: string | null;
			image?: string | null;
			role?: string;
		};
	} | null | undefined;

	let { session } = $props<{ session?: SessionProp }>();

	let mobileMenuOpen = $state(false);
	let searchOpen = $state(false);
	let searchQuery = $state('');

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/movies', label: 'Movies' },
		{ href: '/series', label: 'Series' }
	];

	const current = $derived($page.url.pathname);
	const user = $derived(session?.user);
	const userInitials = $derived(
		user?.name
			?.split(' ')
			.map((n: string) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2) ?? 'U'
	);

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	}
</script>

<header class="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-2.5 shrink-0">
				<div class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30">
					<PlaySquare class="w-5 h-5 text-primary-foreground" />
				</div>
				<span class="text-xl font-bold text-foreground">Apsara Entertainment</span>
			</a>

			<!-- Desktop Nav -->
			<nav class="hidden md:flex items-center gap-1">
				{#each navLinks as link}
					<a
						href={link.href}
						class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
						{current === link.href
							? 'text-foreground bg-muted'
							: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>

			<!-- Right Actions -->
			<div class="flex items-center gap-2">
				<!-- Search -->
				<div class="hidden sm:flex items-center">
					{#if searchOpen}
						<form onsubmit={handleSearch} class="flex items-center gap-2">
							<input
								type="text"
								placeholder="Search movies, series..."
								bind:value={searchQuery}
								autofocus
								class="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground w-52 focus:outline-none focus:ring-2 focus:ring-primary/50"
							/>
							<button
								onclick={() => { searchOpen = false; searchQuery = ''; }}
								type="button"
								class="text-muted-foreground hover:text-foreground transition-colors"
							>
								<X class="w-4 h-4" />
							</button>
						</form>
					{:else}
						<button
							onclick={() => (searchOpen = true)}
							class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
						>
							<Search class="w-5 h-5" />
						</button>
					{/if}
				</div>

				{#if user}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Avatar class="w-9 h-9 cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all">
								<AvatarImage src={user.image ?? ''} alt={user.name ?? ''} />
								<AvatarFallback class="bg-primary text-primary-foreground text-xs font-semibold">
									{userInitials}
								</AvatarFallback>
							</Avatar>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-56" align="end">
							<div class="px-3 py-2 border-b border-border mb-1">
								<p class="text-sm font-medium text-foreground">{user.name}</p>
								<p class="text-xs text-muted-foreground">{user.email}</p>
							</div>
							<DropdownMenu.Item onSelect={() => goto('/profile')} class="gap-2">
								<User class="w-4 h-4" /> Profile
							</DropdownMenu.Item>
							<DropdownMenu.Item onSelect={() => goto('/profile/subscription')} class="gap-2">
								<PlaySquare class="w-4 h-4" /> Subscription
							</DropdownMenu.Item>
							{#if canAccessAdmin(user.role as any)}
								<DropdownMenu.Separator />
								<DropdownMenu.Item onSelect={() => goto('/admin')} class="gap-2 text-primary">
									<LayoutDashboard class="w-4 h-4" /> Admin Dashboard
								</DropdownMenu.Item>
							{/if}
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onSelect={() => signOut({ callbackUrl: '/' })}
								class="gap-2 text-destructive focus:text-destructive"
							>
								<LogOut class="w-4 h-4" /> Sign out
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{:else}
					<Button href="/login" size="sm" class="hidden sm:flex">Sign In</Button>
				{/if}

				<!-- Mobile menu toggle -->
				<button
					onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
					class="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
				>
					{#if mobileMenuOpen}
						<X class="w-5 h-5" />
					{:else}
						<Menu class="w-5 h-5" />
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile Menu -->
	{#if mobileMenuOpen}
		<div class="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
			<div class="max-w-7xl mx-auto px-4 py-3 space-y-1">
				{#each navLinks as link}
					<a
						href={link.href}
						onclick={() => (mobileMenuOpen = false)}
						class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
						{current === link.href
							? 'text-foreground bg-muted'
							: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
					>
						{link.label}
					</a>
				{/each}
				<!-- Mobile search -->
				<form onsubmit={handleSearch} class="flex gap-2 pt-2">
					<input
						type="text"
						placeholder="Search..."
						bind:value={searchQuery}
						class="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
					<Button type="submit" size="sm">
						<Search class="w-4 h-4" />
					</Button>
				</form>
				{#if !user}
					<a
						href="/login"
						onclick={() => (mobileMenuOpen = false)}
						class="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium mt-2"
					>
						Sign In
					</a>
				{/if}
			</div>
		</div>
	{/if}
</header>
