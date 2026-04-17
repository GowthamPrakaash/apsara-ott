<script lang="ts">
	import Play from '@lucide/svelte/icons/play';
	import Clock from '@lucide/svelte/icons/clock';
	import Lock from '@lucide/svelte/icons/lock';
	import Plus from '@lucide/svelte/icons/plus';
	import Check from '@lucide/svelte/icons/check';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import VideoPlayer from '$lib/components/ott/VideoPlayer.svelte';
	import { enhance } from '$app/forms';

	let { data } = $props();
	const { movie, canWatch, inWatchlist, isLoggedIn } = $derived(data);

	let watchlistLoading = $state(false);
	let historyLogged = $state(false);

	function formatDuration(seconds: number | null): string {
		if (!seconds) return '';
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`;
	}

	async function logPlaybackStart() {
		if (!isLoggedIn || !canWatch || !movie.videoUrl || historyLogged) return;

		historyLogged = true;
		try {
			await fetch('/api/watch-history', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ movieId: movie.id })
			});
		} catch {
			historyLogged = false;
		}
	}
</script>

<svelte:head>
	<title>{movie.name} — Apsara Entertainment</title>
	<meta name="description" content={movie.description ?? `Watch ${movie.name} on Apsara Entertainment`} />
</svelte:head>

<div class="max-w-5xl mx-auto space-y-8">
	<!-- Video Player -->
	<div class="rounded-2xl overflow-hidden bg-black aspect-video relative shadow-2xl">
		{#if canWatch && movie.videoUrl}
			<VideoPlayer
				src={movie.videoUrl}
				poster={movie.posterUrl}
				subtitles={movie.subtitles}
				title={movie.name}
				on:play={logPlaybackStart}
			/>
		{:else if !movie.videoUrl}
			{#if movie.posterUrl}
				<img src={movie.posterUrl} alt={movie.name} class="w-full h-full object-cover opacity-20 absolute inset-0" />
			{/if}
			<div class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/60 backdrop-blur-sm">
				<Play class="w-16 h-16 text-white/30 mb-3" />
				<p class="text-white/60">No video uploaded yet</p>
			</div>
		{:else}
			{#if movie.posterUrl}
				<img src={movie.posterUrl} alt={movie.name} class="w-full h-full object-cover opacity-20 absolute inset-0" />
			{/if}
			<div class="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/60 backdrop-blur-sm">
				<div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-5 border-2 border-primary/50">
					<Lock class="w-8 h-8 text-primary" />
				</div>
				<h2 class="text-xl font-bold text-white mb-2">Subscription Required</h2>
				<p class="text-white/70 mb-5 text-sm">Subscribe for <span class="text-primary font-semibold">₹99/month</span></p>
				{#if isLoggedIn}
					<a href="/profile/subscription" class="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all hover:scale-105">
						Subscribe Now
					</a>
				{:else}
					<a href="/login" class="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all">
						Sign In to Watch
					</a>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Movie Info -->
	<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
		<!-- Poster -->
		{#if movie.posterUrl}
			<div class="hidden md:block">
				<img src={movie.posterUrl} alt={movie.name} class="w-full rounded-xl object-cover shadow-lg" />
			</div>
		{/if}

		<!-- Details -->
		<div class="{movie.posterUrl ? 'md:col-span-3' : 'md:col-span-4'} space-y-4">
			<div>
				<div class="flex items-start justify-between gap-4 flex-wrap">
					<h1 class="text-3xl font-bold text-foreground">{movie.name}</h1>
					{#if isLoggedIn}
						<form method="POST" action="/profile/watchlist?/toggle" use:enhance={() => {
							watchlistLoading = true;
							return async ({ update }) => { await update(); watchlistLoading = false; };
						}}>
							<input type="hidden" name="movieId" value={movie.id} />
							<Button type="submit" variant="outline" size="sm" class="gap-2 shrink-0" disabled={watchlistLoading}>
								{#if inWatchlist}
									<Check class="w-4 h-4" /> In Watchlist
								{:else}
									<Plus class="w-4 h-4" /> Watchlist
								{/if}
							</Button>
						</form>
					{/if}
				</div>

				<div class="flex flex-wrap items-center gap-3 mt-3">
					{#each movie.genres as genre}
						<Badge variant="secondary">{genre.name}</Badge>
					{/each}
					{#if movie.durationSeconds}
						<span class="flex items-center gap-1.5 text-sm text-muted-foreground">
							<Clock class="w-3.5 h-3.5" />
							{formatDuration(movie.durationSeconds)}
						</span>
					{/if}
					{#if movie.releaseDate}
						<span class="flex items-center gap-1.5 text-sm text-muted-foreground">
							<CalendarDays class="w-3.5 h-3.5" />
							{new Date(movie.releaseDate).getFullYear()}
						</span>
					{/if}
				</div>
			</div>

			{#if movie.description}
				<p class="text-muted-foreground leading-relaxed">{movie.description}</p>
			{/if}

			{#if !canWatch}
				<div class="flex gap-3 pt-2">
					{#if isLoggedIn}
						<Button href="/profile/subscription" class="gap-2">
							<Play class="w-4 h-4 fill-current" /> Subscribe to Watch
						</Button>
					{:else}
						<Button href="/login?callbackUrl=/movies/{movie.id}" class="gap-2">
							<Play class="w-4 h-4 fill-current" /> Sign In to Watch
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
