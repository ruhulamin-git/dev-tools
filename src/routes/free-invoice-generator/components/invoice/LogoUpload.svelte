<script lang="ts">
	interface Props {
		logo: string | null;
		accentColor?: string;
		onLogoChange?: (logo: string | null) => void;
	}

	let { logo = $bindable(), accentColor = '#3b82f6', onLogoChange }: Props = $props();
	let fileInputElement: HTMLInputElement;
	let errorMessage = $state('');

	const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
	const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

	function handleLogoUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Reset error message
		errorMessage = '';

		// Check file type
		if (!ALLOWED_TYPES.includes(file.type)) {
			errorMessage = 'Only PNG, JPG, JPEG, and WebP formats are supported';
			target.value = ''; // Reset input
			return;
		}

		// Check file size
		if (file.size > MAX_FILE_SIZE) {
			errorMessage = 'File size must be less than 2MB';
			target.value = ''; // Reset input
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const dataUrl = e.target?.result as string;

			const img = new Image();
			img.onload = () => {
				const MAX_WIDTH = 500;
				const MAX_HEIGHT = 500;
				let width = img.width;
				let height = img.height;

				if (width > MAX_WIDTH || height > MAX_HEIGHT) {
					const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
					width = Math.round(width * ratio);
					height = Math.round(height * ratio);
				} else {
					logo = dataUrl;
					onLogoChange?.(logo);
					return;
				}

				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');

				if (ctx) {
					ctx.drawImage(img, 0, 0, width, height);
					// Fallback to png if original type was webp (since we need support in jsPDF)
					const outType = file.type === 'image/webp' ? 'image/png' : file.type;
					logo = canvas.toDataURL(outType);
					onLogoChange?.(logo);
				} else {
					logo = dataUrl;
					onLogoChange?.(logo);
				}
			};
			img.src = dataUrl;
		};
		reader.onerror = () => {
			errorMessage = 'Failed to read file';
			target.value = ''; // Reset input
		};
		reader.readAsDataURL(file);
	}

	function removeLogo() {
		logo = null;
		onLogoChange?.(null);
		errorMessage = '';
		// Reset the file input to allow re-uploading the same file
		if (fileInputElement) {
			fileInputElement.value = '';
		}
	}
</script>

<div class="shrink-0">
	<label
		class="flex h-28 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
		style="border-color: {accentColor};"
	>
		{#if logo}
			<div class="relative h-full w-full">
				<img src={logo} alt="Company Logo" class="h-full w-full object-contain p-2" />
				<button
					type="button"
					onclick={removeLogo}
					class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white transition-colors hover:bg-red-600"
					aria-label="Remove logo"
				>
					×
				</button>
			</div>
		{:else}
			<div class="text-center text-slate-600 dark:text-slate-300">
				<span class="text-2xl">+</span>
				<p class="mt-1 text-sm">Upload your logo</p>
			</div>
		{/if}
		<input
			bind:this={fileInputElement}
			type="file"
			accept="image/png,image/jpeg,image/jpg,image/webp"
			class="hidden"
			onchange={handleLogoUpload}
		/>
	</label>
	{#if errorMessage}
		<p class="mt-2 text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
	{/if}
</div>
