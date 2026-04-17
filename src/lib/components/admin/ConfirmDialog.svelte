<!-- Reusable confirm dialog built on shadcn Dialog -->
<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';

	let {
		open = $bindable(false),
		title = 'Are you sure?',
		description = 'This action cannot be undone.',
		confirmLabel = 'Delete',
		pending = false,
		pendingLabel = 'Deleting...',
		onConfirm
	} = $props<{
		open?: boolean;
		title?: string;
		description?: string;
		confirmLabel?: string;
		pending?: boolean;
		pendingLabel?: string;
		onConfirm: () => void;
	}>();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-sm">
		<Dialog.Header>
			<div class="flex items-center gap-3 mb-1">
				<div class="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
					<AlertTriangle class="w-5 h-5 text-destructive" />
				</div>
				<Dialog.Title class="text-lg">{title}</Dialog.Title>
			</div>
			<Dialog.Description class="text-sm text-muted-foreground pl-13">
				{description}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="gap-2 mt-2">
			<Button variant="outline" onclick={() => (open = false)} disabled={pending}>Cancel</Button>
			<Button
				variant="destructive"
				onclick={onConfirm}
				disabled={pending}
			>
				{#if pending}
					<LoaderCircle class="w-4 h-4 animate-spin" />
					{pendingLabel}
				{:else}
					{confirmLabel}
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
