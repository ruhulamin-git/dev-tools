<script lang="ts">
	import { Input } from '$lib/shared/components';

	interface Props {
		gradientType: 'linear' | 'radial';
		angle: number;
		onTypeChange: (type: 'linear' | 'radial') => void;
		onAngleChange: (angle: number) => void;
	}

	let { gradientType, angle = $bindable(), onTypeChange, onAngleChange }: Props = $props();

	let isDragging = $state(false);
	let dialRef = $state<HTMLDivElement | null>(null);

	function handleDialMouseDown(e: MouseEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !dialRef) return;

		const rect = dialRef.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const deltaX = e.clientX - centerX;
		const deltaY = e.clientY - centerY;

		let newAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
		if (newAngle < 0) newAngle += 360;

		angle = Math.round(newAngle);
		onAngleChange(angle);
	}

	function handleMouseUp() {
		isDragging = false;
	}

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

<div class="flex flex-col gap-4">
	<h2 class="text-sm font-bold text-slate-900 dark:text-slate-100">Gradient Settings</h2>

	<div class="flex flex-col gap-3">
		<!-- Type Toggle -->
		<div class="flex flex-col gap-1.5">
			<span
				id="gradient-type-label"
				class="text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
				>Type</span
			>
			<div
				role="group"
				aria-labelledby="gradient-type-label"
				class="flex rounded-lg border border-slate-200 p-1 dark:border-slate-800"
			>
				<button
					class="flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition-all {gradientType ===
					'linear'
						? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
						: 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100'}"
					onclick={() => onTypeChange('linear')}
				>
					Linear
				</button>
				<button
					class="flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition-all {gradientType ===
					'radial'
						? 'bg-slate-100 text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
						: 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100'}"
					onclick={() => onTypeChange('radial')}
				>
					Radial
				</button>
			</div>
		</div>

		<!-- Angle Control (only for linear) -->
		{#if gradientType === 'linear'}
			<div class="flex flex-col gap-1.5">
				<label
					for="gradient-angle-input"
					class="text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400"
				>
					Angle (Deg)
				</label>
				<div class="flex items-center gap-3">
					<div
						bind:this={dialRef}
						class="flex h-12 w-12 shrink-0 cursor-grab items-center justify-center rounded-full border-2 border-slate-200 bg-white transition-colors hover:border-blue-500 active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-400 {isDragging
							? 'border-blue-500 ring-2 ring-blue-500/20 dark:border-blue-400 dark:ring-blue-400/20'
							: ''}"
						title="Drag to rotate angle"
						onmousedown={handleDialMouseDown}
						role="slider"
						tabindex="0"
						aria-label="Gradient angle dial"
						aria-valuenow={angle}
						aria-valuemin={0}
						aria-valuemax={360}
					>
						<div
							class="flex h-full w-full items-center justify-center transition-transform"
							style="transform: rotate({angle}deg);"
						>
							<span class="text-lg text-slate-700 dark:text-slate-300">↑</span>
						</div>
					</div>
					<div class="flex flex-1 items-center gap-2">
						<Input
							id="gradient-angle-input"
							type="number"
							value={angle}
							oninput={(e) => {
								angle = parseInt((e.target as HTMLInputElement).value) || 0;
								onAngleChange(angle);
							}}
							min="0"
							max="360"
							class="font-mono"
						/>
						<span class="text-sm font-bold text-slate-400">°</span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
