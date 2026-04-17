<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Tags from '@lucide/svelte/icons/tags';

	let { data, form } = $props();
	let showForm = $state(false);
	let editingGenre = $state<{ id: string; name: string } | null>(null);
	let nameInput = $state('');

	// Delete confirm state
	let confirmOpen = $state(false);
	let deletingId = $state('');
	let deletingName = $state('');
	let deleting = $state(false);
	let saving = $state(false);
	let deleteFormEl: HTMLFormElement;

	function startEdit(genre: { id: string; name: string }) {
		editingGenre = genre;
		nameInput = genre.name;
		showForm = true;
	}
	function cancelForm() {
		showForm = false;
		editingGenre = null;
		nameInput = '';
	}
	function askDelete(genre: { id: string; name: string }) {
		deletingId = genre.id;
		deletingName = genre.name;
		confirmOpen = true;
	}
</script>

<svelte:head><title>Genres — Admin</title></svelte:head>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Delete genre?"
	description="Delete '{deletingName}'? This will remove it from all content."
	pending={deleting}
	onConfirm={() => {
		deleting = true;
		deleteFormEl?.requestSubmit();
	}}
/>

<!-- Hidden delete form -->
<form
	bind:this={deleteFormEl}
	method="POST"
	action="?/delete"
	use:enhance={() => {
		return async ({ result }) => {
			await applyAction(result);
			deleting = false;
			if (result.type === 'success') {
				confirmOpen = false;
			}
		};
	}}
	class="hidden"
>
	<input type="hidden" name="id" value={deletingId} />
</form>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Genres</h1>
			<p class="text-muted-foreground text-sm mt-0.5">{data.genres.length} genres</p>
		</div>
		<Button onclick={() => { cancelForm(); showForm = true; }} size="sm" class="gap-2">
			<Plus class="w-4 h-4" /> Add Genre
		</Button>
	</div>

	{#if form?.error}
		<div class="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">{form.error}</div>
	{/if}

	{#if showForm}
		<div class="bg-card border border-border rounded-xl p-5">
			<h2 class="font-semibold text-foreground mb-4">{editingGenre ? 'Edit Genre' : 'New Genre'}</h2>
			<form
				method="POST"
				action={editingGenre ? '?/update' : '?/create'}
				use:enhance={() => {
					saving = true;
					return async ({ result }) => {
						await applyAction(result);
						if (result.type === 'failure' || result.type === 'error') {
							saving = false;
							return;
						}
						saving = false;
						cancelForm();
					};
				}}
				class="flex gap-3"
			>
				{#if editingGenre}
					<input type="hidden" name="id" value={editingGenre.id} />
				{/if}
				<Input name="name" placeholder="Genre name (e.g. Action)" bind:value={nameInput} required class="flex-1" />
				<Button type="submit" size="sm" disabled={saving}>
					{#if saving}
						<LoaderCircle class="w-4 h-4 animate-spin" />
						{editingGenre ? 'Updating...' : 'Creating...'}
					{:else}
						{editingGenre ? 'Update' : 'Create'}
					{/if}
				</Button>
				<Button type="button" variant="outline" size="sm" onclick={cancelForm} disabled={saving}>Cancel</Button>
			</form>
		</div>
	{/if}

	<div class="bg-card border border-border rounded-xl overflow-hidden">
		{#if data.genres.length > 0}
			<table class="w-full text-sm">
				<thead class="bg-muted/50 border-b border-border">
					<tr>
						<th class="text-left px-4 py-3 text-muted-foreground font-medium">Name</th>
						<th class="text-left px-4 py-3 text-muted-foreground font-medium">Slug</th>
						<th class="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.genres as genre}
						<tr class="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
							<td class="px-4 py-3 font-medium text-foreground">{genre.name}</td>
							<td class="px-4 py-3">
								<Badge variant="secondary" class="font-mono text-xs">{genre.slug}</Badge>
							</td>
							<td class="px-4 py-3">
								<div class="flex justify-end gap-2">
									<button
										onclick={() => startEdit(genre)}
										class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
										title="Edit"
									>
										<Pencil class="w-4 h-4" />
									</button>
									<button
										onclick={() => askDelete(genre)}
										class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
										title="Delete"
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<Tags class="w-10 h-10 text-muted-foreground/40 mb-3" />
				<p class="font-medium text-foreground">No genres yet</p>
				<p class="text-muted-foreground text-sm">Add genres to categorize your content</p>
			</div>
		{/if}
	</div>
</div>
