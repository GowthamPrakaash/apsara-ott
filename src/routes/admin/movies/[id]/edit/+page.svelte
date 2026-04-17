<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import FileUploader from '$lib/components/admin/FileUploader.svelte';
	import SubtitleTracksField from '$lib/components/admin/SubtitleTracksField.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	let { data, form } = $props();
	const m = $derived(data.movie);
	let submitting = $state(false);
</script>

<svelte:head><title>Edit {data.movie.name} — Admin</title></svelte:head>

<div class="max-w-2xl space-y-6">
	<div class="flex items-center gap-3">
		<Button href="/admin/movies" variant="ghost" size="icon" class="w-8 h-8">
			<ChevronLeft class="w-4 h-4" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold text-foreground">Edit Movie</h1>
			<p class="text-muted-foreground text-sm mt-0.5">{data.movie.name}</p>
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
				<label for="name" class="block text-sm font-medium text-foreground mb-1.5">Name *</label>
				<Input id="name" name="name" required value={m.name} placeholder="Movie title" />
			</div>

			<div class="md:col-span-2">
				<label for="description" class="block text-sm font-medium text-foreground mb-1.5">Description</label>
				<textarea id="description" name="description" placeholder="Movie description…"
					class="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground resize-y min-h-[90px] focus:outline-none focus:ring-2 focus:ring-ring"
				>{m.description ?? ''}</textarea>
			</div>

			<div>
				<label for="duration" class="block text-sm font-medium text-foreground mb-1.5">Duration (minutes)</label>
				<Input id="duration" name="duration" type="number" min="1" value={m.durationSeconds ? Math.floor(m.durationSeconds / 60) : ''} placeholder="120" />
			</div>

			<div>
				<label for="releaseDate" class="block text-sm font-medium text-foreground mb-1.5">Release Date</label>
				<Input id="releaseDate" name="releaseDate" type="date" value={m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : ''} />
			</div>

			<div>
				<label for="status" class="block text-sm font-medium text-foreground mb-1.5">Status</label>
				<select id="status" name="status" class="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
					<option value="draft" selected={m.status !== 'published'}>Draft</option>
					<option value="published" selected={m.status === 'published'}>Published</option>
				</select>
			</div>

			<div class="flex items-center gap-5 pt-5">
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="featured" class="rounded" checked={m.featured} />
					<span class="text-sm text-foreground">Featured</span>
				</label>
				<label class="flex items-center gap-2 cursor-pointer">
					<input type="checkbox" name="trending" class="rounded" checked={m.trending} />
					<span class="text-sm text-foreground">Trending</span>
				</label>
			</div>

			<!-- Genres -->
			<div class="md:col-span-2">
				<p class="text-sm font-medium text-foreground mb-2">Genres</p>
				<div class="flex flex-wrap gap-2">
					{#each data.genres as genre}
						<label class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted cursor-pointer hover:bg-muted/70 transition-colors">
							<input type="checkbox" name="genreIds" value={genre.id} checked={m.selectedGenreIds.includes(genre.id)} />
							<span class="text-xs text-foreground">{genre.name}</span>
						</label>
					{/each}
				</div>
			</div>

			<!-- File Uploads -->
			<div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
				<FileUploader field="posterId" label="Poster Image" type="poster" existingId={m.posterId ?? ''} />
				<FileUploader field="videoId" label="Video File" type="video" existingId={m.videoId ?? ''} />
			</div>
			<div class="md:col-span-2">
				<SubtitleTracksField existingTracks={m.subtitleTracks} />
			</div>
		</div>

		<div class="flex justify-end gap-3 pt-2 border-t border-border">
			<Button href="/admin/movies" variant="outline" disabled={submitting}>Cancel</Button>
			<Button type="submit" disabled={submitting}>
				{#if submitting}
					<LoaderCircle class="w-4 h-4 animate-spin" />
					Saving...
				{:else}
					Save Changes
				{/if}
			</Button>
		</div>
	</form>
</div>
