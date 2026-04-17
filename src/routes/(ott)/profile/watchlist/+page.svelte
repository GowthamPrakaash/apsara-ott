<script lang="ts">
	import { enhance } from '$app/forms';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import Bookmark from '@lucide/svelte/icons/bookmark';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Play from '@lucide/svelte/icons/play';

	let { data } = $props();

	function formatDate(d: Date) {
		return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<svelte:head><title>Watchlist — Apsara Entertainment</title></svelte:head>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold text-foreground">Watchlist</h2>
		<p class="text-sm text-muted-foreground mt-1">
			{data.watchlist.length} {data.watchlist.length === 1 ? 'title' : 'titles'} saved to watch later.
		</p>
	</div>
	{#if data.watchlist.length > 0}
		<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
			{#each data.watchlist as item}
				{@const content = item.movie ?? item.series}
				{@const type = item.movie ? 'movie' : 'series'}
				{@const watchHref = type === 'movie' ? `/movies/${content?.id}` : `/series/${content?.id}`}
				<div class="group relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-border transition-all">
					<a href={watchHref} class="relative block aspect-[2/3] overflow-hidden bg-muted">
						{#if content?.posterUrl}
							<img src={content.posterUrl} alt={content.name} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
						{:else}
							<div class="w-full h-full grid place-items-center text-xs text-muted-foreground px-4 text-center">
								No poster available
							</div>
						{/if}
						<div class="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
							<div class="flex items-center gap-1.5 text-white text-xs font-medium">
								<Play class="w-3.5 h-3.5 fill-current" />
								{type === 'movie' ? 'Watch' : 'View Series'}
							</div>
						</div>
					</a>
					<div class="p-2.5 space-y-2">
						<div class="flex items-start justify-between gap-2">
							<div class="min-w-0 flex-1">
								<a href={watchHref} class="text-sm font-medium text-foreground truncate hover:text-primary transition-colors block">
									{content?.name}
								</a>
								<p class="text-xs text-muted-foreground mt-1">Added {formatDate(item.addedAt)}</p>
							</div>
							<form method="POST" action="?/remove" use:enhance>
							<input type="hidden" name="id" value={item.id} />
							<button type="submit" class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Remove from watchlist">
								<Trash2 class="w-3.5 h-3.5" />
							</button>
						</form>
						</div>
						<Badge variant="secondary" class="capitalize">
							{type}
						</Badge>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-20 text-center">
			<Bookmark class="w-12 h-12 text-muted-foreground/40 mb-4" />
			<h3 class="text-lg font-semibold text-foreground mb-2">Your watchlist is empty</h3>
			<p class="text-muted-foreground text-sm">Add movies and series to watch later</p>
		</div>
	{/if}
</div>
