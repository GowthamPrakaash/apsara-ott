<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-sonner';

	let { children, data } = $props();
</script>

<ModeWatcher defaultMode="dark" />
<Toaster richColors theme="dark" />
{@render children()}
