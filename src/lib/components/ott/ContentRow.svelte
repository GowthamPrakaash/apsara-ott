<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import ContentCard from './ContentCard.svelte';

	let {
		title,
		items = [],
		type = 'movie'
	} = $props<{
		title: string;
		items: {
			id: string;
			name: string;
			slug: string;
			posterUrl?: string | null;
			genres?: { name: string; slug: string }[];
			durationSeconds?: number | null;
			featured?: boolean;
		}[];
		type?: 'movie' | 'series';
	}>();

	let scrollContainer: HTMLDivElement;

	function scroll(dir: 'left' | 'right') {
		const amount = 320;
		scrollContainer.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
	}
</script>

{#if items.length > 0}
<section class="relative">
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-xl font-bold text-foreground">{title}</h2>
		<div class="flex gap-1">
			<button
				onclick={() => scroll('left')}
				class="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
				aria-label="Scroll left"
			>
				<ChevronLeft class="w-4 h-4" />
			</button>
			<button
				onclick={() => scroll('right')}
				class="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
				aria-label="Scroll right"
			>
				<ChevronRight class="w-4 h-4" />
			</button>
		</div>
	</div>

	<div
		bind:this={scrollContainer}
		class="flex gap-4 overflow-x-auto pb-4 scrollbar-none"
		style="scrollbar-width: none; -ms-overflow-style: none;"
	>
		{#each items as item}
			<div class="flex-shrink-0 w-40 sm:w-44">
				<ContentCard
					id={item.id}
					name={item.name}
					slug={item.slug}
					{type}
					posterUrl={item.posterUrl}
					genres={item.genres}
					durationSeconds={item.durationSeconds}
					featured={item.featured}
				/>
			</div>
		{/each}
	</div>
</section>
{/if}
