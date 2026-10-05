<script lang="ts">
	import { cn } from '$lib/shared/utils';

	interface Props {
		hours: number;
		minutes: number;
		onchange: (h: number, m: number) => void;
		class?: string;
	}

	let { hours, minutes, onchange: parentOnChange, class: className }: Props = $props();

	let view = $state<'hours' | 'minutes'>('hours');
	let isPm = $derived(hours >= 12);
	let displayHours = $derived(hours % 12 === 0 ? 12 : hours % 12);

	function setAmPm(pm: boolean) {
		if (pm && !isPm) {
			parentOnChange(hours + 12, minutes);
		} else if (!pm && isPm) {
			parentOnChange(hours - 12, minutes);
		}
	}

	function handleClockClick(e: MouseEvent) {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const centerX = rect.width / 2;
		const centerY = rect.height / 2;
		const x = e.clientX - rect.left - centerX;
		const y = e.clientY - rect.top - centerY;

		// Calculate angle (0 is up, 90 is right, etc)
		// Math.atan2(y, x) gives angle from x-axis (right) in radians.
		// -PI to PI.
		// We want 0 at top ( -PI/2 ).

		let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
		if (angle < 0) angle += 360;

		// angle is now 0-360 starting from 12 o'clock clockwise.

		if (view === 'hours') {
			let value = Math.round(angle / 30);
			if (value === 0) value = 12;

			// Handle 12h format logic
			let newHours = value;
			if (value === 12) {
				newHours = isPm ? 12 : 0;
			} else {
				newHours = isPm ? value + 12 : value;
			}

			parentOnChange(newHours, minutes);
			// Auto switch to minutes
			setTimeout(() => (view = 'minutes'), 300);
		} else {
			let value = Math.round(angle / 6);
			if (value === 60) value = 0;
			parentOnChange(hours, value);
		}
	}

	// Calculate hand rotation
	let handRotation = $derived.by(() => {
		if (view === 'hours') {
			return (displayHours % 12) * 30; // 360 / 12 = 30
		} else {
			return minutes * 6; // 360 / 60 = 6
		}
	});

	const CLOCK_SIZE = 256;
	const RADIUS = CLOCK_SIZE / 2 - 32; // Padding
</script>

<div class={cn('flex flex-col items-center gap-6', className)}>
	<!-- Digital Display & AM/PM Toggle -->
	<div class="flex items-center gap-4">
		<button
			type="button"
			onclick={() => (view = 'hours')}
			class={cn(
				'rounded px-2 py-1 text-5xl font-normal transition-colors',
				view === 'hours'
					? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
					: 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400'
			)}
		>
			{String(displayHours).padStart(2, '0')}
		</button>
		<span class="pb-2 text-5xl font-light text-slate-300 dark:text-slate-600">:</span>
		<button
			type="button"
			onclick={() => (view = 'minutes')}
			class={cn(
				'rounded px-2 py-1 text-5xl font-normal transition-colors',
				view === 'minutes'
					? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
					: 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400'
			)}
		>
			{String(minutes).padStart(2, '0')}
		</button>

		<div class="ml-2 flex flex-col gap-1">
			<button
				type="button"
				onclick={() => setAmPm(false)}
				class={cn(
					'rounded border px-2 py-1 text-xs font-bold transition-colors',
					!isPm
						? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
						: 'border-transparent text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800'
				)}
			>
				AM
			</button>
			<button
				type="button"
				onclick={() => setAmPm(true)}
				class={cn(
					'rounded border px-2 py-1 text-xs font-bold transition-colors',
					isPm
						? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
						: 'border-transparent text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800'
				)}
			>
				PM
			</button>
		</div>
	</div>

	<!-- Clock Face -->
	<div class="relative touch-none p-4 select-none">
		<!-- Background Circle -->
		<div
			class="relative flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50"
			style="width: {CLOCK_SIZE}px; height: {CLOCK_SIZE}px;"
			onclick={handleClockClick}
			onkeydown={() => {}}
			role="button"
			tabindex="0"
		>
			<!-- Center Dot -->
			<div class="absolute z-10 h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></div>

			<!-- Clock Hand -->
			<div
				class="pointer-events-none absolute top-0 left-0 h-full w-full transition-transform duration-300 ease-out"
				style="transform: rotate({handRotation}deg);"
			>
				<div
					class="absolute bg-blue-500 dark:bg-blue-400"
					style="
                        height: 40%; 
                        width: 2px; 
                        left: 50%; 
                        top: 10%; 
                        transform: translateX(-50%);
                        transform-origin: bottom center;
                    "
				></div>
				<div
					class="absolute h-8 w-8 rounded-full bg-blue-500 dark:bg-blue-400"
					style="
                        left: 50%; 
                        top: 10%; 
                        transform: translate(-50%, -50%);
                    "
				>
					<!-- Small white dot inside selector for visual flair (optional, pure style) 
                         Actually, standard MUI usually has the text inside this circle. 
                         Since our numbers are separate divs, we just use this as the background. 
                         But wait, if this is on top, it covers the text if text is underneath?
                         The 'Numbers' loop is BELOW in HTML, so 'Numbers' render ON TOP of this Hand.
                         So this blue circle is the background for the active number.
                    -->
				</div>
			</div>

			<!-- Numbers -->
			{#if view === 'hours'}
				{#each [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as hour, i}
					{@const angle = i * 30}
					<!-- 0 is 12, 30 is 1, etc. -->
					<!-- Position using trig. 0deg is top (-PI/2) -->
					{@const rad = (angle - 90) * (Math.PI / 180)}
					{@const x = Math.cos(rad) * RADIUS}
					{@const y = Math.sin(rad) * RADIUS}

					<div
						class={cn(
							'pointer-events-none absolute z-20 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
							displayHours === hour ? 'text-white' : 'text-slate-600 dark:text-slate-400'
						)}
						style="transform: translate({x}px, {y}px);"
					>
						{hour}
					</div>
				{/each}
			{:else}
				{#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute, i}
					{@const angle = i * 30}
					{@const rad = (angle - 90) * (Math.PI / 180)}
					{@const x = Math.cos(rad) * RADIUS}
					{@const y = Math.sin(rad) * RADIUS}

					<div
						class={cn(
							'pointer-events-none absolute z-20 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
							minutes === minute ? 'text-white' : 'text-slate-600 dark:text-slate-400'
						)}
						style="transform: translate({x}px, {y}px);"
					>
						{minute}
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
