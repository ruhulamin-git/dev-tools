<script lang="ts">
	import { Input, Button } from '$lib/shared/components/ui';

	interface Props {
		signatoryName: string;
		signatoryTitle: string;
		signatureImage: string | null;
	}

	let {
		signatoryName = $bindable(''),
		signatoryTitle = $bindable(''),
		signatureImage = $bindable(null as string | null)
	}: Props = $props();

	let fileInputElement: HTMLInputElement | undefined = $state();
	let errorMessage = $state('');

	const MAX_FILE_SIZE = 1 * 1024 * 1024;
	const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

	function handleUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		errorMessage = '';

		if (!ALLOWED_TYPES.includes(file.type)) {
			errorMessage = 'Only PNG, JPG, JPEG, and WebP are supported';
			target.value = '';
			return;
		}
		if (file.size > MAX_FILE_SIZE) {
			errorMessage = 'Signature image must be under 1MB';
			target.value = '';
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			signatureImage = e.target?.result as string;
		};
		reader.onerror = () => {
			errorMessage = 'Failed to read file';
			target.value = '';
		};
		reader.readAsDataURL(file);
	}

	function clearSignature() {
		signatureImage = null;
		if (fileInputElement) fileInputElement.value = '';
	}
</script>

<div class="space-y-3">
	<h2 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Signatory (optional)</h2>
	<div class="grid gap-3 sm:grid-cols-2">
		<div>
			<label for="signatory-name" class="mb-1 block text-xs font-medium text-slate-600"
				>Name</label
			>
			<Input
				id="signatory-name"
				bind:value={signatoryName}
				placeholder="Authorised signatory"
				class="border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
			/>
		</div>
		<div>
			<label for="signatory-title" class="mb-1 block text-xs font-medium text-slate-600"
				>Title</label
			>
			<Input
				id="signatory-title"
				bind:value={signatoryTitle}
				placeholder="e.g. Director"
				class="border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
			/>
		</div>
	</div>
	<div>
		<label for="signature-upload" class="mb-1 block text-xs font-medium text-slate-600"
			>Signature image</label
		>
		<div class="flex flex-wrap items-center gap-3">
			<input
				bind:this={fileInputElement}
				id="signature-upload"
				type="file"
				accept="image/png,image/jpeg,image/jpg,image/webp"
				class="text-sm text-slate-600"
				onchange={handleUpload}
			/>
			{#if signatureImage}
				<Button variant="outline" size="sm" onclick={clearSignature} class="text-xs">
					Remove
				</Button>
			{/if}
		</div>
		{#if errorMessage}
			<p class="mt-1 text-xs text-red-600">{errorMessage}</p>
		{/if}
		{#if signatureImage}
			<img
				src={signatureImage}
				alt="Signature preview"
				class="mt-2 h-16 max-w-[200px] object-contain"
			/>
		{/if}
	</div>
</div>
