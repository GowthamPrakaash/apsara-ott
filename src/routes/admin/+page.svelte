<script lang="ts">
	import Film from '@lucide/svelte/icons/film';
	import Tv from '@lucide/svelte/icons/tv';
	import Users from '@lucide/svelte/icons/users';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import Plus from '@lucide/svelte/icons/plus';

	let { data } = $props();

	const statCards = [
		{ label: 'Published Movies', value: data.stats.movies, icon: Film, href: '/admin/movies', color: 'text-blue-400', bg: 'bg-blue-500/10' },
		{ label: 'Published Series', value: data.stats.series, icon: Tv, href: '/admin/series', color: 'text-purple-400', bg: 'bg-purple-500/10' },
		{ label: 'Total Users', value: data.stats.users, icon: Users, href: '/admin/users', color: 'text-green-400', bg: 'bg-green-500/10' },
		{ label: 'Active Subscribers', value: data.stats.subscribers, icon: CreditCard, href: '/admin/users', color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
	];

	const quickActions = [
		{ label: 'Add Movie', href: '/admin/movies?action=create', icon: Film },
		{ label: 'Add Series', href: '/admin/series?action=create', icon: Tv },
		{ label: 'Add Genre', href: '/admin/genres?action=create', icon: Plus },
		{ label: 'Manage Users', href: '/admin/users', icon: Users }
	];
</script>

<svelte:head><title>Admin Dashboard — Apsara Entertainment</title></svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Dashboard</h1>
		<p class="text-muted-foreground text-sm mt-1">Manage your content and users</p>
	</div>

	<!-- Stats -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each statCards as stat}
			<a href={stat.href}
				class="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-all hover:shadow-md hover:shadow-black/20 group">
				<div class="flex items-start justify-between mb-4">
					<div class="w-10 h-10 rounded-lg {stat.bg} flex items-center justify-center">
						<stat.icon class="w-5 h-5 {stat.color}" />
					</div>
				</div>
				<p class="text-3xl font-bold text-foreground mb-1">{stat.value.toLocaleString()}</p>
				<p class="text-sm text-muted-foreground">{stat.label}</p>
			</a>
		{/each}
	</div>

	<!-- Quick Actions -->
	<div>
		<h2 class="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
			{#each quickActions as action}
				<a href={action.href}
					class="flex flex-col items-center gap-2.5 p-4 rounded-xl bg-card border border-border
					hover:border-primary/50 hover:bg-primary/5 transition-all text-center group">
					<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
						<action.icon class="w-5 h-5 text-primary" />
					</div>
					<span class="text-sm font-medium text-foreground">{action.label}</span>
				</a>
			{/each}
		</div>
	</div>
</div>
