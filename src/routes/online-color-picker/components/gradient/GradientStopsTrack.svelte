<script lang="ts">
	interface GradientStop {
		color: string;
		position: number;
	}

	interface Props {
		stops: GradientStop[];
		selectedStopIndex: number;
		onAddStop: () => void;
		onSelectStop: (index: number) => void;
		onUpdateStopPosition: (index: number, position: number) => void;
	}

	let { stops, selectedStopIndex, onAddStop, onSelectStop, onUpdateStopPosition }: Props = $props();

	let isDragging = $state(false);
	let draggedStopIndex = $state(-1);
	let trackRef = $state<HTMLDivElement | null>(null);

	function handleStopMouseDown(index: number, e: MouseEvent) {
		e.stopPropagation();
		isDragging = true;
		draggedStopIndex = index;
		onSelectStop(index);
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || draggedStopIndex === -1 || !trackRef) return;

		const rect = trackRef.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

		onUpdateStopPosition(draggedStopIndex, Math.round(percentage));
	}

	function handleMouseUp() {
		isDragging = false;
		draggedStopIndex = -1;
	}

	// Add global event listeners for drag
	$effect(() => {
		if (isDragging) {
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
				window.removeEventListener('mouseup', handleMouseUp);
			};
		}
	});
</script>

<div class="flex flex-col gap-2">
	<div class="mb-2 flex items-end justify-between">
		<label class="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
			Gradient Stops
		</label>
		<span class="text-xs text-slate-400 dark:text-slate-500">Click track to add stop</span>
	</div>
	<div class="relative h-10 select-none" bind:this={trackRef}>
		<!-- Track Background -->
		<div
			class="absolute top-1/2 right-0 left-0 h-4 -translate-y-1/2 cursor-crosshair overflow-hidden rounded-full ring-1 ring-black/5"
			style="background: linear-gradient(90deg, {[...stops]
				.sort((a, b) => a.position - b.position)
				.map((s) => `${s.color} ${s.position}%`)
				.join(', ')});"
			onclick={onAddStop}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && onAddStop()}
			role="button"
			tabindex="0"
			aria-label="Add gradient stop"
		></div>

		<!-- Stop Handles -->
		{#each stops as stop, i}
			<button
				class="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 active:cursor-grabbing {selectedStopIndex ===
				i
					? 'h-7 w-7 ring-2 ring-blue-500 ring-offset-2'
					: 'h-6 w-6'}"
				style="left: {stop.position}%; background-color: {stop.color};"
				onmousedown={(e) => handleStopMouseDown(i, e)}
				aria-label="Drag to move stop {i + 1}"
			></button>
		{/each}
	</div>
</div>
