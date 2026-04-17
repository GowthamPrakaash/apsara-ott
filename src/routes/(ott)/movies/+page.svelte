<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import ContentCard from '$lib/components/ott/ContentCard.svelte';
	import Filter from '@lucide/svelte/icons/filter';

	let { data } = $props();

	const currentPage = $derived(data.pagination.page);
	const totalPages = $derived(data.pagination.totalPages);

	function navigatePage(p: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', String(p));
		goto(url.toString());
	}

	function selectGenre(slug: string) {
		const url = new URL($page.url);
		if (slug) url.searchParams.set('genre', slug);
		else url.searchParams.delete('genre');
		url.searchParams.delete('page');
		goto(url.toString());
	}
</script>

<svelte:head>
	<title>Movies — Apsara Entertainment</title>
	<meta name="description" content="Browse all movies on Apsara Entertainment streaming platform." />
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold text-foreground">Movies</h1>
			<p class="text-muted-foreground text-sm mt-1">{data.pagination.totalCount} movie{data.pagination.totalCount !== 1 ? 's' : ''} available</p>
		</div>
	</div>

	<!-- Genre Filter -->
	{#if data.genres.length > 0}
		<div class="flex items-center gap-2 flex-wrap">
			<div class="flex items-center gap-1.5 text-sm text-muted-foreground mr-1">
				<Filter class="w-4 h-4" />
				Genre:
			</div>
			<button
				onclick={() => selectGenre('')}
				class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors
				{!data.selectedGenre ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}"
			>
				All
			</button>
			{#each data.genres as genre}
				<button
					onclick={() => selectGenre(genre.slug)}
					class="px-3 py-1.5 rounded-full text-xs font-medium transition-colors
					{data.selectedGenre === genre.slug ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}"
				>
					{genre.name}
				</button>
			{/each}
		</div>
	{/if}

	<!-- Movies Grid -->
	{#if data.movies.length > 0}
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
			{#each data.movies as movie}
				<ContentCard
					id={movie.id}
					name={movie.name}
					slug={movie.slug}
					type="movie"
					posterUrl={movie.posterUrl}
					genres={movie.genres}
					durationSeconds={movie.durationSeconds}
					featured={movie.featured}
				/>
			{/each}
		</div>
	{:else}
		<div class="flex flex-col items-center justify-center py-24 text-center">
			<div class="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
				<span class="text-3xl">🎬</span>
			</div>
			<h3 class="text-lg font-semibold text-foreground mb-2">No movies found</h3>
			<p class="text-muted-foreground text-sm">
				{data.selectedGenre ? 'No movies in this genre yet.' : 'No movies have been published yet.'}
			</p>
		</div>
	{/if}

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="flex justify-center gap-2 pt-4">
			<button
				onclick={() => navigatePage(currentPage - 1)}
				disabled={currentPage <= 1}
				class="px-4 py-2 rounded-lg bg-muted text-sm font-medium disabled:opacity-40 hover:bg-muted/80 transition-colors"
			>
				← Prev
			</button>
			{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
				{#if p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)}
					<button
						onclick={() => navigatePage(p)}
						class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
						{p === currentPage ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}"
					>
						{p}
					</button>
				{:else if p === currentPage - 3 || p === currentPage + 3}
					<span class="px-2 py-2 text-muted-foreground">…</span>
				{/if}
			{/each}
			<button
				onclick={() => navigatePage(currentPage + 1)}
				disabled={currentPage >= totalPages}
				class="px-4 py-2 rounded-lg bg-muted text-sm font-medium disabled:opacity-40 hover:bg-muted/80 transition-colors"
			>
				Next →
			</button>
		</div>
	{/if}
</div>
