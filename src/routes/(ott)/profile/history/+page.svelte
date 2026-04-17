<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import Clock from '@lucide/svelte/icons/clock';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let { data } = $props();

	function formatDate(d: Date) {
		return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function pageHref(page: number) {
		return `?page=${page}`;
	}
</script>

<svelte:head><title>Watch History — Apsara Entertainment</title></svelte:head>

<div class="space-y-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div>
			<h2 class="text-2xl font-bold text-foreground">Watch History</h2>
			<p class="text-sm text-muted-foreground mt-1">
				Showing {data.pagination.loadedItems} of {data.pagination.totalItems} activities.
			</p>
		</div>
		{#if data.history.length > 0}
			<form method="POST" action="?/clearHistory" use:enhance>
				<Button type="submit" variant="outline" size="sm" class="gap-2">
					<Trash2 class="w-4 h-4" /> Clear History
				</Button>
			</form>
		{/if}
	</div>
	{#if data.history.length > 0}
		<div class="space-y-3">
			{#each data.history as item}
				{@const content = item.movie ?? item.episode}
				<div
					class="flex items-center gap-4 p-3 rounded-xl bg-card border border-border/50 hover:border-border transition-all group"
				>
					<a href={item.href ?? '#'} class="flex items-center gap-4 flex-1 min-w-0">
						<div class="w-20 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
							{#if content?.posterUrl}
								<img src={content.posterUrl} alt={item.title} class="w-full h-full object-cover" />
							{:else}
								<div class="w-full h-full grid place-items-center text-xs text-muted-foreground">
									No poster
								</div>
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<p class="font-medium text-foreground group-hover:text-primary transition-colors truncate">
								{item.title}
							</p>
							<div class="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
								<span class="flex items-center gap-1">
									<Clock class="w-3 h-3" /> Watched
								</span>
								<span>{formatDate(item.watchedAt)}</span>
							</div>
						</div>
					</a>
					<form method="POST" action="?/removeItem" use:enhance class="shrink-0">
						<input type="hidden" name="id" value={item.id} />
						<Button type="submit" variant="ghost" size="icon" class="text-muted-foreground hover:text-destructive">
							<Trash2 class="w-4 h-4" />
						</Button>
					</form>
				</div>
			{/each}
			</div>
			{#if data.pagination.hasMore}
				<div class="pt-2 flex justify-center">
					<Button href={pageHref(data.pagination.page + 1)} variant="outline">
						Load More
					</Button>
				</div>
			{/if}
		{:else}
		<div class="flex flex-col items-center justify-center py-20 text-center">
			<Clock class="w-12 h-12 text-muted-foreground/40 mb-4" />
			<h3 class="text-lg font-semibold text-foreground mb-2">No watch history</h3>
			<p class="text-muted-foreground text-sm">Start watching movies and series to build your history</p>
		</div>
	{/if}
</div>
