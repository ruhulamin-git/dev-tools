<script lang="ts">
	import { Label, Input } from '$lib/shared/components/ui';
	import { cn } from '$lib/shared/utils';
	import Calendar from './Calendar.svelte';
	import AnalogClock from './AnalogClock.svelte';

	interface Props {
		value: string;
		onchange: (value: string) => void;
	}

	let { value = $bindable(), onchange }: Props = $props();

	let isOpen = $state(false);
	let pickerView = $state<'date' | 'time'>('date');
	let container: HTMLDivElement;

	// Initialize with empty date if no value provided
	let dateObj = $derived(value && value.trim() ? new Date(value) : null);
	let hours = $state('00');
	let minutes = $state('00');

	// Only update hours/minutes if we have a valid value
	$effect(() => {
		if (value && value.trim()) {
			const d = new Date(value);
			if (!isNaN(d.getTime())) {
				hours = String(d.getHours()).padStart(2, '0');
				minutes = String(d.getMinutes()).padStart(2, '0');
			}
		} else {
			// Reset to 00:00 if no value
			hours = '00';
			minutes = '00';
		}
	});

	function handleDateChange(newDate: Date) {
		// Get current hours and minutes, or default to 00:00
		const h = parseInt(hours) || 0;
		const m = parseInt(minutes) || 0;
		
		// Create a fresh date object with selected date
		const selectedDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), h, m, 0, 0);
		updateValue(selectedDate);
	}

	function handleTimeChange() {
		let h = parseInt(hours);
		let m = parseInt(minutes);

		if (isNaN(h)) h = 0;
		if (isNaN(m)) m = 0;

		h = Math.max(0, Math.min(23, h));
		m = Math.max(0, Math.min(59, m));

		hours = String(h).padStart(2, '0');
		minutes = String(m).padStart(2, '0');

		// Only update if we have a valid date selected
		if (value && value.trim()) {
			const existingDate = new Date(value);
			if (!isNaN(existingDate.getTime())) {
				// Create new date with updated time
				const newDate = new Date(
					existingDate.getFullYear(),
					existingDate.getMonth(),
					existingDate.getDate(),
					h,
					m,
					0,
					0
				);
				updateValue(newDate);
			}
		}
	}

	function updateValue(date: Date) {
		// Format as YYYY-MM-DDTHH:mm for local time compatibility
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const h = String(date.getHours()).padStart(2, '0');
		const m = String(date.getMinutes()).padStart(2, '0');

		const newValue = `${year}-${month}-${day}T${h}:${m}`;
		value = newValue;
		onchange(newValue);
	}

	function handleClickOutside(event: MouseEvent) {
		if (isOpen && container && !container.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	function formatDateDisplay(d: Date) {
		return d.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="space-y-2" bind:this={container}>
	<Label class="mb-2 block">Select Date & Time</Label>
	<div class="relative">
		<button
			type="button"
			onclick={() => (isOpen = !isOpen)}
			class={cn(
				'flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm shadow-sm transition-colors',
				'hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
				'dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-900 dark:focus-visible:ring-blue-500 dark:focus-visible:ring-offset-slate-950'
			)}
		>
			<span class="flex items-center gap-2">
				<svg class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				{#if !value || !value.trim()}
					<span class="text-slate-500">Select date & time...</span>
				{:else if dateObj}
					{formatDateDisplay(dateObj)}
				{:else}
					<span class="text-slate-500">Select date & time...</span>
				{/if}
			</span>
			<svg class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		</button>

		{#if isOpen}
			<div
				class="absolute top-full left-0 z-50 mt-2 w-auto min-w-[320px] rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-950"
			>
				<!-- Tabs or simple vertical layout? Let's stack them for now or use tabs if requested. 
					 User asked for "realistic clock", usually Date and Time are separate views or side-by-side.
					 Let's put them in a responsive column/row or just stack. 
					 Given width constraints, let's try a toggle or just stack.
					 Stack is safe.
				-->
				<!-- Header with View Toggle -->
				<div
					class="mb-4 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800"
				>
					<div class="flex gap-2 text-sm font-semibold">
						<button
							type="button"
							onclick={() => (pickerView = 'date')}
							class={cn(
								'rounded px-2 py-1 transition-colors',
								pickerView === 'date'
									? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
									: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
							)}
						>
							{#if value && value.trim() && dateObj}
								{dateObj.toLocaleDateString(undefined, {
									weekday: 'short',
									month: 'short',
									day: 'numeric'
								})}
							{:else}
								Select Date
							{/if}
						</button>
						<button
							type="button"
							onclick={() => (pickerView = 'time')}
							class={cn(
								'rounded px-2 py-1 transition-colors',
								pickerView === 'time'
									? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
									: 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
							)}
						>
							{hours}:{minutes}
						</button>
					</div>
				</div>

				<div class="mt-2 text-center">
					{#if pickerView === 'date'}
						<Calendar
							value={dateObj || undefined}
							onchange={(newDate) => {
								handleDateChange(newDate);
								setTimeout(() => (pickerView = 'time'), 300);
							}}
							class="mx-auto rounded-md border border-slate-100 dark:border-slate-900"
						/>
					{:else}
						<AnalogClock
							hours={parseInt(hours)}
							minutes={parseInt(minutes)}
							onchange={(h: number, m: number) => {
								hours = String(h).padStart(2, '0');
								minutes = String(m).padStart(2, '0');
								// Don't auto-close, let user verify
								handleTimeChange();
							}}
							class="mx-auto mt-2"
						/>
					{/if}
				</div>

				<div class="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
					<button
						type="button"
						onclick={() => (isOpen = false)}
						class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={() => (isOpen = false)}
						class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
					>
						Set
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
