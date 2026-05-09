<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';
	import { navigating } from '$app/stores';

	let { children, data } = $props();

	// Track progress bar animation
	let progress = $state(0);
	let visible = $state(false);
	let animFrame: number;
	let growInterval: ReturnType<typeof setInterval>;

	$effect(() => {
		if ($navigating) {
			// Navigation started — show bar and grow quickly to ~80%
			visible = true;
			progress = 0;
			clearInterval(growInterval);
			cancelAnimationFrame(animFrame);

			// Jump to 20% immediately, then slow-grow to keep suspense
			setTimeout(() => { progress = 20; }, 10);
			growInterval = setInterval(() => {
				if (progress < 80) {
					// Ease out: grow faster at start, slower near 80
					progress += (80 - progress) * 0.08;
				}
			}, 60);
		} else {
			// Navigation complete — snap to 100% then fade out
			clearInterval(growInterval);
			progress = 100;
			setTimeout(() => {
				visible = false;
				progress = 0;
			}, 300);
		}
	});
</script>

<!-- Navigation progress bar -->
{#if visible}
	<div
		class="nav-progress-bar"
		style="width: {progress}%; opacity: {progress === 100 ? 0 : 1};"
	></div>
{/if}

<ModeWatcher defaultMode="dark" />
<Toaster richColors theme="dark" />
{@render children()}

<style>
	.nav-progress-bar {
		position: fixed;
		top: 0;
		left: 0;
		height: 2.5px;
		z-index: 9999;
		background: linear-gradient(90deg, hsl(var(--primary, 262 80% 65%)), hsl(var(--primary, 262 80% 65%) / 0.7));
		box-shadow: 0 0 8px hsl(var(--primary, 262 80% 65%) / 0.6);
		transition: width 0.2s ease-out, opacity 0.25s ease;
		border-radius: 0 2px 2px 0;
		pointer-events: none;
	}
</style>
