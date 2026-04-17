<script lang="ts">
	import { goto } from '$app/navigation';
	import Play from '@lucide/svelte/icons/play';
	import Plus from '@lucide/svelte/icons/plus';
	import Check from '@lucide/svelte/icons/check';
	import Clock from '@lucide/svelte/icons/clock';
	import Star from '@lucide/svelte/icons/star';

	let {
		id,
		name,
		slug,
		type = 'movie',
		posterUrl,
		genres = [],
		durationSeconds = null,
		status,
		featured = false,
		inWatchlist = false,
		onWatchlistToggle
	} = $props<{
		id: string;
		name: string;
		slug: string;
		type?: 'movie' | 'series';
		posterUrl?: string | null;
		genres?: { name: string; slug: string }[];
		durationSeconds?: number | null;
		status?: string;
		featured?: boolean;
		inWatchlist?: boolean;
		onWatchlistToggle?: (id: string, type: string) => void;
	}>();

	const watchHref = $derived(type === 'movie' ? `/movies/${id}` : `/series/${id}`);
	const detailHref = $derived(type === 'movie' ? `/movies/${id}` : `/series/${id}`);

	function formatDuration(seconds: number): string {
		if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		return m > 0 ? `${h}h ${m}m` : `${h}h`;
	}
</script>

<div class="group relative rounded-xl overflow-hidden bg-card border border-border/50 hover:border-border
	transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40 cursor-pointer">
	<!-- Poster Image -->
	<div role="button" tabindex="0" onclick={() => goto(detailHref)} onkeypress={() => goto(detailHref)} class="block aspect-[2/3] overflow-hidden bg-muted">
		{#if posterUrl}
			<img
				src={posterUrl}
				alt={name}
				class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
				loading="lazy"
			/>
		{:else}
			<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
				<Play class="w-12 h-12 text-muted-foreground/30" />
			</div>
		{/if}

		<!-- Overlay on hover -->
		<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent
			opacity-0 group-hover:opacity-100 transition-opacity duration-300">
			<div class="absolute bottom-0 left-0 right-0 p-4">
				<div class="flex gap-2 mb-3">
					<a href={watchHref}
						class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg
						bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-colors">
						<Play class="w-3.5 h-3.5 fill-current" />
						{type === 'movie' ? 'Watch' : 'View'}
					</a>
					{#if onWatchlistToggle}
						<button
							onclick={() => onWatchlistToggle?.(id, type)}
							class="flex items-center justify-center p-2 rounded-lg
							bg-white/20 hover:bg-white/30 text-white text-xs transition-colors"
							title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
						>
							{#if inWatchlist}
								<Check class="w-4 h-4" />
							{:else}
								<Plus class="w-4 h-4" />
							{/if}
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Card Info -->
	<div class="p-3">
		<button class="text-left w-full" onclick={() => goto(detailHref)}>
			<h3 class="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors">{name}</h3>
		</button>
		<div class="flex items-center gap-2 mt-1">
			{#if durationSeconds}
				<span class="flex items-center gap-1 text-xs text-muted-foreground">
					<Clock class="w-3 h-3" />
					{formatDuration(durationSeconds)}
				</span>
			{/if}
			{#if type === 'series'}
				<span class="text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
					Series
				</span>
			{/if}
			{#if featured}
				<span class="flex items-center gap-0.5 text-xs text-yellow-500">
					<Star class="w-3 h-3 fill-current" />
				</span>
			{/if}
		</div>
		{#if genres.length > 0}
			<div class="flex flex-wrap gap-1.5 mt-2">
				{#each genres.slice(0, 2) as genre}
					<span class="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
						{genre.name}
					</span>
				{/each}
			</div>
		{/if}
	</div>
</div>
