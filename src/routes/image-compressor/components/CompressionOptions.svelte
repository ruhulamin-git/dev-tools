<script lang="ts">
	import { Loader2, X } from '@lucide/svelte';
	import { compressImages } from '../utils/compressor';
	import type {
		CompressionOptions as CompressionOptionsType,
		CompressionResult
	} from '../utils/compressor';
	import Input from '$lib/shared/components/ui/input.svelte';
	import Select from '$lib/shared/components/ui/select.svelte';
	import Label from '$lib/shared/components/ui/label.svelte';
	import Button from '$lib/shared/components/ui/button.svelte';
	import Checkbox from '$lib/shared/components/ui/checkbox.svelte';

	const {
		loading = false,
		quality = 80,
		format = 'image/jpeg',
		maxWidth = 0,
		maxHeight = 0,
		preserveExif = false,
		files = [],
		onQualityChange = (value: number) => {},
		onFormatChange = (value: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif') => {},
		onMaxWidthChange = (value: number) => {},
		onMaxHeightChange = (value: number) => {},
		onPreserveExifChange = (value: boolean) => {},
		onCompress = async (options: CompressionOptionsType) => [],
		onError = (message: string) => {},
		onResults = (results: Array<CompressionResult & { file: File }>) => {},
		onReset = () => {}
	} = $props<{
		loading?: boolean;
		quality?: number;
		format?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
		maxWidth?: number;
		maxHeight?: number;
		preserveExif?: boolean;
		files?: File[];
		onQualityChange?: (value: number) => void;
		onFormatChange?: (value: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif') => void;
		onMaxWidthChange?: (value: number) => void;
		onMaxHeightChange?: (value: number) => void;
		onPreserveExifChange?: (value: boolean) => void;
		onCompress?: (
			options: CompressionOptionsType
		) => Promise<Array<CompressionResult & { file: File }>>;
		onError?: (message: string) => void;
		onResults?: (results: Array<CompressionResult & { file: File }>) => void;
		onReset?: () => void;
	}>();

	async function handleCompress() {
		if (files.length === 0) return;

		try {
			const compressionResults = await onCompress({
				quality,
				maxWidth,
				maxHeight,
				format,
				preserveExif
			});

			const results = compressionResults.map((result: CompressionResult, i: number) => ({
				...result,
				file: files[i]
			}));

			onResults(results);
		} catch (e) {
			const errorMessage = e instanceof Error ? e.message : 'Failed to compress images';
			onError(errorMessage);
		}
	}

	const formatOptions = [
		{ value: 'image/jpeg', label: 'JPEG' },
		{ value: 'image/png', label: 'PNG' },
		{ value: 'image/webp', label: 'WebP' },
		{ value: 'image/gif', label: 'GIF' }
	];
</script>

<div class="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
	<div class="flex flex-col gap-1.5">
		<Label htmlFor="quality" class="text-slate-700 dark:text-slate-300">
			Quality: {quality}%
		</Label>
		<input
			id="quality"
			type="range"
			min="1"
			max="100"
			value={quality}
			oninput={(e) => onQualityChange(Number((e.target as HTMLInputElement).value))}
			disabled={loading}
			class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-slate-600"
			aria-valuemin="1"
			aria-valuemax="100"
			aria-valuenow={quality}
		/>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="flex flex-col gap-1.5">
			<Label htmlFor="format" class="text-slate-700 dark:text-slate-300">Format</Label>
			<Select
				id="format"
				value={format}
				options={formatOptions}
				onchange={(v) => onFormatChange(v as any)}
				disabled={loading}
				class="w-full bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
			/>
		</div>

		<div class="flex flex-col gap-1.5">
			<Label htmlFor="maxWidth" class="text-slate-700 dark:text-slate-300">Max Width (px)</Label>
			<Input
				id="maxWidth"
				type="number"
				min="1"
				value={maxWidth || ''}
				oninput={(e) => onMaxWidthChange(Number((e.target as HTMLInputElement).value))}
				disabled={loading}
				class="w-full bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
			/>
		</div>

		<div class="flex flex-col gap-1.5">
			<Label htmlFor="maxHeight" class="text-slate-700 dark:text-slate-300">Max Height (px)</Label>
			<Input
				id="maxHeight"
				type="number"
				min="1"
				value={maxHeight || ''}
				oninput={(e) => onMaxHeightChange(Number((e.target as HTMLInputElement).value))}
				disabled={loading}
				class="w-full bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
			/>
		</div>

		<div class="flex items-center gap-2">
			<Checkbox
				id="preserveExif"
				checked={preserveExif}
				onchange={(e) => onPreserveExifChange((e.target as HTMLInputElement).checked)}
				disabled={loading}
				class="dark:border-slate-600 dark:bg-slate-700"
			/>
			<Label htmlFor="preserveExif" class="font-medium text-slate-700 dark:text-slate-300">
				Preserve EXIF data
			</Label>
		</div>
	</div>

	<div class="flex space-x-3 pt-2">
		<Button
			onclick={handleCompress}
			disabled={loading || files.length === 0}
			class="flex-1 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
			aria-busy={loading}
			aria-label={files.length > 1 ? `Compress ${files.length} images` : 'Compress image'}
		>
			{#if loading}
				<Loader2 class="mr-2 inline h-5 w-5 animate-spin text-white" />
				Compressing...
			{:else}
				Compress {files.length > 1 ? `${files.length} Images` : 'Image'}
			{/if}
		</Button>
		<Button
			variant="outline"
			onclick={onReset}
			disabled={loading}
			class="flex items-center bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
			aria-label="Reset form"
		>
			<X class="mr-1 h-4 w-4" /> Reset
		</Button>
	</div>
</div>
