<!-- Shared file uploader for admin forms -->
<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';
	import X from '@lucide/svelte/icons/x';
	import CheckCircle from '@lucide/svelte/icons/check-circle';

	let {
		field,
		label,
		type,
		existingId = '',
		onUploaded
	} = $props<{
		field: string;
		label: string;
		type: 'poster' | 'video' | 'subtitle';
		existingId?: string;
		onUploaded?: (id: string) => void;
	}>();

	let uploading = $state(false);
	let fileId = $state('');
	let fileName = $state('');
	let error = $state('');

	const accept = $derived(type === 'poster' ? 'image/*' : type === 'video' ? 'video/*' : '.vtt,.srt');

	$effect(() => {
		if (existingId && !fileId) {
			fileId = existingId;
			fileName = 'Existing file';
		}
	});

	async function handleFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		uploading = true;
		error = '';
		try {
			const fd = new FormData();
			fd.append('file', file);
			fd.append('type', type);
			const res = await fetch('/api/upload', { method: 'POST', body: fd });
			if (!res.ok) throw new Error(await res.text());
			const data = await res.json();
			fileId = data.id;
			fileName = file.name;
			onUploaded?.(data.id);
		} catch (err: any) {
			error = err.message ?? 'Upload failed';
		} finally {
			uploading = false;
		}
	}

	function clear() {
		fileId = '';
		fileName = '';
	}
</script>

<div>
	<label class="block text-sm font-medium text-foreground mb-1.5">{label}</label>
	<input type="hidden" name={field} value={fileId} />

	{#if fileId}
		<div class="flex items-center gap-2.5 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
			<CheckCircle class="w-4 h-4 text-green-500 shrink-0" />
			<span class="flex-1 text-xs text-foreground truncate">{fileName}</span>
			<button type="button" onclick={clear} class="text-muted-foreground hover:text-destructive transition-colors" title="Remove">
				<X class="w-3.5 h-3.5" />
			</button>
		</div>
	{:else}
		<label class="flex items-center gap-2.5 p-3 rounded-lg border border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-muted/20 group">
			{#if uploading}
				<div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
				<span class="text-xs text-muted-foreground">Uploading…</span>
			{:else}
				<Upload class="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
				<span class="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
					Click to upload {label.toLowerCase()}
				</span>
			{/if}
			<input type="file" class="hidden" {accept} onchange={handleFile} disabled={uploading} />
		</label>
		{#if error}
			<p class="text-xs text-destructive mt-1">{error}</p>
		{/if}
	{/if}
</div>
