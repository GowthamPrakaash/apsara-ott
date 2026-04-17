<script lang="ts">
	import { goto } from '$app/navigation';
	import ContentCard from '$lib/components/ott/ContentCard.svelte';
	import Search from '@lucide/svelte/icons/search';

	let { data } = $props();
	let searchQuery = $state(data.q);
	let debounceTimer: ReturnType<typeof setTimeout>;

	function doSearch(q: string) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			goto(`/search?q=${encodeURIComponent(q)}`, { keepFocus: true });
		}, 300);
	}
</script>

<svelte:head>
	<title>{data.q ? `"${data.q}" — Search` : 'Search'} — Apsara Entertainment</title>
</svelte:head>

<div class="space-y-8">
	<!-- Search Input -->
	<div class="relative max-w-2xl">
		<Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
		<input
			type="text"
			placeholder="Search movies and series..."
			bind:value={searchQuery}
			oninput={() => doSearch(searchQuery)}
			class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted border border-border text-foreground
			placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
		/>
	</div>

	{#if data.q}
		<div>
			<p class="text-muted-foreground text-sm mb-6">
				{data.movies.length + data.series.length} results for "<span class="text-foreground font-medium">{data.q}</span>"
			</p>

			{#if data.movies.length > 0}
				<section class="mb-10">
					<h2 class="text-xl font-bold text-foreground mb-4">Movies</h2>
					<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
						{#each data.movies as movie}
							<ContentCard id={movie.id} name={movie.name} slug={movie.slug} type="movie"
								posterUrl={movie.posterUrl} genres={movie.genres} durationSeconds={movie.durationSeconds} />
						{/each}
					</div>
				</section>
			{/if}

			{#if data.series.length > 0}
				<section>
					<h2 class="text-xl font-bold text-foreground mb-4">Series</h2>
					<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
						{#each data.series as s}
							<ContentCard id={s.id} name={s.name} slug={s.slug} type="series"
								posterUrl={s.posterUrl} genres={s.genres} />
						{/each}
					</div>
				</section>
			{/if}

			{#if data.movies.length === 0 && data.series.length === 0}
				<div class="flex flex-col items-center justify-center py-24 text-center">
					<div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
						<Search class="w-8 h-8 text-muted-foreground" />
					</div>
					<h3 class="text-lg font-semibold text-foreground mb-2">No results found</h3>
					<p class="text-muted-foreground text-sm">Try a different search term</p>
				</div>
			{/if}
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-24 text-center">
			<Search class="w-12 h-12 text-muted-foreground/40 mb-4" />
			<p class="text-muted-foreground">Start typing to search for movies and series</p>
		</div>
	{/if}
</div>
