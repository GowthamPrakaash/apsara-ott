<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import { SUBTITLE_LANGUAGES, SUBTITLE_LANGUAGE_LABELS, type SubtitleLanguage } from '$lib/subtitles';

	type Track = {
		language: SubtitleLanguage | string;
		fileId: string;
		fileName: string;
		isDefault: boolean;
		uploading?: boolean;
		error?: string;
	};

	let { existingTracks = [] } = $props<{ existingTracks?: Track[] }>();

	let tracks = $state<Track[]>(existingTracks.map((track: Track) => ({ ...track })));

	function labelFor(language: string) {
		return SUBTITLE_LANGUAGE_LABELS[language as SubtitleLanguage] ?? language;
	}

	function availableLanguages(currentLanguage: string) {
		const used = new Set(tracks.map((track) => track.language));
		used.delete(currentLanguage);
		return SUBTITLE_LANGUAGES.filter((language) => !used.has(language.value));
	}

	function addTrack() {
		const next = SUBTITLE_LANGUAGES.find((language) => !tracks.some((track) => track.language === language.value));
		if (!next) return;

		tracks = [
			...tracks,
			{ language: next.value, fileId: '', fileName: '', isDefault: tracks.length === 0 }
		];
	}

	function removeTrack(index: number) {
		tracks = tracks.filter((_, currentIndex) => currentIndex !== index);
		if (!tracks.some((track) => track.isDefault) && tracks.length > 0) {
			tracks = tracks.map((track, currentIndex) => ({
				...track,
				isDefault: currentIndex === 0
			}));
		}
	}

	function setDefault(index: number) {
		tracks = tracks.map((track, currentIndex) => ({
			...track,
			isDefault: currentIndex === index
		}));
	}

	async function handleFile(index: number, event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		tracks[index] = { ...tracks[index], uploading: true, error: '' };
		tracks = [...tracks];

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('type', 'subtitle');
			const response = await fetch('/api/upload', { method: 'POST', body: formData });
			const result = await response.json().catch(() => ({}));
			if (!response.ok) throw new Error(result.error ?? 'Upload failed');

			tracks[index] = {
				...tracks[index],
				fileId: result.id,
				fileName: file.name,
				uploading: false,
				error: ''
			};
			tracks = [...tracks];
		} catch (error) {
			tracks[index] = {
				...tracks[index],
				uploading: false,
				error: error instanceof Error ? error.message : 'Upload failed'
			};
			tracks = [...tracks];
		}
	}
</script>

<div class="space-y-3">
	<div class="flex items-center justify-between gap-3">
		<div>
			<p class="text-sm font-medium text-foreground">Subtitle Tracks</p>
			<p class="text-xs text-muted-foreground">
				Supported languages: {SUBTITLE_LANGUAGES.map((language) => language.label).join(', ')}
			</p>
		</div>
		<button
			type="button"
			onclick={addTrack}
			class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
			disabled={tracks.length >= SUBTITLE_LANGUAGES.length}
		>
			<Plus class="w-3.5 h-3.5" /> Add Track
		</button>
	</div>

	<div class="space-y-3">
		{#each tracks as track, index}
			<div class="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
				<div class="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
					<div class="grid gap-3 sm:grid-cols-2">
						<div>
							<label for={`subtitle-language-${index}`} class="block text-xs font-medium text-muted-foreground mb-1.5">Language</label>
							<select
								id={`subtitle-language-${index}`}
								bind:value={track.language}
								class="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground"
							>
								{#each SUBTITLE_LANGUAGES as language}
									<option
										value={language.value}
										disabled={language.value !== track.language && !availableLanguages(track.language).some((option) => option.value === language.value)}
									>
										{language.label}
									</option>
								{/each}
							</select>
						</div>
						<div class="flex items-end gap-3">
							<label class="flex items-center gap-2 text-sm text-foreground cursor-pointer">
								<input
									type="radio"
									name="defaultSubtitleTrack"
									checked={track.isDefault}
									onchange={() => setDefault(index)}
								/>
								Default track
							</label>
						</div>
					</div>

					<button
						type="button"
						onclick={() => removeTrack(index)}
						class="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-2 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
					>
						<Trash2 class="w-3.5 h-3.5" /> Remove
					</button>
				</div>

				{#if track.fileId}
					<div class="flex items-center gap-2.5 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
						<CheckCircle class="w-4 h-4 text-green-500 shrink-0" />
						<span class="flex-1 truncate text-xs text-foreground">{track.fileName}</span>
					</div>
				{:else}
					<label class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-border bg-card p-3 transition-colors hover:border-primary/50">
						{#if track.uploading}
							<div class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
							<span class="text-xs text-muted-foreground">Uploading subtitle...</span>
						{:else}
							<Upload class="w-4 h-4 text-muted-foreground shrink-0" />
							<span class="text-xs text-muted-foreground">Upload {labelFor(track.language)} subtitle</span>
						{/if}
						<input
							type="file"
							class="hidden"
							accept=".vtt,.srt"
							onchange={(event) => handleFile(index, event)}
							disabled={track.uploading}
						/>
					</label>
				{/if}

				{#if track.error}
					<p class="text-xs text-destructive">{track.error}</p>
				{/if}

				<input type="hidden" name="subtitleTrackLanguage" value={track.language} />
				<input type="hidden" name="subtitleTrackFileId" value={track.fileId} />
				{#if track.isDefault}
					<input type="hidden" name="defaultSubtitleLanguage" value={track.language} />
				{/if}
			</div>
		{/each}
	</div>
</div>
