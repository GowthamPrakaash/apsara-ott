<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Tv from '@lucide/svelte/icons/tv';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';

	let { data } = $props();
	let confirmOpen = $state(false);
	let deletingId = $state('');
	let deletingName = $state('');
	let deleting = $state(false);
	let deleteFormEl: HTMLFormElement;

	function askDelete(ep: { id: string; name: string }) {
		deletingId = ep.id;
		deletingName = ep.name;
		confirmOpen = true;
	}
</script>

<svelte:head><title>{data.series.name} Episodes — Admin</title></svelte:head>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Delete episode?"
	description="Delete '{deletingName}'? This cannot be undone."
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
	<div class="flex items-center gap-3">
		<Button href="/admin/series" variant="ghost" size="icon" class="w-8 h-8">
			<ChevronLeft class="w-4 h-4" />
		</Button>
		<div class="flex-1">
			<h1 class="text-2xl font-bold text-foreground">{data.series.name}</h1>
			<p class="text-muted-foreground text-sm mt-0.5">{data.episodes.length} episodes</p>
		</div>
		<Button href="/admin/series/{data.series.id}/episodes/new" size="sm" class="gap-2">
			<Plus class="w-4 h-4" /> Add Episode
		</Button>
	</div>

	<div class="bg-card border border-border rounded-xl overflow-hidden">
		{#if data.episodes.length > 0}
			<div class="divide-y divide-border">
				{#each data.seasons as seasonNumber}
					<section>
						<div class="bg-muted/40 border-b border-border px-4 py-3">
							<h2 class="text-sm font-semibold text-foreground">Season {seasonNumber}</h2>
						</div>
						<table class="w-full text-sm">
							<thead class="bg-muted/20 border-b border-border">
								<tr>
									<th class="text-left px-4 py-3 text-muted-foreground font-medium w-20">S/E</th>
									<th class="text-left px-4 py-3 text-muted-foreground font-medium">Episode</th>
									<th class="text-left px-4 py-3 text-muted-foreground font-medium">Duration</th>
									<th class="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
									<th class="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each data.episodes.filter((episode) => episode.seasonNumber === seasonNumber) as ep}
									<tr class="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
										<td class="px-4 py-3">
											<Badge variant="outline" class="font-mono text-xs">S{ep.seasonNumber}E{ep.episodeNumber}</Badge>
										</td>
										<td class="px-4 py-3">
											<div class="flex items-center gap-3">
												<div class="w-12 h-8 rounded bg-muted overflow-hidden shrink-0">
													{#if ep.posterUrl}
														<img src={ep.posterUrl} alt="" class="w-full h-full object-cover" />
													{:else}
														<div class="w-full h-full flex items-center justify-center">
															<Tv class="w-3 h-3 text-muted-foreground/40" />
														</div>
													{/if}
												</div>
												<p class="font-medium text-foreground">{ep.name}</p>
											</div>
										</td>
										<td class="px-4 py-3 text-muted-foreground">
											{ep.durationSeconds ? `${Math.floor(ep.durationSeconds / 60)}min` : '—'}
										</td>
										<td class="px-4 py-3">
											<Badge class="{ep.status === 'published' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-muted text-muted-foreground'}">{ep.status}</Badge>
										</td>
										<td class="px-4 py-3">
											<div class="flex justify-end gap-1">
												<Button href="/admin/series/{data.series.id}/episodes/{ep.id}/edit" variant="ghost" size="icon" class="w-8 h-8">
													<Pencil class="w-4 h-4" />
												</Button>
												<button
													onclick={() => askDelete(ep)}
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
					</section>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col items-center justify-center py-16 text-center">
				<Tv class="w-10 h-10 text-muted-foreground/40 mb-3" />
				<p class="font-medium text-foreground">No episodes yet</p>
				<p class="text-muted-foreground text-sm mt-1">
					<Button href="/admin/series/{data.series.id}/episodes/new" variant="link" class="h-auto p-0">Add the first episode</Button>
				</p>
			</div>
		{/if}
	</div>
</div>
