<script lang="ts">
	import { formatFileSize } from '../utils/compressor';
	import { Info } from '@lucide/svelte';

	const { originalFile, compressedResult } = $props<{
		originalFile: File;
		compressedResult: {
			blob: Blob;
			url: string;
			originalSize: number;
			compressedSize: number;
			compressionRatio: number;
		};
	}>();

	let originalUrl = $state('');
	let sliderPosition = $state(50);
	let isDragging = $state(false);
	let container = $state<HTMLElement>();
	let beforeImage = $state<HTMLImageElement>();
	let afterImage = $state<HTMLImageElement>();

	$effect(() => {
		// Create new object URL when originalFile changes
		const url = URL.createObjectURL(originalFile);
		originalUrl = url;

		// Preload images
		const img1 = new Image();
		const img2 = new Image();
		img1.src = url;
		img2.src = compressedResult.url;

		return () => {
			URL.revokeObjectURL(url);
		};
	});

	function startDrag(e: MouseEvent | TouchEvent) {
		e.preventDefault();
		isDragging = true;
		document.addEventListener('mousemove', handleDrag);
		document.addEventListener('mouseup', stopDrag);
		document.addEventListener('touchmove', handleDrag, { passive: false });
		document.addEventListener('touchend', stopDrag);
	}

	function handleDrag(e: MouseEvent | TouchEvent) {
		if (!isDragging || !container) return;

		e.preventDefault();
		const rect = container.getBoundingClientRect();
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		let pos = ((clientX - rect.left) / rect.width) * 100;

		pos = Math.min(100, Math.max(0, pos));
		sliderPosition = pos;
	}

	function stopDrag() {
		isDragging = false;
		document.removeEventListener('mousemove', handleDrag);
		document.removeEventListener('mouseup', stopDrag);
		document.removeEventListener('touchmove', handleDrag);
		document.removeEventListener('touchend', stopDrag);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			sliderPosition = Math.max(0, sliderPosition - 1);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			sliderPosition = Math.min(100, sliderPosition + 1);
		}
	}

	// Calculate savings
	let savings = $derived(
		((originalFile.size - compressedResult.compressedSize) / originalFile.size) * 100
	);
</script>

<div class="relative h-full w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
	<div class="absolute inset-0 flex items-center justify-center text-slate-400">
		<div class="p-4 text-center">
			<Info class="mx-auto mb-2 h-8 w-8" />
			<p class="text-sm">Drag the slider to compare</p>
		</div>
	</div>

	<div
		class="relative h-full w-full"
		bind:this={container}
		onkeydown={handleKeyDown}
		tabindex="0"
		role="slider"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={sliderPosition}
		aria-valuetext={`${Math.round(sliderPosition)}%`}
	>
		<!-- Original (Before) Image -->
		<div class="absolute inset-0 overflow-hidden">
			{#if originalUrl}
				<img
					src={originalUrl}
					alt="Original image"
					class="h-full w-full object-contain"
					style="max-height: 70vh;"
					bind:this={beforeImage}
				/>
			{/if}
		</div>

		<!-- Compressed (After) Image -->
		<div
			class="absolute inset-0 overflow-hidden"
			style={`clip-path: inset(0 0 0 ${sliderPosition}%);`}
		>
			{#if compressedResult?.url}
				<img
					src={compressedResult.url}
					alt="Compressed image"
					class="h-full w-full object-contain"
					style="max-height: 70vh;"
					bind:this={afterImage}
				/>
			{/if}
		</div>

		<!-- Slider Control -->
		<div
			class="absolute top-0 bottom-0 w-1 cursor-ew-resize bg-blue-500"
			style={`left: ${sliderPosition}%;`}
			onmousedown={startDrag}
			ontouchstart={startDrag}
		>
			<div
				class="absolute top-1/2 -left-3 flex h-12 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-blue-500 text-white shadow-md"
			>
				<div class="mx-0.5 h-4 w-1 rounded-full bg-white"></div>
				<div class="mx-0.5 h-4 w-1 rounded-full bg-white"></div>
			</div>
		</div>

		<!-- Size Comparison Badges -->
		<div class="pointer-events-none absolute bottom-4 left-4 flex flex-col space-y-2 select-none">
			<div
				class="rounded-full bg-slate-900/80 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
			>
				Original: {formatFileSize(originalFile.size)}
			</div>
			<div
				class="rounded-full bg-slate-900/90 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
			>
				Compressed: {formatFileSize(compressedResult.compressedSize)}
				<span class="ml-1 text-blue-100">
					({savings > 0 ? '-' : ''}{Math.abs(Math.round(savings))}%)
				</span>
			</div>
		</div>
	</div>
</div>

<style>
	[role='slider']:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>
