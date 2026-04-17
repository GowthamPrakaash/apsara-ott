<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import { defineCustomElements } from 'vidstack/elements';
	import 'vidstack/styles/base.css';
	import 'vidstack/styles/defaults.css';
	import 'vidstack/styles/community-skin/video.css';
	import { SUBTITLE_LANGUAGE_LABELS } from '$lib/subtitles';

	type SubtitleTrack = {
		src: string;
		srclang: string;
		label: string;
		default?: boolean;
	};

	let {
		src,
		poster = null,
		subtitles = [],
		title = 'Video player'
	} = $props<{
		src: string;
		poster?: string | null;
		subtitles?: SubtitleTrack[];
		title?: string;
	}>();

	let playerEl = $state<HTMLElement | null>(null);
	const dispatch = createEventDispatcher<{ play: void }>();

	function labelFor(language: string) {
		return SUBTITLE_LANGUAGE_LABELS[language as keyof typeof SUBTITLE_LANGUAGE_LABELS] ?? language;
	}

	onMount(async () => {
		await defineCustomElements();
	});

	$effect(() => {
		if (!playerEl) return;

		const handlePlay = () => {
			dispatch('play');
		};

		playerEl.addEventListener('play', handlePlay);
		return () => {
			playerEl?.removeEventListener('play', handlePlay);
		};
	});
</script>

<div>
	<media-player
		bind:this={playerEl}
		src={src}
		title={title}
		poster={poster ?? undefined}
		load="visible"
		preload="metadata"
		crossorigin="anonymous"
		playsinline
		aspect-ratio="16/9"
		class="block w-full overflow-hidden rounded-2xl bg-black text-white shadow-2xl"
	>
		<media-outlet>
			{#each subtitles as track}
				<track
					kind="subtitles"
					src={track.src}
					label={track.label || labelFor(track.srclang)}
					srclang={track.srclang}
					default={track.default}
					data-type={track.src.toLowerCase().endsWith('.srt') ? 'srt' : 'vtt'}
				/>
			{/each}
		</media-outlet>
		<media-community-skin></media-community-skin>
	</media-player>
</div>
