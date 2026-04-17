<script lang="ts">
	import SeriesWatchView from '$lib/components/ott/SeriesWatchView.svelte';

	let { data } = $props();
</script>

<SeriesWatchView {data} />
