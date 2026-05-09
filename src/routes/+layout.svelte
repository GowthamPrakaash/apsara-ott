<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	import { navigating } from '$app/stores';

	let { children } = $props();
</script>

<!-- Navigation loading bar — shown while SvelteKit fetches the next page -->
{#if $navigating}
	<div class="nav-loader-track" aria-hidden="true">
		<div class="nav-loader-bar"></div>
	</div>
{/if}

<ModeWatcher defaultMode="dark" />
<Toaster richColors theme="dark" />
{@render children()}

<style>
	.nav-loader-track {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		z-index: 99999;
		background: oklch(1 0 0 / 8%);
		pointer-events: none;
	}

	.nav-loader-bar {
		height: 100%;
		width: 40%;
		background: linear-gradient(
			90deg,
			transparent,
			oklch(0.627 0.265 303.9),
			oklch(0.488 0.243 264.376),
			oklch(0.627 0.265 303.9),
			transparent
		);
		border-radius: 0 2px 2px 0;
		animation: nav-slide 1.2s ease-in-out infinite;
	}

	@keyframes nav-slide {
		0%   { transform: translateX(-100%); }
		100% { transform: translateX(350%); }
	}
</style>
