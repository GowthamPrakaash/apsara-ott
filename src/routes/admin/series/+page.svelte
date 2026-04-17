<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Tv from '@lucide/svelte/icons/tv';
	import List from '@lucide/svelte/icons/list';

	let { data } = $props();
	let confirmOpen = $state(false);
	let deletingId = $state('');
	let deletingName = $state('');
	let deleting = $state(false);
	let deleteFormEl: HTMLFormElement;

	function askDelete(s: { id: string; name: string }) {
		deletingId = s.id;
		deletingName = s.name;
		confirmOpen = true;
	}
</script>

<svelte:head><title>Series — Admin</title></svelte:head>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Delete series?"
	description="Delete '{deletingName}' and all its episodes? This cannot be undone."
	pending={deleting}
	onConfirm={() => {
		deleting = true;
		deleteFormEl?.requestSubmit();
	}}
/>
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
			<h1 class="text-2xl font-bold text-foreground">Series</h1>
			<p class="text-muted-foreground text-sm mt-0.5">{data.series.length} series</p>
		</div>
		<Button href="/admin/series/new" size="sm" class="gap-2">
			<Plus class="w-4 h-4" /> Add Series
		</Button>
	</div>

	<div class="bg-card border border-border rounded-xl overflow-hidden">
		{#if data.series.length > 0}
			<table class="w-full text-sm">
				<thead class="bg-muted/50 border-b border-border">
					<tr>
						<th class="text-left px-4 py-3 text-muted-foreground font-medium">Series</th>
						<th class="text-left px-4 py-3 text-muted-foreground font-medium">Genres</th>
						<th class="text-left px-4 py-3 text-muted-foreground font-medium">Episodes</th>
						<th class="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
						<th class="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.series as s}
						<tr class="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
							<td class="px-4 py-3">
								<div class="flex items-center gap-3">
									<div class="w-10 h-14 rounded bg-muted overflow-hidden shrink-0">
										{#if s.posterUrl}
											<img src={s.posterUrl} alt="" class="w-full h-full object-cover" />
										{:else}
											<div class="w-full h-full flex items-center justify-center">
												<Tv class="w-4 h-4 text-muted-foreground/40" />
											</div>
										{/if}
									</div>
									<p class="font-medium text-foreground">{s.name}</p>
								</div>
							</td>
							<td class="px-4 py-3">
								<div class="flex flex-wrap gap-1">
									{#each s.genreNames.slice(0, 3) as name}
										<Badge variant="secondary" class="text-xs">{name}</Badge>
									{/each}
								</div>
							</td>
							<td class="px-4 py-3">
								<Button href="/admin/series/{s.id}/episodes" variant="ghost" size="sm" class="gap-1.5 h-7 text-xs">
									<List class="w-3 h-3" /> {s.episodeCount} episodes
								</Button>
							</td>
							<td class="px-4 py-3">
								<Badge class="{s.status === 'published' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-muted text-muted-foreground'}">{s.status}</Badge>
							</td>
							<td class="px-4 py-3">
								<div class="flex justify-end gap-1">
									<Button href="/admin/series/{s.id}/edit" variant="ghost" size="icon" class="w-8 h-8">
										<Pencil class="w-4 h-4" />
									</Button>
									<button
										onclick={() => askDelete(s)}
										class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
				<Tv class="w-10 h-10 text-muted-foreground/40 mb-3" />
				<p class="font-medium text-foreground">No series yet</p>
				<p class="text-muted-foreground text-sm mt-1">
					<Button href="/admin/series/new" variant="link" class="h-auto p-0">Add your first series</Button>
				</p>
			</div>
		{/if}
	</div>
</div>
