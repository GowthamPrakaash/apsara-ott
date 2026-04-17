<script lang="ts">
	import Clock from '@lucide/svelte/icons/clock';
	import Lock from '@lucide/svelte/icons/lock';
	import Play from '@lucide/svelte/icons/play';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import VideoPlayer from '$lib/components/ott/VideoPlayer.svelte';

	type Episode = {
		id: string;
		name: string;
		episodeNumber: number;
		seasonNumber: number;
		description: string | null;
		durationSeconds: number | null;
		releaseDate: Date | null;
		posterUrl: string | null;
		videoUrl: string | null;
		href: string;
		subtitles: {
			src: string;
			srclang: string;
			label: string;
			default?: boolean;
		}[];
	};

	type Season = {
		number: number;
		episodes: Episode[];
	};

	let { data } = $props<{
		data: {
			series: {
				id: string;
				name: string;
				description: string | null;
				posterUrl: string | null;
				genres: { name: string }[];
			};
			seasons: Season[];
			selectedEpisode: Episode | null;
			canWatch: boolean;
			isLoggedIn: boolean;
		};
	}>();

	const { series, seasons, selectedEpisode, canWatch, isLoggedIn } = $derived(data);
	let selectedSeason = $state(selectedEpisode?.seasonNumber ?? seasons[0]?.number ?? 1);
	let historyLogged = $state(false);

	const currentSeasonEpisodes = $derived(
		seasons.find((season: Season) => season.number === selectedSeason)?.episodes ?? []
	);

	function formatDuration(seconds: number | null): string {
		if (!seconds) return '';
		return `${Math.floor(seconds / 60)}m`;
	}

	async function logPlaybackStart() {
		if (!isLoggedIn || !canWatch || !selectedEpisode || historyLogged) return;

		historyLogged = true;
		try {
			await fetch('/api/watch-history', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ episodeId: selectedEpisode.id })
			});
		} catch {
			historyLogged = false;
		}
	}

	$effect(() => {
		selectedEpisode?.id;
		historyLogged = false;
	});
</script>

<svelte:head>
	<title>{selectedEpisode ? `${selectedEpisode.name} — ${series.name}` : `${series.name} — Apsara Entertainment`}</title>
</svelte:head>

<div class="max-w-7xl mx-auto space-y-8">
	<div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
		<div class="xl:col-span-2 space-y-4">
			<div class="rounded-2xl overflow-hidden bg-black relative">
				{#if selectedEpisode?.videoUrl && canWatch}
					<VideoPlayer
						src={selectedEpisode.videoUrl}
						poster={selectedEpisode.posterUrl}
						subtitles={selectedEpisode.subtitles}
						title={`${series.name} - ${selectedEpisode.name}`}
						on:play={logPlaybackStart}
					/>
				{:else if !selectedEpisode}
					<div class="aspect-video flex items-center justify-center text-white/40">
						Select an episode to watch
					</div>
				{:else if !selectedEpisode.videoUrl}
					<div class="aspect-video flex items-center justify-center text-white/60">
						<div class="text-center">
							<Play class="w-16 h-16 mx-auto mb-3 opacity-30" />
							<p>Video not available yet</p>
						</div>
					</div>
				{:else}
					<div class="aspect-video relative">
						{#if series.posterUrl}
							<img src={series.posterUrl} alt={series.name} class="w-full h-full object-cover opacity-20" />
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
					</div>
				{/if}
			</div>

			{#if selectedEpisode}
				<div>
					<h2 class="text-xl font-bold text-foreground">
						S{selectedEpisode.seasonNumber}E{selectedEpisode.episodeNumber}: {selectedEpisode.name}
					</h2>
					{#if selectedEpisode.durationSeconds}
						<span class="flex items-center gap-1 text-sm text-muted-foreground mt-1">
							<Clock class="w-3.5 h-3.5" />
							{formatDuration(selectedEpisode.durationSeconds)}
						</span>
					{/if}
					{#if selectedEpisode.description}
						<p class="text-muted-foreground text-sm mt-3 leading-relaxed">{selectedEpisode.description}</p>
					{/if}
				</div>
			{/if}

			<div class="border-t border-border pt-4">
				<div class="flex items-start gap-4">
					{#if series.posterUrl}
						<img src={series.posterUrl} alt={series.name} class="w-20 rounded-lg object-cover" />
					{/if}
					<div>
						<h1 class="text-2xl font-bold text-foreground mb-2">{series.name}</h1>
						<div class="flex flex-wrap gap-2 mb-2">
							{#each series.genres as genre}
								<Badge variant="secondary">{genre.name}</Badge>
							{/each}
						</div>
						{#if series.description}
							<p class="text-muted-foreground text-sm leading-relaxed">{series.description}</p>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="space-y-4">
			{#if seasons.length > 1}
				<div class="flex gap-2 flex-wrap">
					{#each seasons as season}
						<button
							onclick={() => {
								selectedSeason = season.number;
							}}
							class="px-4 py-2 rounded-lg text-sm font-medium transition-colors
							{selectedSeason === season.number ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}"
						>
							Season {season.number}
						</button>
					{/each}
				</div>
			{/if}

			<div class="space-y-2 max-h-[600px] overflow-y-auto pr-1">
				{#each currentSeasonEpisodes as episode}
					<a
						href={episode.href}
						class="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all
						{selectedEpisode?.id === episode.id
							? 'bg-primary/10 border border-primary/30'
							: 'bg-card border border-border/50 hover:border-border'}"
					>
						<div class="relative w-24 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
							{#if episode.posterUrl}
								<img src={episode.posterUrl} alt={episode.name} class="w-full h-full object-cover" />
							{/if}
							{#if selectedEpisode?.id === episode.id}
								<div class="absolute inset-0 bg-primary/30 flex items-center justify-center">
									<Play class="w-5 h-5 text-white fill-current" />
								</div>
							{/if}
						</div>
						<div class="min-w-0 flex-1">
							<p class="text-xs text-muted-foreground mb-0.5">E{episode.episodeNumber}</p>
							<p class="font-medium text-sm text-foreground truncate">{episode.name}</p>
							{#if episode.durationSeconds}
								<p class="text-xs text-muted-foreground mt-0.5">{formatDuration(episode.durationSeconds)}</p>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
