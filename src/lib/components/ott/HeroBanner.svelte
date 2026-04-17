<script lang="ts">
	import Play from '@lucide/svelte/icons/play';
	import Info from '@lucide/svelte/icons/info';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let {
		featured = []
	} = $props<{
		featured: {
			id: string;
			name: string;
			description?: string | null;
			posterUrl?: string | null;
			genres?: { name: string }[];
			type: 'movie' | 'series';
		}[];
	}>();

	let current = $state(0);
	let intervalId: ReturnType<typeof setInterval>;

	$effect(() => {
		if (featured.length > 1) {
			intervalId = setInterval(() => {
				current = (current + 1) % featured.length;
			}, 6000);
		}
		return () => clearInterval(intervalId);
	});

	function prev() {
		current = (current - 1 + featured.length) % featured.length;
		clearInterval(intervalId);
	}
	function next() {
		current = (current + 1) % featured.length;
		clearInterval(intervalId);
	}

	const item = $derived(featured[current]);
</script>

{#if featured.length > 0 && item}
<div class="relative h-[60vh] min-h-[420px] max-h-[700px] overflow-hidden rounded-2xl mb-10">
	<!-- Background image with parallax feel -->
	{#each featured as f, i}
		<div
			class="absolute inset-0 transition-opacity duration-700"
			style="opacity: {i === current ? 1 : 0};"
		>
			{#if f.posterUrl}
				<img
					src={f.posterUrl}
					alt={f.name}
					class="w-full h-full object-cover scale-105"
				/>
			{:else}
				<div class="w-full h-full bg-gradient-to-br from-primary/20 to-background"></div>
			{/if}
		</div>
	{/each}

	<!-- Gradient overlays -->
	<div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
	<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

	<!-- Content -->
	<div class="absolute inset-0 flex items-end pb-12 px-8 sm:px-12 md:px-16">
		<div class="max-w-xl">
			{#if item.genres && item.genres.length > 0}
				<div class="flex gap-2 mb-3">
					{#each item.genres.slice(0, 3) as genre}
						<span class="text-xs px-2.5 py-1 rounded-full bg-white/20 text-white/90 backdrop-blur-sm">
							{genre.name}
						</span>
					{/each}
				</div>
			{/if}

			<h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
				{item.name}
			</h1>

			{#if item.description}
				<p class="text-sm sm:text-base text-white/80 mb-6 line-clamp-2 drop-shadow">
					{item.description}
				</p>
			{/if}

			<div class="flex gap-3">
				<a
					href={item.type === 'movie' ? `/movies/${item.id}` : `/series/${item.id}`}
					class="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90
					text-primary-foreground font-semibold text-sm transition-all duration-200 shadow-lg shadow-primary/30 hover:scale-105"
				>
					<Play class="w-4 h-4 fill-current" />
					{item.type === 'movie' ? 'Watch Now' : 'View Series'}
				</a>
				<a
					href={item.type === 'movie' ? `/movies/${item.id}` : `/series/${item.id}`}
					class="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30
					text-white font-semibold text-sm backdrop-blur-sm transition-all duration-200 hover:scale-105"
				>
					<Info class="w-4 h-4" />
					More Info
				</a>
			</div>
		</div>
	</div>

	<!-- Navigation arrows -->
	{#if featured.length > 1}
		<button
			onclick={prev}
			class="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40
			hover:bg-black/60 text-white transition-all duration-200 backdrop-blur-sm hover:scale-110"
			aria-label="Previous"
		>
			<ChevronLeft class="w-5 h-5" />
		</button>
		<button
			onclick={next}
			class="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40
			hover:bg-black/60 text-white transition-all duration-200 backdrop-blur-sm hover:scale-110"
			aria-label="Next"
		>
			<ChevronRight class="w-5 h-5" />
		</button>

		<!-- Dots -->
		<div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
			{#each featured as _, i}
				<button
					onclick={() => { current = i; clearInterval(intervalId); }}
					class="w-2 h-2 rounded-full transition-all duration-300
					{i === current ? 'bg-white w-6' : 'bg-white/40'}"
					aria-label="Go to slide {i + 1}"
				></button>
			{/each}
		</div>
	{/if}
</div>
{/if}
