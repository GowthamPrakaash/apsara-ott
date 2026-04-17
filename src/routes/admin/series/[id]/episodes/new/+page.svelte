<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import FileUploader from '$lib/components/admin/FileUploader.svelte';
	import SubtitleTracksField from '$lib/components/admin/SubtitleTracksField.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	let { data, form } = $props();
	let submitting = $state(false);
</script>

<svelte:head><title>New Episode — {data.series.name} — Admin</title></svelte:head>

<div class="max-w-2xl space-y-6">
	<div class="flex items-center gap-3">
		<Button href="/admin/series/{data.series.id}/episodes" variant="ghost" size="icon" class="w-8 h-8">
			<ChevronLeft class="w-4 h-4" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold text-foreground">New Episode</h1>
			<p class="text-muted-foreground text-sm mt-0.5">{data.series.name}</p>
		</div>
	</div>

	{#if form?.error}
		<div class="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{form.error}</div>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ result }) => {
				await applyAction(result);
				if (result.type === 'failure' || result.type === 'error') {
					submitting = false;
				}
			};
		}}
		class="bg-card border border-border rounded-xl p-6 space-y-5"
	>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="md:col-span-2">
				<label for="name" class="block text-sm font-medium text-foreground mb-1.5">Episode Name *</label>
				<Input id="name" name="name" required placeholder="Episode title" />
			</div>

			<div>
				<label for="season" class="block text-sm font-medium text-foreground mb-1.5">Season</label>
				<Input id="season" name="season" type="number" min="1" value="1" placeholder="1" />
			</div>
			<div>
				<label for="episode" class="block text-sm font-medium text-foreground mb-1.5">Episode Number</label>
				<Input id="episode" name="episode" type="number" min="1" value="1" placeholder="1" />
			</div>

			<div class="md:col-span-2">
				<label for="description" class="block text-sm font-medium text-foreground mb-1.5">Description</label>
				<textarea id="description" name="description" placeholder="Episode description…"
					class="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
				></textarea>
			</div>

			<div>
				<label for="duration" class="block text-sm font-medium text-foreground mb-1.5">Duration (minutes)</label>
				<Input id="duration" name="duration" type="number" min="1" placeholder="45" />
			</div>
			<div>
				<label for="releaseDate" class="block text-sm font-medium text-foreground mb-1.5">Release Date</label>
				<Input id="releaseDate" name="releaseDate" type="date" />
			</div>

			<div>
				<label for="status" class="block text-sm font-medium text-foreground mb-1.5">Status</label>
				<select id="status" name="status" class="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
					<option value="draft">Draft</option>
					<option value="published">Published</option>
				</select>
			</div>

			<div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
				<FileUploader field="posterId" label="Thumbnail" type="poster" />
				<FileUploader field="videoId" label="Video File" type="video" />
			</div>
			<div class="md:col-span-2">
				<SubtitleTracksField />
			</div>
		</div>

		<div class="flex justify-end gap-3 pt-2 border-t border-border">
			<Button href="/admin/series/{data.series.id}/episodes" variant="outline" disabled={submitting}>Cancel</Button>
			<Button type="submit" disabled={submitting}>
				{#if submitting}
					<LoaderCircle class="w-4 h-4 animate-spin" />
					Creating...
				{:else}
					Create Episode
				{/if}
			</Button>
		</div>
	</form>
</div>
