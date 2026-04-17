<script lang="ts">
	import Navbar from "$lib/components/shared/Navbar.svelte";
	import Footer from "$lib/components/shared/Footer.svelte";

	let { data, children } = $props();
</script>

<div class="min-h-screen flex flex-col bg-background">
	<Navbar session={data.session ?? undefined} />
	<main
		class="flex-1 pt-16 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-2"
	>
		{@render children()}
	</main>
	<Footer />
</div>
