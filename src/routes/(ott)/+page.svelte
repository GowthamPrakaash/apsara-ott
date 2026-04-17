<script lang="ts">
	import HeroBanner from '$lib/components/ott/HeroBanner.svelte';
	import ContentRow from '$lib/components/ott/ContentRow.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Apsara Entertainment — Premium Streaming</title>
	<meta name="description" content="Watch the latest movies and series on Apsara Entertainment, your premium streaming platform." />
</svelte:head>

<HeroBanner featured={data.heroItems} />

<div class="space-y-12">
	<ContentRow title="Featured Movies" items={data.featuredMovies} type="movie" />
	<ContentRow title="Featured Series" items={data.featuredSeries} type="series" />
	<ContentRow title="Trending Movies" items={data.trendingMovies} type="movie" />
	<ContentRow title="Trending Series" items={data.trendingSeries} type="series" />
	<ContentRow title="Recently Added Movies" items={data.recentMovies} type="movie" />
	<ContentRow title="Recently Added Series" items={data.recentSeries} type="series" />
</div>
